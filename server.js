const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const TableOrderService = require("./src/service/tableOrder.service");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://quick-serve-client.vercel.app",
    "https://quick-serve-admin.vercel.app",
];

// Middleware: Allow listed frontend origins
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Parse JSON if needed
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// WebSocket handlers
io.on("connection", async (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    const tableOrderService = new TableOrderService();

    // Send chat history
    try {
        const allNotifications = await tableOrderService.findAllNotification();
        socket.emit("chat-history", allNotifications);
    } catch (err) {
        console.error("❌ Error fetching notifications:", err);
    }

    // New notification handler
    socket.on("send-notification", async (data) => {
        try {
            const saved = await tableOrderService.createNotification(data);
            io.emit("new-notification", saved); // Broadcast to all
        } catch (err) {
            console.error("❌ Error saving notification:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

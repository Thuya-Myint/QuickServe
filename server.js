const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const TableOrderService = require("./src/service/tableOrder.service");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://quick-serve-client.vercel.app",
            "https://quick-serve-admin.vercel.app",
        ],
        methods: ["GET", "POST"]
    }
});

const MongoURI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

// Socket.IO logic
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);

    const tableOrderService = new TableOrderService();

    try {
        const allNotifications = await tableOrderService.findAllNotification();
        socket.emit("chat-history", allNotifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
    }

    socket.on("send-notification", async (data) => {
        try {
            const saved = await tableOrderService.createNotification(data);
            io.emit("new-notification", saved);
        } catch (err) {
            console.error("Error saving notification:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ✅ Proper port passed here
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

dotenv.config();

const initializeSocket = require("./src/config/socket");
const configs = require("./src/config");
const { validateRequest } = require("./src/middleware");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

// const allowedOrigins = [
//     "http://localhost:3000",
//     "http://localhost:3001",
//     "http://localhost:5173",
//     "https://shomyn.asia",
//     "https://quick-serve-admin.vercel.app",
// ];
const allowedOrigins = "*"

app.get("/", (req, res) => res.send("Api Start Working!"))
// Connect to MongoDB
mongoose
    .connect(configs.MONGODBURI)
    .then(() => console.log("✅ MongoDB is connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Exit if DB connection fails
    });

// Middleware
// app.use(
//     cors({
//         origin: function (origin, callback) {
//             // Allow requests with no origin like mobile apps or curl requests
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         credentials: false,
//     })
// );
app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Validation middleware before routes
app.use(validateRequest);

// API routes
app.use("/api/v1", require("./src/routes"));

// Health check endpoint (optional but recommended)
app.get("/health", (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? "up" : "down";
    // You can track websocket status inside initializeSocket and expose here if needed
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
            mongo: mongoStatus,
        },
    });
});

// Global error handler - catches any errors from routes/middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Initialize socket.io with the HTTP server and allowed origins
initializeSocket(server, allowedOrigins);

// Start server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

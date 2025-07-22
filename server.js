const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const initializeSocket = require("./src/socket");
const configs = require("./src/config");
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const { Server } = require('socket.io');
const io = new Server(server);
const { validateRequest } = require("./src/middleware")
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://quick-serve-client.vercel.app",
    "https://quick-serve-admin.vercel.app",
];
// Track WebSocket status
let wsConnected = false;

io.on('connection', (socket) => {
    wsConnected = true;
    socket.on('disconnect', () => {
        wsConnected = false;
    });
});
// Connect to MongoDB
mongoose.connect(configs.MONGODBURI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Health check endpoint
app.get('/health', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
    const wsStatus = wsConnected ? 'connected' : 'disconnected';

    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
            mongo: mongoStatus,
            websocket: wsStatus
        }
    });
});

app.use(express.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
    origin: '*',
    credentials: false
}));


app.use("/api/v1", require("./src/routes"));
app.use(validateRequest)
// Initialize socket with the HTTP server and allowed origins
initializeSocket(server, allowedOrigins);

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

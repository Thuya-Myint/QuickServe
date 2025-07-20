const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const initializeSocket = require("./src/socket");
const configs = require("./src/config");
const bodyParser = require('body-parser');
const compression = require('compression');
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

app.use(express.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.use("/api/v1", require("./src/routes"));

mongoose.connect(configs.MONGODBURI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Initialize socket with the HTTP server and allowed origins
initializeSocket(server, allowedOrigins);

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

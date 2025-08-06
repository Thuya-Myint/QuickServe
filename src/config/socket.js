const { Server } = require("socket.io");
const sanitizeHtml = require("sanitize-html");
const TableOrderService = require("../service/tableOrder.service");

// Validation schema with Joi
const notificationSchema = require('../validators/table.validator')

function initializeSocket(server, allowedOrigins) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTION"],
            credentials: false,
        },
    });

    const tableOrderService = new TableOrderService();

    io.on("connection", async (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        try {
            const allTableOrder = await tableOrderService.findAllTableOrder();
            socket.emit("chat-history", allTableOrder);
        } catch (err) {
            console.error("❌ Error fetching notifications:", err);
            socket.emit("error", { message: "Failed to fetch notifications" });
        }

        socket.on("send-notification", async (data) => {
            // Validate input against schema
            const { error, value } = notificationSchema.validate(data);
            if (error) {
                return socket.emit("error", { message: `Validation error: ${error.message}` });
            }

            // Sanitize inputs to prevent injection/XSS
            const sanitizedData = {
                tableNo: sanitizeHtml(value.tableNo),
                message: sanitizeHtml(value.message),
                timestamp: new Date(),
            };

            try {
                const saved = await tableOrderService.createTableOrder(sanitizedData);
                io.emit("new-notification", saved); // Broadcast to all clients
            } catch (err) {
                console.error("❌ Error saving notification:", err);
                socket.emit("error", { message: "Failed to save notification" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = initializeSocket;

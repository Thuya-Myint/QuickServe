const { Server } = require("socket.io");
const sanitizeHtml = require("sanitize-html");
const FlightOrderService = require("../services/flightOrder.service");
const { createFlightOrderSchema } = require("../validators/flightOrder.validator");

function initializeSocket(server, allowedOrigins) {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: false,
        },
    });

    const flightOrderService = new FlightOrderService();

    io.on("connection", async (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        try {
            const allOrders = await flightOrderService.findAllOrders();
            socket.emit("flight-order-history", allOrders);
        } catch (err) {
            console.error("❌ Error fetching flight orders:", err);
            socket.emit("error", { message: "Failed to fetch flight orders" });
        }

        socket.on("send-flight-order", async (data) => {
            // Validate input using Joi schema
            const { error, value } = createFlightOrderSchema.validate({ body: data }, { abortEarly: false });
            if (error) {
                return socket.emit("error", { message: `Validation error: ${error.details.map(d => d.message).join(", ")}` });
            }

            // Sanitize each string field before saving
            const sanitizedData = {
                flightNumber: sanitizeHtml(value.body.flightNumber),
                departure: sanitizeHtml(value.body.departure),
                destination: sanitizeHtml(value.body.destination),
                departureDate: new Date(value.body.departureDate),
                passengerCount: value.body.passengerCount,
                price: value.body.price,
                customerName: sanitizeHtml(value.body.customerName),
                contactNumber: sanitizeHtml(value.body.contactNumber),
                specialRequests: value.body.specialRequests ? sanitizeHtml(value.body.specialRequests) : undefined,
            };

            try {
                const savedOrder = await flightOrderService.createOrder(sanitizedData);
                io.emit("new-flight-order", savedOrder); // Broadcast to all clients
            } catch (err) {
                console.error("❌ Error saving flight order:", err);
                socket.emit("error", { message: "Failed to save flight order" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = initializeSocket;

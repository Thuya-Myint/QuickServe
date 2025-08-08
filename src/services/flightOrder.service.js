const flightOrderModelFactory = require("../models/flightOrder.model");
const { getCurrentDate } = require("../helper/common.helper");

class TableOrderService {
    constructor() {
        // Dynamically name collection based on current date
        this.collectionName = `FlightOrder${getCurrentDate()}`;
        this.model = flightOrderModelFactory(this.collectionName);
    }

    /**
     * Create a new flight order
     * @param {Object} orderData
     * @returns {Promise<Object>}
     */
    async createOrder(orderData) {
        return await this.model.create(orderData);
    }

    /**
     * Find latest flight orders (max 100)
     * Sorted by creation time (newest first)
     * @returns {Promise<Array>}
     */
    async findAllOrders() {
        return await this.model.find().sort({ createdAt: -1 }).limit(100);
    }
}

module.exports = TableOrderService;

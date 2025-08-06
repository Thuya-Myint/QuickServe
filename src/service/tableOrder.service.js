const tableOrderModelFactory = require("../models/tableOrder.model");
const { getCurrentDate } = require("../helper/common.helper");

class TableOrderService {
    constructor() {
        this.tableOrderCollectionName = `TableOrder${getCurrentDate()}`;
        this.tableOrderModel = tableOrderModelFactory(this.tableOrderCollectionName);
    }

    async createTableOrder(notification) {
        return await this.tableOrderModel.create(notification);
    }

    async findAllTableOrder() {
        return await this.tableOrderModel.find().sort({ timestamp: -1 }).limit(100);
    }
}

module.exports = TableOrderService;

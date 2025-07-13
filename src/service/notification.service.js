const notificationModelFactory = require("../models/notification.model");
const { getCurrentDate } = require("../helper/common.helper");

class NotificationService {
    constructor() {
        this.notificationCollectionName = `notification${getCurrentDate()}`;
        this.notificationModel = notificationModelFactory(this.notificationCollectionName);
    }

    async createNotification(notification) {
        return await this.notificationModel.create(notification);
    }

    async findAllNotification() {
        return await this.notificationModel.find().sort({ timestamp: -1 }).limit(100);
    }
}

module.exports = NotificationService;

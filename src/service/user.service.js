const userModelFactory = require("../models/user.model");

class UserService {
    constructor() {
        this.userCollectionName = `users`;
        this.userModel = userModelFactory(this.userCollectionName);
    }

    async createUser(userData) {
        return await this.userModel.create(userData);
    }

    async findAllUsers() {
        return await this.userModel.find().sort({ createdAt: -1 });
    }

    async findUserByEmail(email) {
        return await this.userModel.findOne({ email });
    }

    async updateUserById(userId, updateData) {
        return await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async deleteUserById(userId) {
        return await this.userModel.findByIdAndDelete(userId);
    }
}

module.exports = UserService;

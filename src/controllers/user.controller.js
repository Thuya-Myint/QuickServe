const UserService = require("../service/user.service");
const {
    encryption,
    comparison,
} = require("../helper/encryptDecrypt"); // adjust path if needed

const userService = new UserService();

// --- Register a new user ---
const registerUser = async (req, res) => {
    try {
        const { email, password, name, ...rest } = req.body;
        // console.log("name ---- ", name)

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "Name, email and password  are required." });
        }

        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already in use." });
        }

        const hashedPassword = encryption(password);
        const newUser = await userService.createUser({
            email,
            password: hashedPassword,
            name,
            ...rest,
        });

        const { password: _, ...userSafe } = newUser.toObject ? newUser.toObject() : newUser;
        res.status(201).json({ success: true, data: userSafe });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Get all users ---
const getUsers = async (_req, res) => {
    try {
        const users = await userService.getAllUsers();
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json({ success: true, data: safeUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Login ---
const loginUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log("pass -----", password, email)
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name , email and password are required." });
        }

        const user = await userService.findUserByEmail(email);
        console.log("User -------- ", user)
        if (!user || !comparison(password, user.password)) {
            return res.status(401).json({ success: false, message: "User with this email not existed." });
        }

        const { password: _, ...userSafe } = user.toObject ? user.toObject() : user;
        res.json({ success: true, message: "Login successful", data: userSafe });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Update user ---
const updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = encryption(updates.password);
        }
        console.log("Body", req.body)
        const updatedUser = await userService.updateUser(req.params.id, updates);
        const { password: _, ...userSafe } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
        res.json({ success: true, data: userSafe });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Delete user ---
const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerUser,
    getUsers,
    loginUser,
    updateUser,
    deleteUser,
};


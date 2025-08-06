const jwt = require("jsonwebtoken");
const config = require('../config')

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.SECRETKEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "User Not Unthorized!", success: false });
        }
        logger.info(`decoded: ${JSON.stringify(decoded)}`)
        req.userId = decoded.id;
        req.role = decoded.role;
        req.name = decoded.name;
        req.email = decoded.email;
        next();
    });
};

const getCurrentUser = (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            message: "No token provided!",
        });
    }

    return jwt.verify(token, config.SECRETKEY, (err, decoded) => {
        console.log("Decoded", decoded);
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!",
            });
        }
        return decoded;
    });
};

const restrictTo = (...roles) => {

    return (req, res, next) => {
        // roles ['admin', 'saleman']

        if (!roles.includes(req.role)) {
            return res.status(400).json({
                success: false,
                message: "Do Not Have Permission!",
            });
        }

        next();
    };
};

module.exports = { verifyToken, getCurrentUser, restrictTo };

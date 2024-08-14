const jwt = require("jsonwebtoken");
const Registeration = require("../model/signup");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing" });
        }

        const verify = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Registeration.findOne({ _id: verify._id, 'tokens.token': token });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Invalid authentication token" });
    }
}

module.exports = auth;

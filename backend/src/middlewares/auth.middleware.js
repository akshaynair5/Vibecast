import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.error("No token provided");
            return res.status(401).json({ message: "Unauthorized Request" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            console.error("JWT verification failed:", err.message);
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            console.error("User not found for token:", decodedToken._id);
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Unexpected error in verifyJWT:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

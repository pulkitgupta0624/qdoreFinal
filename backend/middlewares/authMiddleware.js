import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import User from "../models/user.js";
import asyncHandler from "./asyncHandler.js";
import serviceAccount from "./qdecor-cffd2-firebase-adminsdk-howdo-a66195b0f6.json" assert { type: "json" };

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Token received:", token);

    try {
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded token:", decodedToken);

      // Find the user in MongoDB
      const user = await User.findOne({ email: decodedToken.email });
      if (!user) {
        return res.status(404).json({ message: "User not found in MongoDB" });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in auth middleware:", error); // Log the full error object
      return res
        .status(401)
        .json({
          message: "Not authorized, token failed",
          error: error.message,
        });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export { authenticate, authorizeAdmin };

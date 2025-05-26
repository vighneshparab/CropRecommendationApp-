import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Make sure to import User model

// Main authentication function
const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // Verify user exists

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

// Admin authorization function
const authorizeAdmin = (req, res, next) => {
  if (req.user.credentials.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
  next();
};

// Export as both default and named exports
export default authenticate;
export { authorizeAdmin };

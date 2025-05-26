import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import upload from "../utils/upload.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send email (Nodemailer)
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-credentials.password -otp -otpExpiration"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.credentials.name,
        email: user.credentials.email,
        role: user.credentials.role,
        bio: user.profile.bio,
        contact: user.profile.contact,
        location: user.preferences.location,
        preferredCrops: user.preferences.preferredCrops,
        profilePicture: user.profile.picture,
        activityCount: user.activityCount,
        recentActivities: user.recentActivities,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate OTP and send it via email
const generateAndSendOTP = async (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const user = await User.findOne({ "credentials.email": email });

  if (!user) {
    throw new Error("User not found");
  }

  user.otp = otp;
  user.otpExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes
  await user.save();

  await sendEmail(email, "Password Update OTP", `Your OTP is: ${otp}`);
};

// Request OTP for password update
export const requestPasswordUpdateOTP = async (req, res) => {
  const { email } = req.body;

  try {
    await generateAndSendOTP(email);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google login handler
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ "credentials.email": email });
    if (!user) {
      user = new User({
        credentials: {
          name,
          email,
          password: "google_oauth",
          role: "farmer",
        },
        profile: { picture },
      });
      await user.save();
    }

    const tokenResponse = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token: tokenResponse, user });
  } catch (error) {
    res.status(500).json({ error: "Google login failed" });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ "credentials.email": email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = new User({
      credentials: {
        name,
        email,
        password: hashedPassword,
        role: "farmer",
      },
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "credentials.email": email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.credentials.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Update user password
export const updatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ "credentials.email": email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.otp !== otp || Date.now() > user.otpExpiration) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.credentials.password = hashedPassword;

    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Password update failed" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  const { picture, bio, contact } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (picture) user.profile.picture = picture;
    if (bio) user.profile.bio = bio;
    if (contact) user.profile.contact = contact;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed" });
  }
};

// Handle file upload for profile picture
export const uploadProfilePicture = (req, res) => {
  upload.single("profilePicture")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const user = await User.findById(req.user._id);
      user.profile.picture = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({ message: "Profile picture uploaded", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to save picture" });
    }
  });
};

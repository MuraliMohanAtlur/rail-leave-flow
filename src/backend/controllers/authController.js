import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Inspector } from "../models/inspectorModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-dev";
const JWT_EXPIRES_IN = "7d";

export async function signup(req, res) {
  try {
    const { name, email, password, stationName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await Inspector.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return res.status(400).json({ error: "An inspector with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const inspector = await Inspector.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      stationName,
    });

    const token = jwt.sign(
      { id: inspector._id, email: inspector.email, name: inspector.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: inspector._id,
        name: inspector.name,
        email: inspector.email,
        stationName: inspector.stationName,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "An error occurred during signup" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const inspector = await Inspector.findOne({ email: email.toLowerCase() });
    if (!inspector) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, inspector.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: inspector._id, email: inspector.email, name: inspector.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: inspector._id,
        name: inspector.name,
        email: inspector.email,
        stationName: inspector.stationName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An error occurred during login" });
  }
}

export async function getMe(req, res) {
  try {
    const inspector = await Inspector.findById(req.user.id).select("-password").lean();
    if (!inspector) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: inspector });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
}

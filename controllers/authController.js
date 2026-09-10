const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Checks that the email domain matches an allowed college domain
const isCollegeEmail = (email) => {
  const allowedDomains = (process.env.ALLOWED_COLLEGE_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (allowedDomains.length === 0) return true; // no restriction configured
  return allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password || !college) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }

    if (!isCollegeEmail(email)) {
      res.status(400);
      throw new Error("Please register with a valid college email address");
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college,
      isVerified: true, // simplified: real email verification flow can be added later
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      role: user.role,
      trustScore: user.trustScore,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      role: user.role,
      trustScore: user.trustScore,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/profile
// @access Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile };

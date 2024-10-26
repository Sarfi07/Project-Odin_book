import express from "express";
import asyncHandler from "express-async-handler";
import authMiddleware from "../utils/authMiddleware.js";
import { generateToken, verifyToken } from "../utils/jwtUtils.js";
import bcrypt from "bcrypt";
import prisma from "../utils/prismaClient.js";
import passport from "../config/passport.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
const router = express.Router();

router.get(
  "/",
  asyncHandler((req, res) => {
    // todo
    res.json({ message: "local auth route" });
  })
);

router.get("/dashboard", (req, res) => {
  res.json({ message: "Dashboard route" });
});

router.post("/login", authMiddleware("local"));

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    // todo
    const { username, name, password } = req.body;
    try {
      const hasedPassword = await bcrypt.hash(password, 10);

      // check if username already exists or not;
      const userExists = await prisma.user.findMany({
        where: {
          username,
        },
      });

      console.log(userExists);
      if (!userExists.length) {
        const user = await prisma.user.create({
          data: {
            username,
            name,
            password: hasedPassword,
            profileImage:
              "https://res.cloudinary.com/dyzzyyud5/image/upload/c_thumb,w_200,g_face/v1719008261/k6ojmud9bxrj8omhfm9i.png",
          },
        });

        return res.json({ message: "Signed Up successfully.", success: true });
      } else {
        // user already exists
        return res.status(403).json({
          message: "Username already exists, try a different one.",
          success: false,
        });
      }
    } catch (err) {
      console.error("Failed to sign up user:", name);
      return res.status(500).send(err);
    }
  })
);

router.post(
  "/verifyToken",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    try {
      // todo
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          return res.json({ success: true });
        }
      } else {
        return res.json({ success: false, err: new Error("Token missing.") });
      }
    } catch (err) {
      return res.json({ success: false, err });
    }
  })
);

// OAuth Routes
router.get("/github", passport.authenticate("github"));

router.get("/github/callback", authMiddleware("github"));

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", authMiddleware("google"));

router.post("/guest-signin", async (req, res) => {
  try {
    // todo
    const guestUsername = `guest_${uuidv4()}`;

    const guestUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        username: guestUsername,
        name: "Guest user",
        bio: "Temporary guest user",
        profileImage:
          "https://res.cloudinary.com/dyzzyyud5/image/upload/c_thumb,w_200,g_face/v1719008261/k6ojmud9bxrj8omhfm9i.png",
      },
    });

    const token = generateToken(guestUser);

    return res.json({ token });
  } catch (err) {
    return res.json({ err });
  }
});

export default router;

import express from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import passport from "../config/passport.js";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(201).json({ message: "Hello World!" });
});

router.use("/auth", authRouter);
router.use(
  "/user",
  (req, res, next) => {
    passport.authenticate(
      "jwt",
      {
        session: false,
        failureRedirect: "/auth/login",
      },
      (err, user, info) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Server errro during athentication" });
        }

        if (!user) {
          return res
            .status(401)
            .json({ message: "Unauthorized. Invalid or missing token" });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  },
  userRouter
);

export default router;

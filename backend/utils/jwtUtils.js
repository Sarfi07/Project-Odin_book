import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRATION_TIME = "48h";

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, SECRET_KEY, {
    expiresIn: EXPIRATION_TIME,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";

export const generateTokenAndSetCookie = (userID, res) => {
  const token = jwt.sign({ userID }, ENV_VARS.JWT_SECRET, { expiresIn: "15d" });

  res.cookie("jwt-calendar-api", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in millisecs
    httpOnly: true,
    sameSite: "strict",
    secure: ENV_VARS.NODE_ENV !== "development",
  });

  return token;
};

import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { ENV_VARS } from "../config/envVars.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-calendar-api"];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid token" });
    }

    const userByID = await db.query(
      "SELECT * FROM calendarAPI_schema.users WHERE id=$1;",
      [decoded.userID]
    );

    if (userByID.rows[0].length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userByID.rows[0];
    delete user["password"]; //show user without the password

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware.", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

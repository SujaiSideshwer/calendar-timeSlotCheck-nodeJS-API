import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/api.route.js";

import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";

const app = express();
const port = ENV_VARS.BACKEND_SERVER_PORT;

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

if (ENV_VARS.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server started at ${port}`);
  connectDB();
});

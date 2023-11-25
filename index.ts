import * as express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./src/routes";
import path from "path";
import Exceptionhandler from "./src/utils/exceptionhandler";
import cors from "cors";

const app = express.default();

dotenv.config({
  path: ".env",
});

// Connect to the MongoDB database
mongoose.connect(process.env.DB_URL!);
mongoose.connection.on("connected", () => {
  console.log("Database connected");
});
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to the database:", err.message);
});

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(cors());
app.use("/api/v1", router);

app.use(Exceptionhandler);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Not found error",
  });
});

app.listen(process.env.PORT ?? 5000, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

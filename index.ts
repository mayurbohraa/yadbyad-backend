import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./src/routes";
import path from "path";
import Exceptionhandler from "./src/utils/exceptionhandler";
import cors from "cors";
import dns from "dns";

const app = express();

dotenv.config({
  path: ".env",
});

const dnsServers =
  process.env.DNS_SERVERS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

if (dnsServers.length) {
  // Ensures SRV/TXT lookups (mongodb+srv) don't go through a broken local DNS proxy.
  dns.setServers(dnsServers);
}

const dbUrl = process.env.DB_URL?.trim() ?? "";
const port = Number(process.env.PORT ?? 5000);

if (!dbUrl) {
  console.error("Missing DB_URL environment variable");
  process.exit(1);
}

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(cors());
app.use("/api/v1", router);
app.use('/api/v1/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(Exceptionhandler);
app.use((req, res) => {
  res.status(404).json({
    message: "Not found error",
  });
});

async function startApp() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server started at ${port}`);
    });
  } catch (err: unknown) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
}

startApp();

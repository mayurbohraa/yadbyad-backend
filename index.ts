import cors from "cors";
import dns from "node:dns";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import router from "./src/routes";
import Exceptionhandler from "./src/utils/exceptionhandler";
import { uploadsDirectory } from "./src/utils/upload.middleware";

dotenv.config({ path: ".env" });

const app = express();
let pendingConnection: Promise<typeof mongoose> | undefined;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;

  if (!pendingConnection) {
    const dbUrl = process.env.DB_URL?.trim();
    if (!dbUrl) throw new Error("Missing DB_URL environment variable");

    const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
    if (dnsServers?.length) dns.setServers(dnsServers);

    // Concurrent requests during a cold start share the same connection attempt.
    pendingConnection = mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 8000 })
      .finally(() => { pendingConnection = undefined; });
  }

  await pendingConnection;
}

app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
  res.json({ service: "Yad Byad API", status: "running" });
});
app.use("/api/v1/uploads", express.static(uploadsDirectory));
app.use("/api/v1", async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database unavailable:", error instanceof Error ? error.name : "Unknown error");
    res.status(503).json({ message: "Database temporarily unavailable." });
  }
});
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ready" });
});
app.use("/api/v1", router);
app.use(Exceptionhandler);
app.use((_req, res) => {
  res.status(404).json({ message: "Not found error" });
});

if (require.main === module && !process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 5000);
  connectDatabase()
    .then(() => {
      app.listen(port, () => console.log(`Server started at ${port}`));
    })
    .catch((error: unknown) => {
      console.error("Backend startup failed:", error instanceof Error ? error.name : "Unknown error");
      process.exitCode = 1;
    });
}

export default app;

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/auth";
import classesRoutes from "./routes/classes";
import lectureRoutes from "./routes/lectures";
import { authOptional } from "./middleware/auth";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use("/api", rateLimit({ windowMs: 60_000, max: 100 }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(authOptional);

app.use("/api/auth", authRoutes);
app.use("/api/classes", classesRoutes);   
app.use("/api/classes", lectureRoutes);   

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

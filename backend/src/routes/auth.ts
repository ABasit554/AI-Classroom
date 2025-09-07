import { Router, Request, Response } from "express";
import prisma from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { authRequired } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "token";
const COOKIE_SECURE = process.env.NODE_ENV === "production";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

function setTokenCookie(res: Response, payload: { id: string; name: string; email: string; role: Role }) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL_SEC });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    maxAge: TOKEN_TTL_SEC * 1000,
    path: "/",
  });
}

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string; email?: string; password?: string; role?: Role;
    };
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role && Object.values(Role).includes(role) ? role : Role.STUDENT,
      },
    });

    setTokenCookie(res, { id: user.id, name: user.name, email: user.email, role: user.role });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    setTokenCookie(res, { id: user.id, name: user.name, email: user.email, role: user.role });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", authRequired, (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", authRequired, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router;

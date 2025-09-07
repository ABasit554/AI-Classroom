import { Request, Response, NextFunction } from "express";

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!role || !allowed.includes(String(role).toUpperCase())) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

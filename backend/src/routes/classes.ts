import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();


router.get("/:code", async (req: Request<{ code: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();

    const course = await prisma.course.findUnique({
      where: { code },
      include: { lectures: { orderBy: { date: "desc" } } },
    });

    if (!course) return res.status(404).json({ error: "Class not found" });
    return res.json(course);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/:code/lectures", async (req: Request<{ code: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();

    const course = await prisma.course.findUnique({
      where: { code },
      include: { lectures: { orderBy: { date: "desc" } } },
    });

    if (!course) return res.json({ items: [] });

    return res.json({ items: course.lectures });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

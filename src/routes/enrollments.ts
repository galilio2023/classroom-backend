import express from "express";
import { and, eq, desc, count, SQL, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, departments, enrollments, subjects } from "../db/schema/app.js";
import { user } from "../db/schema/auth.js";

const router = express.Router();

// GET /enrollments - This route now correctly handles simple filters and returns the expected JSON structure.
router.get("/", async (req, res) => {
  try {
    const { page = '1', limit = '10', classId } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const whereConditions: SQL[] = [];
    if (classId) {
      whereConditions.push(eq(enrollments.classId, Number(classId)));
    }
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const countResult = await db
      .select({ value: count() })
      .from(enrollments)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const enrollmentsList = await db
      .select({
        id: enrollments.id,
        createdAt: enrollments.createdAt,
        student: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(enrollments)
      .leftJoin(user, eq(enrollments.studentId, user.id))
      .where(whereClause)
      .orderBy(desc(enrollments.createdAt))
      .limit(limitNumber)
      .offset((pageNumber - 1) * limitNumber);

    res.json({
      data: enrollmentsList,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(`GET /enrollments error: ${error}`);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// POST /enrollments/join - Join class by invite code
router.post("/join", async (req, res) => {
  try {
    const { inviteCode, studentId } = req.body;

    if (!inviteCode || !studentId) {
      return res.status(400).json({ error: "inviteCode and studentId are required" });
    }

    const [classRecord] = await db.select().from(classes).where(eq(classes.inviteCode, inviteCode));
    if (!classRecord) return res.status(404).json({ error: "Class not found" });

    const [student] = await db.select().from(user).where(eq(user.id, studentId));
    if (!student) return res.status(404).json({ error: "Student not found" });

    const [existingEnrollment] = await db.select({ id: enrollments.id }).from(enrollments).where(and(eq(enrollments.classId, classRecord.id), eq(enrollments.studentId, studentId)));
    if (existingEnrollment) return res.status(409).json({ error: "Student already enrolled in class" });

    const [createdEnrollment] = await db.insert(enrollments).values({ classId: classRecord.id, studentId }).returning({ id: enrollments.id });
    if (!createdEnrollment) return res.status(500).json({ error: "Failed to join class" });

    res.status(201).json({ data: createdEnrollment });
  } catch (error) {
    console.error("POST /enrollments/join error:", error);
    res.status(500).json({ error: "Failed to join class" });
  }
});

export default router;

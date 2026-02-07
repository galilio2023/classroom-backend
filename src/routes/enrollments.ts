import express from "express";
import { and, eq, desc, count } from "drizzle-orm";
import { enrollments, users, classes } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// GET /enrollments - List enrollments (usually filtered by classId or studentId)
router.get("/", async (req, res) => {
  try {
    const { classId, studentId, page = 1, limit = 10 } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    
    const currentPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const limitPerPage = isNaN(limitNumber) || limitNumber < 1 
      ? 10 
      : Math.min(limitNumber, 50);

    const offset = (currentPage - 1) * limitPerPage;
    
    const filterConditions = [];
    
    if (classId) {
      filterConditions.push(eq(enrollments.classId, Number(classId)));
    }

    if (studentId) {
      filterConditions.push(eq(enrollments.studentId, String(studentId)));
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(enrollments)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitPerPage);

    // Get enrollments with relations
    const enrollmentsList = await db
      .select({
        id: enrollments.id,
        createdAt: enrollments.createdAt,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
        class: {
          id: classes.id,
          name: classes.name,
          inviteCode: classes.inviteCode,
        }
      })
      .from(enrollments)
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .leftJoin(classes, eq(enrollments.classId, classes.id))
      .where(whereClause)
      .orderBy(desc(enrollments.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.json({
      data: enrollmentsList,
      pagination: {
        page: currentPage,
        totalPages,
        total: totalCount,
        limit: limitPerPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error(`GET /enrollments error: ${error}`);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// POST /enrollments - Enroll a student in a class
router.post("/", async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    if (!classId || !studentId) {
      res.status(400).json({ error: "Class ID and Student ID are required" });
      return;
    }

    // 1. Check if already enrolled
    const existing = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, Number(classId)),
          eq(enrollments.studentId, String(studentId))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Student is already enrolled in this class" });
      return;
    }

    // 2. Check if class exists and has capacity (Optional but good practice)
    const classCheck = await db
      .select()
      .from(classes)
      .where(eq(classes.id, Number(classId)))
      .limit(1);

    if (classCheck.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    // 3. Create enrollment
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        classId: Number(classId),
        studentId: String(studentId),
      })
      .returning();

    res.status(201).json(newEnrollment);
  } catch (error) {
    console.error(`POST /enrollments error: ${error}`);
    res.status(500).json({ error: "Failed to enroll student" });
  }
});

// DELETE /enrollments/:id - Remove an enrollment (Unenroll)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deleted] = await db
      .delete(enrollments)
      .where(eq(enrollments.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Enrollment not found" });
      return;
    }

    res.json({ message: "Student unenrolled successfully" });
  } catch (error) {
    console.error(`DELETE /enrollments/:id error: ${error}`);
    res.status(500).json({ error: "Failed to unenroll student" });
  }
});

export default router;

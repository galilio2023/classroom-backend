import express from "express";
import { and, eq, desc, count } from "drizzle-orm";
import { enrollments, classes } from "../db/schema/app";
import { user } from "../db/schema/auth"; // Import the correct user table
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
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        class: {
          id: classes.id,
          name: classes.name,
          inviteCode: classes.inviteCode,
        }
      })
      .from(enrollments)
      .leftJoin(user, eq(enrollments.studentId, user.id)) // Use correct user table
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

    // 1. Check if student exists
    const [student] = await db.select({ id: user.id }).from(user).where(eq(user.id, studentId)); // Use correct user table
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Check if already enrolled
    const [existingEnrollment] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.classId, Number(classId)), eq(enrollments.studentId, studentId)));
    if (existingEnrollment) {
      return res.status(409).json({ error: "Student is already enrolled in this class" });
    }

    // 3. Check class capacity
    const [classInfo] = await db
      .select({ capacity: classes.capacity })
      .from(classes)
      .where(eq(classes.id, Number(classId)));

    if (!classInfo) {
      return res.status(404).json({ error: "Class not found" });
    }

    const enrollmentCountResult = await db
      .select({ value: count() })
      .from(enrollments)
      .where(eq(enrollments.classId, Number(classId)));
    
    const currentEnrollmentCount = Number(enrollmentCountResult[0]?.value) ?? 0;

    if (currentEnrollmentCount >= classInfo.capacity) {
      return res.status(409).json({ error: "Class is full" });
    }

    // 4. Create enrollment
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
    const enrollmentId = parseInt(req.params.id, 10);
    if (isNaN(enrollmentId)) {
      return res.status(400).json({ error: "Invalid enrollment ID" });
    }
    
    const [deleted] = await db
      .delete(enrollments)
      .where(eq(enrollments.id, enrollmentId))
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

import express from "express";
import { and, eq, ilike, or, desc, count, SQL } from "drizzle-orm";
import { classes, subjects, departments, enrollments } from "../db/schema/app.js";
import { user } from "../db/schema/auth.js";
import { db } from "../db/index.js";
import { nanoid } from "nanoid";

const router = express.Router();

// GET /classes - List all classes with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, subject, teacher, page = '1', limit = '10' } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;
    
    const filterConditions: SQL[] = [];
    
    if (search) {
      filterConditions.push(ilike(classes.name, `%${search}%`));
    }
    if (subject) {
      // Assuming subject filter is by name, adjust if it's by ID
      const subjectRecord = await db.select({ id: subjects.id }).from(subjects).where(ilike(subjects.name, `%${subject}%`));
      if (subjectRecord.length > 0) {
        filterConditions.push(eq(classes.subjectId, subjectRecord[0].id));
      }
    }
    if (teacher) {
      // Assuming teacher filter is by name, adjust if it's by ID
      const teacherRecord = await db.select({ id: user.id }).from(user).where(ilike(user.name, `%${teacher}%`));
      if (teacherRecord.length > 0) {
        filterConditions.push(eq(classes.teacherId, teacherRecord[0].id));
      }
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db.select({ value: count() }).from(classes).where(whereClause);
    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const classesList = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        bannerUrl: classes.bannerUrl,
        bannerCldPubId: classes.bannerCldPubId,
        capacity: classes.capacity,
        status: classes.status,
        subject: { name: subjects.name },
        teacher: { name: user.name },
      })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause)
      .orderBy(desc(classes.id))
      .limit(limitNumber)
      .offset(offset);

    res.json({
      data: classesList,
      pagination: { total: totalCount, page: pageNumber, limit: limitNumber, totalPages },
    });

  } catch (error) {
    console.error(`GET /classes error: ${error}`);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// GET /classes/:id/users - This is the new endpoint for the ClassShow page
router.get("/:id/users", async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereClause = eq(enrollments.classId, classId);

    const countResult = await db.select({ value: count() }).from(enrollments).where(whereClause);
    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const enrolledUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      })
      .from(enrollments)
      .innerJoin(user, eq(enrollments.studentId, user.id))
      .where(whereClause)
      .orderBy(desc(enrollments.createdAt))
      .limit(limitNumber)
      .offset(offset);

    res.json({
      data: enrolledUsers,
      pagination: { total: totalCount, page: pageNumber, limit: limitNumber, totalPages },
    });
  } catch (error) {
    console.error(`GET /classes/:id/users error: ${error}`);
    res.status(500).json({ error: "Failed to fetch enrolled users" });
  }
});


// GET /classes/:id - Get a single class
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [classItem] = await db.select().from(classes).where(eq(classes.id, Number(id)));
    if (!classItem) return res.status(404).json({ error: "Class not found" });
    res.json({ data: classItem });
  } catch (error) {
    console.error(`GET /classes/:id error: ${error}`);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// POST /classes - Create a new class
router.post("/", async (req, res) => {
  try {
    const [newClass] = await db.insert(classes).values(req.body).returning();
    res.status(201).json({ data: newClass });
  } catch (error) {
    console.error(`POST /classes error: ${error}`);
    res.status(500).json({ error: "Failed to create class" });
  }
});

// Other routes (PUT, DELETE) would go here...

export default router;

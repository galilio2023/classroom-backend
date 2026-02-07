import express from "express";
import { and, eq, ilike, or, desc, count } from "drizzle-orm";
import { classes, subjects, departments } from "../db/schema/app";
import { user } from "../db/schema/auth"; // Import the correct user table
import { db } from "../db";
import { nanoid } from "nanoid";

const router = express.Router();

// GET /classes - List all classes with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, subjectId, teacherId, status, page = 1, limit = 10 } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    
    const currentPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const limitPerPage = isNaN(limitNumber) || limitNumber < 1 
      ? 10 
      : Math.min(limitNumber, 50);

    const offset = (currentPage - 1) * limitPerPage;
    
    const filterConditions = [];
    
    if (search) {
      filterConditions.push(
        or(
          ilike(classes.name, `%${search}%`),
          ilike(classes.inviteCode, `%${search}%`)
        )
      );
    }

    if (subjectId) {
      filterConditions.push(eq(classes.subjectId, Number(subjectId)));
    }

    if (teacherId) {
      filterConditions.push(eq(classes.teacherId, String(teacherId)));
    }

    if (status) {
      filterConditions.push(eq(classes.status, status as "active" | "inactive" | "archived"));
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(classes)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitPerPage);

    // Get classes with relations
    const classesList = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        inviteCode: classes.inviteCode,
        capacity: classes.capacity,
        status: classes.status,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        schedules: classes.schedules,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        teacher: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        department: {
            id: departments.id,
            name: departments.name
        }
      })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id)) // Use correct user table
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(classes.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.json({
      data: classesList,
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
    console.error(`GET /classes error: ${error}`);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// GET /classes/:id - Get a single class
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const classItem = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        inviteCode: classes.inviteCode,
        capacity: classes.capacity,
        status: classes.status,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        schedules: classes.schedules,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        teacher: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        department: {
            id: departments.id,
            name: departments.name
        }
      })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id)) // Use correct user table
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(eq(classes.id, Number(id)))
      .limit(1);

    if (classItem.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.json(classItem[0]);
  } catch (error) {
    console.error(`GET /classes/:id error: ${error}`);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// POST /classes - Create a new class
router.post("/", async (req, res) => {
  try {
    const { name, subjectId, teacherId, description, capacity, status, schedules } = req.body;

    if (!name || !subjectId || !teacherId) {
      res.status(400).json({ error: "Name, Subject, and Teacher are required" });
      return;
    }

    // Generate a unique invite code (6 chars)
    const inviteCode = nanoid(6).toUpperCase();

    const [newClass] = await db
      .insert(classes)
      .values({
        name,
        subjectId: Number(subjectId),
        teacherId,
        description,
        capacity: Number(capacity) || 50,
        status: status || "active",
        inviteCode,
        schedules: schedules || [],
      })
      .returning();

    res.status(201).json(newClass);
  } catch (error) {
    console.error(`POST /classes error: ${error}`);
    res.status(500).json({ error: "Failed to create class" });
  }
});

// PUT /classes/:id - Update a class
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subjectId, teacherId, description, capacity, status, schedules } = req.body;

    const updateData: Partial<typeof classes.$inferInsert> = {};
    if (name) updateData.name = name;
    if (subjectId) updateData.subjectId = Number(subjectId);
    if (teacherId) updateData.teacherId = teacherId;
    if (description !== undefined) updateData.description = description;
    if (capacity) updateData.capacity = Number(capacity);
    if (status) updateData.status = status;
    if (schedules) updateData.schedules = schedules;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updatedClass] = await db
      .update(classes)
      .set(updateData)
      .where(eq(classes.id, Number(id)))
      .returning();

    if (!updatedClass) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.json(updatedClass);
  } catch (error) {
    console.error(`PUT /classes/:id error: ${error}`);
    res.status(500).json({ error: "Failed to update class" });
  }
});

// DELETE /classes/:id - Delete a class
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, Number(id)))
      .returning();

    if (!deletedClass) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error(`DELETE /classes/:id error: ${error}`);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

export default router;

import express from "express";
import { and, eq, ilike, or, sql, getTableColumns, desc } from "drizzle-orm";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// GET /subjects - List all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;
    const filterConditions = [];
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }
    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count for pagination metadata
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limitPerPage);

    // Get the actual subjects with pagination
    const subjectList = await db
      .select({
        ...getTableColumns(subjects),
        department: getTableColumns(departments),
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectList,
      pagination: {
        page: currentPage,
        totalPages,
        total: totalCount,
        limit: limitPerPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (e) {
    console.error(`GET /subjects error: ${e}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

// GET /subjects/:id - Get a single subject by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const subjectId = Number(id);
    if (isNaN(subjectId)) {
      res.status(400).json({ error: "Invalid subject ID" });
      return;
    }

    const subject = await db
      .select({
        ...getTableColumns(subjects),
        department: getTableColumns(departments),
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(eq(subjects.id, subjectId))
      .limit(1);

    if (subject.length === 0) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }

    res.json(subject[0]);
  } catch (error) {
    console.error(`GET /subjects/:id error:`, error); // Improved logging
    res.status(500).json({ error: "Failed to fetch subject", details: String(error) });
  }
});

// POST /subjects - Create a new subject
router.post("/", async (req, res) => {
  try {
    const { code, name, description, departmentId } = req.body;
    
    // Basic validation
    if (!code || !name || !departmentId) {
      res.status(400).json({ error: "Code, name, and departmentId are required" });
      return;
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({ code, name, description, departmentId })
      .returning();

    res.status(201).json(newSubject);
  } catch (error) {
    console.error(`POST /subjects error: ${error}`);
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// PUT /subjects/:id - Update a subject
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, departmentId } = req.body;

    const [updatedSubject] = await db
      .update(subjects)
      .set({ 
        code, 
        name, 
        description, 
        departmentId,
        updatedAt: new Date() // Explicitly update timestamp if needed, though schema handles it
      })
      .where(eq(subjects.id, Number(id)))
      .returning();

    if (!updatedSubject) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }

    res.json(updatedSubject);
  } catch (error) {
    console.error(`PUT /subjects/:id error: ${error}`);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE /subjects/:id - Delete a subject
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedSubject] = await db
      .delete(subjects)
      .where(eq(subjects.id, Number(id)))
      .returning();

    if (!deletedSubject) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error(`DELETE /subjects/:id error: ${error}`);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

export default router;

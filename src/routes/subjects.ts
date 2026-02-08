import express from "express";
import { and, eq, ilike, or, desc, count, SQL } from "drizzle-orm";
import { subjects, departments } from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();

// GET /subjects - List subjects with filtering
router.get("/", async (req, res) => {
  try {
    const { page = '1', limit = '10', search, department } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions: SQL[] = [];
    if (search) {
      whereConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }
    if (department) {
      const deptRecord = await db.select({ id: departments.id }).from(departments).where(ilike(departments.name, `%${department}%`));
      if (deptRecord.length > 0) {
        whereConditions.push(eq(subjects.departmentId, deptRecord[0].id));
      }
    }
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const countResult = await db.select({ value: count() }).from(subjects).where(whereClause);
    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    // Correctly join with the departments table to include department data
    const subjectsList = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        code: subjects.code,
        description: subjects.description,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        department: {
          id: departments.id,
          name: departments.name,
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.id))
      .limit(limitNumber)
      .offset(offset);

    res.json({
      data: subjectsList,
      pagination: { total: totalCount, page: pageNumber, limit: limitNumber, totalPages },
    });
  } catch (error) {
    console.error(`GET /subjects error: ${error}`);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// GET /subjects/:id - Get a single subject
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [subject] = await db
            .select({
                id: subjects.id,
                name: subjects.name,
                code: subjects.code,
                description: subjects.description,
                department: {
                    id: departments.id,
                    name: departments.name,
                },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, Number(id)));

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.json({ data: subject });
    } catch (error) {
        console.error(`GET /subjects/:id error: ${error}`);
        res.status(500).json({ error: "Failed to fetch subject" });
    }
});

// POST /subjects - Create a new subject
router.post("/", async (req, res) => {
    try {
        const { name, code, description, departmentId } = req.body;
        const [newSubject] = await db.insert(subjects).values({ name, code, description, departmentId }).returning();
        res.status(201).json({ data: newSubject });
    } catch (error) {
        console.error(`POST /subjects error: ${error}`);
        res.status(500).json({ error: "Failed to create subject" });
    }
});

// PUT /subjects/:id - Update a subject
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, departmentId } = req.body;
        const [updatedSubject] = await db.update(subjects).set({ name, code, description, departmentId, updatedAt: new Date() }).where(eq(subjects.id, Number(id))).returning();
        if (!updatedSubject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.json({ data: updatedSubject });
    } catch (error) {
        console.error(`PUT /subjects/:id error: ${error}`);
        res.status(500).json({ error: "Failed to update subject" });
    }
});

// DELETE /subjects/:id - Delete a subject
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [deletedSubject] = await db.delete(subjects).where(eq(subjects.id, Number(id))).returning();
        if (!deletedSubject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.json({ data: deletedSubject });
    } catch (error) {
        console.error(`DELETE /subjects/:id error: ${error}`);
        res.status(500).json({ error: "Failed to delete subject" });
    }
});


export default router;

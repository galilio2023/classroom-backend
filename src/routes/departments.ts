import express from "express";
import { and, eq, ilike, or, desc, count, SQL } from "drizzle-orm";
import { departments } from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();

// GET /departments - List all departments with optional search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;
    
    const whereConditions: SQL[] = [];
    if (search) {
      whereConditions.push(
        or(
          ilike(departments.name, `%${search}%`),
          ilike(departments.code, `%${search}%`)
        )
      );
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const countResult = await db.select({ value: count() }).from(departments).where(whereClause);
    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const departmentList = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(desc(departments.createdAt))
      .limit(limitNumber)
      .offset(offset);

    // Return data in the format expected by the custom dataProvider
    res.json({
      data: departmentList,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: totalPages,
      },
    });

  } catch (error) {
    console.error(`GET /departments error: ${error}`);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET /departments/:id - Get a single department
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [department] = await db.select().from(departments).where(eq(departments.id, Number(id)));
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json({ data: department });
  } catch (error) {
    console.error(`GET /departments/:id error: ${error}`);
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

// POST /departments - Create a new department
router.post("/", async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const [newDepartment] = await db.insert(departments).values({ code, name, description }).returning();
    res.status(201).json({ data: newDepartment });
  } catch (error) {
    console.error(`POST /departments error: ${error}`);
    res.status(500).json({ error: "Failed to create department" });
  }
});

// PUT /departments/:id - Update a department
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const [updatedDepartment] = await db.update(departments).set({ code, name, description, updatedAt: new Date() }).where(eq(departments.id, Number(id))).returning();
    if (!updatedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json({ data: updatedDepartment });
  } catch (error) {
    console.error(`PUT /departments/:id error: ${error}`);
    res.status(500).json({ error: "Failed to update department" });
  }
});

// DELETE /departments/:id - Delete a department
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedDepartment] = await db.delete(departments).where(eq(departments.id, Number(id))).returning();
    if (!deletedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json({ data: deletedDepartment });
  } catch (error: any) {
    console.error(`DELETE /departments/:id error: ${error}`);
    if (error.code === '23503') {
      return res.status(400).json({ error: "Cannot delete department because it has associated subjects" });
    }
    res.status(500).json({ error: "Failed to delete department" });
  }
});

export default router;

import express from "express";
import { and, eq, ilike, or, sql, getTableColumns, desc } from "drizzle-orm";
import { departments } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// GET /departments - List all departments with optional search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;
    
    const filterConditions = [];
    if (search) {
      filterConditions.push(
        or(
          ilike(departments.name, `%${search}%`),
          ilike(departments.code, `%${search}%`)
        )
      );
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(departments)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limitPerPage);

    // Get departments
    const departmentList = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(desc(departments.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.json({
      data: departmentList,
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
    console.error(`GET /departments error: ${error}`);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET /departments/:id - Get a single department
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, Number(id)))
      .limit(1);

    if (department.length === 0) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json(department[0]);
  } catch (error) {
    console.error(`GET /departments/:id error: ${error}`);
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

// POST /departments - Create a new department
router.post("/", async (req, res) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: "Code and name are required" });
      return;
    }

    const [newDepartment] = await db
      .insert(departments)
      .values({ code, name, description })
      .returning();

    res.status(201).json(newDepartment);
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

    const [updatedDepartment] = await db
      .update(departments)
      .set({ 
        code, 
        name, 
        description,
        updatedAt: new Date()
      })
      .where(eq(departments.id, Number(id)))
      .returning();

    if (!updatedDepartment) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json(updatedDepartment);
  } catch (error) {
    console.error(`PUT /departments/:id error: ${error}`);
    res.status(500).json({ error: "Failed to update department" });
  }
});

// DELETE /departments/:id - Delete a department
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: This might fail if there are subjects linked to this department
    // due to the foreign key constraint (onDelete: "restrict" in schema)
    const [deletedDepartment] = await db
      .delete(departments)
      .where(eq(departments.id, Number(id)))
      .returning();

    if (!deletedDepartment) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error(`DELETE /departments/:id error: ${error}`);
    // Check for foreign key violation
    if (error.code === '23503') {
      res.status(400).json({ error: "Cannot delete department because it has associated subjects" });
      return;
    }
    res.status(500).json({ error: "Failed to delete department" });
  }
});

export default router;

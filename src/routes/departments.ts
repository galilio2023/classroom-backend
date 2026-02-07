import express from "express";
import { and, eq, ilike, or, getTableColumns, desc, count } from "drizzle-orm";
import { departments } from "../db/schema/app";
import { db } from "../db";

const router = express.Router();

// GET /departments - List all departments with optional search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
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
          ilike(departments.name, `%${search}%`),
          ilike(departments.code, `%${search}%`)
        )
      );
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count using Drizzle's built-in count() function
    const countResult = await db
      .select({ value: count() })
      .from(departments)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;

    // Get departments
    const departmentList = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(desc(departments.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.setHeader("X-Total-Count", totalCount.toString());
    res.json(departmentList);

  } catch (error) {
    console.error(`GET /departments error: ${error}`);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET /departments/:id - Get a single department
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const deptId = Number(id);
    if (isNaN(deptId)) {
      res.status(400).json({ error: "Invalid department ID" });
      return;
    }

    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, deptId))
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

    if (code.length > 50) {
      res.status(400).json({ error: "Code must be 50 characters or less" });
      return;
    }

    if (name.length > 255) {
      res.status(400).json({ error: "Name must be 255 characters or less" });
      return;
    }

    if (description && description.length > 255) {
      res.status(400).json({ error: "Description must be 255 characters or less" });
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

    const deptId = Number(id);
    if (isNaN(deptId)) {
      res.status(400).json({ error: "Invalid department ID" });
      return;
    }

    if (code && code.length > 50) {
      res.status(400).json({ error: "Code must be 50 characters or less" });
      return;
    }

    if (name && name.length > 255) {
      res.status(400).json({ error: "Name must be 255 characters or less" });
      return;
    }

    if (description && description.length > 255) {
      res.status(400).json({ error: "Description must be 255 characters or less" });
      return;
    }

    const [updatedDepartment] = await db
      .update(departments)
      .set({ 
        code, 
        name, 
        description,
        updatedAt: new Date()
      })
      .where(eq(departments.id, deptId))
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
    
    const deptId = Number(id);
    if (isNaN(deptId)) {
      res.status(400).json({ error: "Invalid department ID" });
      return;
    }
    
    const [deletedDepartment] = await db
      .delete(departments)
      .where(eq(departments.id, deptId))
      .returning();

    if (!deletedDepartment) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error(`DELETE /departments/:id error: ${error}`);
    if (error.code === '23503') {
      res.status(400).json({ error: "Cannot delete department because it has associated subjects" });
      return;
    }
    res.status(500).json({ error: "Failed to delete department" });
  }
});

export default router;

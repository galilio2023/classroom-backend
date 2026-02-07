import express from "express";
import { and, eq, ilike, or, sql, getTableColumns, desc, count } from "drizzle-orm";
import { users } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// GET /users - List all users with optional search, role filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    
    const currentPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const limitPerPage = isNaN(limitNumber) || limitNumber < 1 
      ? 10 
      : Math.min(limitNumber, 50);

    const offset = (currentPage - 1) * limitPerPage;
    
    const filterConditions = [];
    
    // Search by name or email
    if (search) {
      filterConditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    // Filter by role (admin, teacher, student)
    if (role) {
      filterConditions.push(eq(users.role, String(role)));
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(users)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitPerPage);

    // Get users
    const userList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.json({
      data: userList,
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
    console.error(`GET /users error: ${error}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /users/:id - Get a single user
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user[0]);
  } catch (error) {
    console.error(`GET /users/:id error: ${error}`);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /users - Create a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Validation
    if (!name || !email || !role) {
      res.status(400).json({ error: "Name, email, and role are required" });
      return;
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be admin, teacher, or student" });
      return;
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const [newUser] = await db
      .insert(users)
      .values({ name, email, role })
      .returning();

    res.status(201).json(newUser);
  } catch (error) {
    console.error(`POST /users error: ${error}`);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /users/:id - Update a user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validation
    if (role && !["admin", "teacher", "student"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        name, 
        email, 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(`PUT /users/:id error: ${error}`);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /users/:id - Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error(`DELETE /users/:id error: ${error}`);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;

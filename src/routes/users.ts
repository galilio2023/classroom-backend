import express from "express";
import { and, eq, ilike, or, desc, count } from "drizzle-orm";
import { user } from "../db/schema/auth";
import { db } from "../db";

const router = express.Router();

// GET /users - List all users with filtering and pagination
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
    
    if (search) {
      filterConditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        )
      );
    }

    if (role) {
      filterConditions.push(eq(user.role, role as "student" | "teacher" | "admin"));
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(user)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value) ?? 0;

    // Get users list
    const usersList = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    // Set the X-Total-Count header for Refine's simpleRestProvider
    res.setHeader("X-Total-Count", totalCount.toString());
    
    // Return the data as a plain array
    res.json(usersList);

  } catch (error) {
    console.error(`GET /users error: ${error}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /users/:id - Get a single user
router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [userItem] = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
      }).from(user).where(eq(user.id, id));
  
      if (!userItem) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(userItem);
    } catch (error) {
      console.error(`GET /users/:id error: ${error}`);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

export default router;

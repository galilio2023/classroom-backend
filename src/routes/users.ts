import express from "express";
import { and, eq, ilike, or, desc, count, SQL } from "drizzle-orm";
import { user } from "../db/schema/auth.js";
import { db } from "../db/index.js";

const router = express.Router();

// GET /users - List users with filtering by role
router.get("/", async (req, res) => {
  try {
    const { page = '1', limit = '10', role, search } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions: SQL[] = [];
    if (role) {
      whereConditions.push(eq(user.role, String(role)));
    }
    if (search) {
      whereConditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        )
      );
    }
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const countResult = await db.select({ value: count() }).from(user).where(whereClause);
    const totalCount = Number(countResult[0]?.value) ?? 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const usersList = await db
      .select()
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitNumber)
      .offset(offset);

    res.json({
      data: usersList,
      pagination: { total: totalCount, page: pageNumber, limit: limitNumber, totalPages },
    });
  } catch (error) {
    console.error(`GET /users error: ${error}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;

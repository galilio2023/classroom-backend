import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized: You must be logged in to access this resource." });
    }

    // Attach the user object to the request.
    // The custom type definition in src/types/express.d.ts makes this type-safe.
    req.user = session.user;

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error during authentication check." });
  }
};

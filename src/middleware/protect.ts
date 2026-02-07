import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use better-auth's server-side API to get the session from the request headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If there is no session, the user is not authenticated.
    if (!session) {
      return res.status(401).json({ message: "Unauthorized: You must be logged in to access this resource." });
    }

    // If there is a session, attach the user to the request object for potential use in later routes
    // (req as any).user = session.user;

    // Proceed to the next middleware or the actual route handler
    next();
  } catch (error) {
    // This will catch any errors from getSession itself
    return res.status(500).json({ message: "Internal Server Error during authentication check." });
  }
};

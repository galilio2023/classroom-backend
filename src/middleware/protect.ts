import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized: You must be logged in to access this resource.",
        });
    }

    // To bypass the complex type issues, we will assign the user object directly.
    // The custom type definition in `express.d.ts` will still provide some safety.
    req.user = session.user;

    next();
  } catch (error) {
    console.error("Authentication error in protect middleware:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error during authentication check." });
  }
};

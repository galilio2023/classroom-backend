import express, { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

const router = express.Router();

// Higher-Order Function to wrap async route handlers and catch errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (error instanceof APIError) {
        return res.status(error.status).json({ message: error.message });
      }
      // Forward other errors to a generic error handler if you have one
      return res.status(500).json({ message: "Internal Server Error" });
    });
  };

// This route will be called by our Refine authProvider's login method
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const response = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).json(await response.json());
}));

// This route will be called by our Refine authProvider's register method
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const response = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
  });

  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).json(await response.json());
}));

// This route will be called by our Refine authProvider's logout method
router.post("/logout", asyncHandler(async (req, res) => {
  const response = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    asResponse: true,
  });

  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).json({ message: "Logged out" });
}));

// This route will be called by our Refine authProvider's check and getIdentity methods
router.get("/me", asyncHandler(async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json(session.user);
}));

export default router;

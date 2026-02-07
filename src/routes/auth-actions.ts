import express from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

const router = express.Router();

// This route will be called by our Refine authProvider's login method
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Use the better-auth server-side API to perform the login
    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true, // Get the full Response object to handle cookies
    });

    // Forward headers (especially the 'set-cookie' header) to the client
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    return res.status(response.status).json(await response.json());
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// This route will be called by our Refine authProvider's register method
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      asResponse: true,
    });

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    return res.status(response.status).json(await response.json());
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// This route will be called by our Refine authProvider's logout method
router.post("/logout", async (req, res) => {
  try {
    const response = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers), // Pass headers to invalidate the correct session
      asResponse: true,
    });

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    return res.status(response.status).json({ message: "Logged out" });
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// This route will be called by our Refine authProvider's check and getIdentity methods
router.get("/me", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json(session.user);
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;

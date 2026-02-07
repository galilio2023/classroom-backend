import { toExpressHandler } from "better-auth/express";
import { auth } from "../lib/auth";

// This single line creates all the necessary API endpoints for Better Auth
// (e.g., /login, /register, /logout, /session) and handles them automatically.
export default toExpressHandler(auth);

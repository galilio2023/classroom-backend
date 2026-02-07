import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

// This single line creates all the necessary API endpoints for Better Auth
// and handles them automatically using the correct Node.js handler.
export default toNodeHandler(auth);

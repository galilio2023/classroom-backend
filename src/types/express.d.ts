// This file extends the Express Request interface to include a 'user' property.
// This allows us to attach the authenticated user's data to the request object
// in a type-safe way.

import { User } from "../db/schema/auth";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

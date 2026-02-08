// By adding 'export {}', we are explicitly telling TypeScript that this file is a module.
// This is necessary for the 'declare global' block to be correctly applied.
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        // These properties are optional, as correctly pointed out.
        image?: string | null | undefined;
        imageCldPubId?: string | null | undefined;
      };
    }
  }
}

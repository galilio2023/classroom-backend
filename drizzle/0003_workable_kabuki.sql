CREATE TYPE "public"."role" AS ENUM('admin', 'teacher', 'student');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
ALTER TABLE "enrollments" RENAME COLUMN "enrolled_at" TO "created_at";--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE role;
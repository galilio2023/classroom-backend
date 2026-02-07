import { integer, pgTable, timestamp, varchar, text, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Shared Timestamps Helper ---
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// --- Enums ---
export const roleEnum = pgEnum("role", ["admin", "teacher", "student"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "archived"]);

// --- Tables ---

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  departmentId: integer("department_id")
    .references(() => departments.id, { onDelete: "restrict" })
    .notNull(),
  ...timestamps,
});

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("student"),
  ...timestamps,
});

export const classes = pgTable("classes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  inviteCode: varchar("invite_code", { length: 20 }).unique(),
  capacity: integer("capacity").default(50),
  status: statusEnum("status").notNull().default("active"),
  bannerUrl: text("banner_url"),
  bannerCldPubId: text("banner_cld_pub_id"),
  subjectId: integer("subject_id")
    .references(() => subjects.id, { onDelete: "restrict" })
    .notNull(),
  teacherId: text("teacher_id")
    .references(() => users.id, { onDelete: "set null" }),
  schedules: json("schedules").$type<{ day: string; startTime: string; endTime: string }[]>().default([]),
  ...timestamps,
});

export const enrollments = pgTable("enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  studentId: text("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  classId: integer("class_id")
    .references(() => classes.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

// --- Relations ---

export const departmentsRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  classes: many(classes),
}));

export const usersRelations = relations(users, ({ many }) => ({
  classesTaught: many(classes),
  enrollments: many(enrollments),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));

// --- TypeScript Types ---

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarSeed: text("avatarSeed").notNull(),
  photo: text("photo").notNull(), // Path to photo file
  totalAttempts: integer("totalAttempts").notNull().default(0),
  correctAttempts: integer("correctAttempts").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const quizAttempts = pgTable("quizAttempts", {
  id: serial("id").primaryKey(),
  studentId: integer("studentId").notNull().references(() => students.id, { onDelete: 'cascade' }),
  correct: boolean("correct").notNull(),
  timeSpent: integer("timeSpent").notNull(), // Time spent in milliseconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Define relations for better querying
export const studentsRelations = relations(students, ({ many }) => ({
  attempts: many(quizAttempts),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  student: one(students, {
    fields: [quizAttempts.studentId],
    references: [students.id],
  }),
}));

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  photo: true,
  avatarSeed: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  studentId: true,
  correct: true,
  timeSpent: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

export interface GameState {
  score: number;
  total: number;
  correct: boolean | null;
  currentStudent?: Student;
  choices?: Student[];
  startTime?: number; // Track when question was shown
}

export interface Statistics {
  overallAccuracy: number;
  totalAttempts: number;
  studentStats: {
    student: Student;
    accuracy: number;
    attempts: number;
  }[];
  recentAttempts: QuizAttempt[];
}
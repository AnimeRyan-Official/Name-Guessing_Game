import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertQuizAttemptSchema, insertStudentSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Initialize the database with predefined students if empty
  await storage.initializeDatabase();

  // Get all students
  app.get("/api/students", async (_req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  // Get statistics
  app.get("/api/statistics", async (_req, res) => {
    const stats = await storage.getStatistics();
    res.json(stats);
  });

  // Record a quiz attempt
  app.post("/api/attempts", async (req, res) => {
    try {
      const attempt = insertQuizAttemptSchema.parse(req.body);
      const recorded = await storage.recordAttempt(attempt);
      await storage.updateStudentStats(attempt.studentId, attempt.correct);
      res.json(recorded);
    } catch (error) {
      res.status(400).json({ error: "Invalid attempt data" });
    }
  });

  // Add a new student
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      // Generate avatarSeed if not provided
      if (!studentData.avatarSeed) {
        studentData.avatarSeed = Math.random().toString(36).substring(7);
      }
      const newStudent = await storage.addStudent(studentData);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error("Error adding student:", error);
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  // Delete a student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      await storage.deleteStudent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  return createServer(app);
}
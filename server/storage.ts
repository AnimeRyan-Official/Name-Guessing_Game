import { students, quizAttempts, type Student, type InsertStudent, type QuizAttempt, type InsertQuizAttempt, type Statistics } from "@shared/schema";
import { predefinedStudents } from "@shared/data/students";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  getStudents(): Promise<Student[]>;
  recordAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getStatistics(): Promise<Statistics>;
  updateStudentStats(studentId: number, correct: boolean): Promise<void>;
  addStudent(student: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  initializeDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  constructor() {
    // No initialization needed for database storage
  }

  async initializeDatabase(): Promise<void> {
    // Check if we have any students in the database
    const existingStudents = await db.select().from(students);
    
    // If no students, initialize with predefined students
    if (existingStudents.length === 0) {
      console.log("Initializing database with predefined students");
      
      for (const predef of predefinedStudents) {
        await this.addStudent({
          name: predef.name,
          photo: predef.photo,
          avatarSeed: Math.random().toString(36).substring(7),
        });
      }
    }
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async recordAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [quizAttempt] = await db
      .insert(quizAttempts)
      .values(attempt)
      .returning();
    
    return quizAttempt;
  }

  async updateStudentStats(studentId: number, correct: boolean): Promise<void> {
    await db
      .update(students)
      .set({
        totalAttempts: sql`${students.totalAttempts} + 1`,
        correctAttempts: correct ? sql`${students.correctAttempts} + 1` : students.correctAttempts,
      })
      .where(eq(students.id, studentId));
  }

  async getStatistics(): Promise<Statistics> {
    // Get all students
    const allStudents = await db.select().from(students);
    
    // Get recent attempts (last 10)
    const recentAttempts = await db
      .select()
      .from(quizAttempts)
      .orderBy(desc(quizAttempts.timestamp))
      .limit(10);
    
    // Calculate total attempts
    const totalAttemptsResult = await db
      .select({ count: sql`count(*)` })
      .from(quizAttempts);
    const totalAttempts = Number(totalAttemptsResult[0]?.count || 0);
    
    // Calculate correct attempts
    const correctAttemptsResult = await db
      .select({ count: sql`count(*)` })
      .from(quizAttempts)
      .where(eq(quizAttempts.correct, true));
    const correctAttempts = Number(correctAttemptsResult[0]?.count || 0);
    
    const overallAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    
    // Map students to their statistics
    const studentStats = allStudents.map(student => {
      // With our updated schema, these should not be null, but we'll handle it just in case
      const accuracy = student.totalAttempts > 0 
        ? (student.correctAttempts / student.totalAttempts) * 100 
        : 0;
      
      return {
        student,
        accuracy,
        attempts: student.totalAttempts
      };
    });
    
    return {
      overallAccuracy,
      totalAttempts,
      studentStats,
      recentAttempts
    };
  }
  
  async addStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    
    return newStudent;
  }
  
  async deleteStudent(id: number): Promise<void> {
    await db
      .delete(students)
      .where(eq(students.id, id));
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();
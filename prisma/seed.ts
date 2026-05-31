import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await hashPassword("Welcome@123");

  // Seed users
  const admin = await prisma.user.create({
    data: {
      email: "admin@studentportal.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: "dr.farooq@studentportal.com",
      password: hashedPassword,
      name: "Dr. Farooq",
      role: "teacher",
    },
  });

  const ayesha = await prisma.user.create({
    data: {
      email: "ayesha.khan@studentportal.com",
      password: hashedPassword,
      name: "Ayesha Khan",
      role: "student",
      program: "BSCS",
    },
  });

  const ahmed = await prisma.user.create({
    data: {
      email: "ahmed.ali@studentportal.com",
      password: hashedPassword,
      name: "Ahmed Ali",
      role: "student",
      program: "BSSE",
    },
  });

  console.log("  Users created");

  // Seed courses
  const cs101 = await prisma.course.create({
    data: {
      courseId: "CS101",
      name: "Programming Fundamentals",
      credits: 3,
      teacherId: teacher.id,
    },
  });

  const cs201 = await prisma.course.create({
    data: {
      courseId: "CS201",
      name: "Data Structures",
      credits: 3,
      teacherId: teacher.id,
    },
  });

  const cs301 = await prisma.course.create({
    data: {
      courseId: "CS301",
      name: "Database Systems",
      credits: 3,
      teacherId: teacher.id,
    },
  });

  const cs401 = await prisma.course.create({
    data: {
      courseId: "CS401",
      name: "Software Engineering",
      credits: 3,
      teacherId: teacher.id,
    },
  });

  console.log("  Courses created");

  // Seed materials
  await prisma.material.createMany({
    data: [
      { courseId: cs101.id, title: "Introduction to Programming", type: "slides", fileUrl: "/materials/cs101/intro.pdf" },
      { courseId: cs101.id, title: "Variables and Data Types", type: "slides", fileUrl: "/materials/cs101/variables.pdf" },
      { courseId: cs201.id, title: "Arrays and Linked Lists", type: "slides", fileUrl: "/materials/cs201/arrays.pdf" },
      { courseId: cs201.id, title: "Trees and Graphs", type: "slides", fileUrl: "/materials/cs201/trees.pdf" },
      { courseId: cs301.id, title: "ER Diagrams", type: "slides", fileUrl: "/materials/cs301/er-diagrams.pdf" },
      { courseId: cs301.id, title: "Normalization", type: "slides", fileUrl: "/materials/cs301/normalization.pdf" },
      { courseId: cs401.id, title: "SDLC Models", type: "slides", fileUrl: "/materials/cs401/sdlc.pdf" },
      { courseId: cs401.id, title: "Requirements Engineering", type: "slides", fileUrl: "/materials/cs401/requirements.pdf" },
    ],
  });

  console.log("  Materials created");

  // Seed assignments
  const cs101A1 = await prisma.assignment.create({
    data: {
      courseId: cs101.id,
      title: "Hello World Program",
      dueDate: new Date("2026-06-15T23:59:59Z"),
    },
  });

  const cs101A2 = await prisma.assignment.create({
    data: {
      courseId: cs101.id,
      title: "Calculator App",
      dueDate: new Date("2026-07-01T23:59:59Z"),
    },
  });

  const cs201A1 = await prisma.assignment.create({
    data: {
      courseId: cs201.id,
      title: "Implement a Linked List",
      dueDate: new Date("2026-06-20T23:59:59Z"),
    },
  });

  const cs301A1 = await prisma.assignment.create({
    data: {
      courseId: cs301.id,
      title: "Design an ER Diagram",
      dueDate: new Date("2026-06-18T23:59:59Z"),
    },
  });

  console.log("  Assignments created");

  // Seed enrollments
  await prisma.enrollment.createMany({
    data: [
      { userId: ayesha.id, courseId: cs101.id },
      { userId: ayesha.id, courseId: cs301.id },
      { userId: ahmed.id, courseId: cs101.id },
      { userId: ahmed.id, courseId: cs201.id },
    ],
  });

  console.log("  Enrollments created");

  // Seed a submission for Ayesha
  await prisma.submission.create({
    data: {
      assignmentId: cs101A1.id,
      userId: ayesha.id,
      fileUrl: "/submissions/ayesha/cs101-hello-world.pdf",
    },
  });

  console.log("  Submissions created");

  console.log("\nSeed completed successfully!");
  console.log("\nTest credentials (all users):");
  console.log("  Password: Welcome@123");
  console.log("  Admin:    admin@studentportal.com");
  console.log("  Teacher:  dr.farooq@studentportal.com");
  console.log("  Student:  ayesha.khan@studentportal.com");
  console.log("  Student:  ahmed.ali@studentportal.com");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

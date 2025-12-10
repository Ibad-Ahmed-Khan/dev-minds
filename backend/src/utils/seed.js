const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");
const Project = require("../models/Project");

dotenv.config();

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "Employee User",
    email: "employee@example.com",
    password: "password123",
    role: "employee",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "employee",
  },
];

const seedProjects = [
  {
    name: "E-commerce Website",
    description:
      "Build a full-featured e-commerce platform with payment integration",
    billing_rate: 50,
    status: "active",
  },
  {
    name: "Mobile App Development",
    description: "Cross-platform mobile application for iOS and Android",
    billing_rate: 65,
    status: "active",
  },
  {
    name: "API Integration",
    description: "Third-party API integration with existing systems",
    billing_rate: 45,
    status: "completed",
  },
  {
    name: "Dashboard Redesign",
    description: "Redesign and improve user dashboard interface",
    billing_rate: 55,
    status: "active",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create projects (assign to admin)
    const adminUser = createdUsers.find((user) => user.role === "admin");

    for (const projectData of seedProjects) {
      const project = await Project.create({
        ...projectData,
        created_by: adminUser._id,
      });
      console.log(`✅ Created project: ${project.name}`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\n🔑 Login Credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("Employee: employee@example.com / password123");
    console.log("\n📊 Sample projects created");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

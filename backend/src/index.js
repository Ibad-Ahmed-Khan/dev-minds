const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// In-memory data storage with time logs
let users = [];
let projects = [];
let timeLogs = [];

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Initialize with sample data
const initializeData = async () => {
  // Hash passwords for all users
  const adminHash = await hashPassword("password123");
  const employeeHash = await hashPassword("password123");
  const ibadHash = await hashPassword("123456");

  // Sample users
  users = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      password: adminHash,
      role: "admin",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      name: "Employee User",
      email: "employee@example.com",
      password: employeeHash,
      role: "employee",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "3",
      name: "Ibad Ahmed Khan",
      email: "ibad@gmail.com",
      password: ibadHash,
      role: "employee",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  // Sample projects
  projects = [
    {
      id: "1",
      name: "E-commerce Website",
      description:
        "Build a full-featured e-commerce platform with payment integration",
      billing_rate: 50,
      status: "active",
      created_by: "1",
      created_at: "2024-01-15T10:30:00.000Z",
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Cross-platform mobile application for iOS and Android",
      billing_rate: 65,
      status: "active",
      created_by: "1",
      created_at: "2024-01-10T14:20:00.000Z",
    },
    {
      id: "3",
      name: "API Integration",
      description: "Third-party API integration project",
      billing_rate: 45,
      status: "completed",
      created_by: "1",
      created_at: "2024-01-05T09:15:00.000Z",
    },
    {
      id: "4",
      name: "Dashboard Redesign",
      description: "Modernize user dashboard interface",
      billing_rate: 55,
      status: "active",
      created_by: "1",
      created_at: "2024-01-20T09:00:00.000Z",
    },
  ];

  // Sample time logs for testing drag & drop
  timeLogs = [
    {
      id: "1",
      project_id: "1",
      user_id: "2",
      hours: 8,
      notes: "User authentication implementation",
      log_date: "2024-01-15T00:00:00.000Z",
      status: "done",
      created_at: "2024-01-15T09:00:00.000Z",
    },
    {
      id: "2",
      project_id: "1",
      user_id: "2",
      hours: 6,
      notes: "Frontend dashboard design",
      log_date: "2024-01-16T00:00:00.000Z",
      status: "in-progress",
      created_at: "2024-01-16T10:30:00.000Z",
    },
    {
      id: "3",
      project_id: "1",
      user_id: "3",
      hours: 7.5,
      notes: "Backend API development",
      log_date: "2024-01-15T00:00:00.000Z",
      status: "done",
      created_at: "2024-01-15T14:20:00.000Z",
    },
    {
      id: "4",
      project_id: "1",
      user_id: "2",
      hours: 4,
      notes: "Database schema design",
      log_date: "2024-01-17T00:00:00.000Z",
      status: "todo",
      created_at: "2024-01-17T11:15:00.000Z",
    },
    {
      id: "5",
      project_id: "2",
      user_id: "3",
      hours: 5,
      notes: "Mobile UI design",
      log_date: "2024-01-18T00:00:00.000Z",
      status: "in-progress",
      created_at: "2024-01-18T13:45:00.000Z",
    },
    {
      id: "6",
      project_id: "2",
      user_id: "2",
      hours: 3,
      notes: "Setup development environment",
      log_date: "2024-01-19T00:00:00.000Z",
      status: "todo",
      created_at: "2024-01-19T10:00:00.000Z",
    },
  ];

  console.log("✅ Database initialized");
  console.log("👤 Users: admin@example.com / password123");
  console.log("👤 Users: employee@example.com / password123");
  console.log("👤 Users: ibad@gmail.com / 123456");
};

// Helper functions
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = users.find((u) => u.id === decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this action",
      });
    }
    next();
  };
};

// Initialize data when server starts
initializeData();

// ====================
// AUTHENTICATION ROUTES
// ====================

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "employee" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "employee",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

// ====================
// PROJECT ROUTES
// ====================

// Get all projects
app.get("/api/projects", authenticateToken, (req, res) => {
  try {
    let filteredProjects = projects;

    // If user is employee, don't show archived projects
    if (req.user.role === "employee") {
      filteredProjects = projects.filter((p) => p.status !== "archived");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const paginatedProjects = filteredProjects.slice(skip, skip + limit);

    // Populate created_by user info
    const populatedProjects = paginatedProjects.map((project) => {
      const createdByUser = users.find((u) => u.id === project.created_by);
      return {
        ...project,
        created_by: {
          id: createdByUser?.id,
          name: createdByUser?.name,
          email: createdByUser?.email,
        },
      };
    });

    res.json({
      success: true,
      count: populatedProjects.length,
      total: filteredProjects.length,
      page,
      totalPages: Math.ceil(filteredProjects.length / limit),
      data: populatedProjects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
    });
  }
});

// Get single project
app.get("/api/projects/:id", authenticateToken, (req, res) => {
  try {
    const project = projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if employee can access (not archived)
    if (req.user.role === "employee" && project.status === "archived") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access archived project",
      });
    }

    // Populate created_by user info
    const createdByUser = users.find((u) => u.id === project.created_by);
    const populatedProject = {
      ...project,
      created_by: {
        id: createdByUser?.id,
        name: createdByUser?.name,
        email: createdByUser?.email,
      },
    };

    res.json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
    });
  }
});

// Create project (Admin only)
app.post("/api/projects", authenticateToken, authorize("admin"), (req, res) => {
  try {
    const { name, description, billing_rate, status = "active" } = req.body;

    // Validation
    if (!name || !billing_rate) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and billing rate",
      });
    }

    if (billing_rate < 0) {
      return res.status(400).json({
        success: false,
        message: "Billing rate cannot be negative",
      });
    }

    // Create new project
    const newProject = {
      id: generateId(),
      name,
      description: description || "",
      billing_rate: Number(billing_rate),
      status,
      created_by: req.user.id,
      created_at: new Date().toISOString(),
    };

    projects.push(newProject);

    // Populate created_by user info
    const populatedProject = {
      ...newProject,
      created_by: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    };

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
    });
  }
});

// Update project (Admin only)
app.put(
  "/api/projects/:id",
  authenticateToken,
  authorize("admin"),
  (req, res) => {
    try {
      const projectIndex = projects.findIndex((p) => p.id === req.params.id);

      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Update project
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...req.body,
        id: req.params.id, // Ensure ID doesn't change
      };

      // Populate created_by user info
      const createdByUser = users.find(
        (u) => u.id === projects[projectIndex].created_by
      );
      const populatedProject = {
        ...projects[projectIndex],
        created_by: {
          id: createdByUser?.id,
          name: createdByUser?.name,
          email: createdByUser?.email,
        },
      };

      res.json({
        success: true,
        data: populatedProject,
      });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating project",
      });
    }
  }
);

// Archive project (Admin only - soft delete)
app.delete(
  "/api/projects/:id",
  authenticateToken,
  authorize("admin"),
  (req, res) => {
    try {
      const projectIndex = projects.findIndex((p) => p.id === req.params.id);

      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Soft delete - change status to archived
      projects[projectIndex].status = "archived";

      // Populate created_by user info
      const createdByUser = users.find(
        (u) => u.id === projects[projectIndex].created_by
      );
      const populatedProject = {
        ...projects[projectIndex],
        created_by: {
          id: createdByUser?.id,
          name: createdByUser?.name,
          email: createdByUser?.email,
        },
      };

      res.json({
        success: true,
        message: "Project archived successfully",
        data: populatedProject,
      });
    } catch (error) {
      console.error("Archive project error:", error);
      res.status(500).json({
        success: false,
        message: "Error archiving project",
      });
    }
  }
);

// ====================
// TIME LOG ROUTES
// ====================

// Get time logs for a project
app.get("/api/timelogs", authenticateToken, (req, res) => {
  try {
    const { project_id, user_id, status, date } = req.query;
    let filteredLogs = timeLogs;

    // Filter by project_id if provided
    if (project_id) {
      filteredLogs = filteredLogs.filter(
        (log) => log.project_id === project_id
      );
    }

    // Filter by user_id if provided (employees can only see their own logs)
    if (user_id) {
      filteredLogs = filteredLogs.filter((log) => log.user_id === user_id);
    } else if (req.user.role === "employee") {
      // Employees can only see their own logs
      filteredLogs = filteredLogs.filter((log) => log.user_id === req.user.id);
    }

    // Filter by status if provided
    if (status) {
      filteredLogs = filteredLogs.filter((log) => log.status === status);
    }

    // Filter by date if provided
    if (date) {
      filteredLogs = filteredLogs.filter((log) =>
        log.log_date.startsWith(date)
      );
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const paginatedLogs = filteredLogs.slice(skip, skip + limit);

    // Populate user info
    const populatedLogs = paginatedLogs.map((log) => {
      const user = users.find((u) => u.id === log.user_id);
      const project = projects.find((p) => p.id === log.project_id);
      return {
        ...log,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
        project: {
          id: project?.id,
          name: project?.name,
        },
      };
    });

    res.json({
      success: true,
      count: populatedLogs.length,
      total: filteredLogs.length,
      page,
      totalPages: Math.ceil(filteredLogs.length / limit),
      data: populatedLogs,
    });
  } catch (error) {
    console.error("Get time logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching time logs",
    });
  }
});

// Create time log
app.post("/api/timelogs", authenticateToken, async (req, res) => {
  try {
    const { project_id, hours, notes, log_date, status = "todo" } = req.body;

    // Validation
    if (!project_id || !hours || !log_date) {
      return res.status(400).json({
        success: false,
        message: "Please provide project_id, hours, and log_date",
      });
    }

    // Check if project exists and is active
    const project = projects.find((p) => p.id === project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Cannot add time logs to archived projects",
      });
    }

    // Check if hours is positive
    if (hours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hours must be positive",
      });
    }

    // Check total hours per day for this user (max 12 hours)
    const logDateStr = new Date(log_date).toISOString().split("T")[0];
    const userDailyHours = timeLogs
      .filter(
        (log) =>
          log.user_id === req.user.id && log.log_date.startsWith(logDateStr)
      )
      .reduce((sum, log) => sum + log.hours, 0);

    if (userDailyHours + hours > 12) {
      return res.status(400).json({
        success: false,
        message: "Total hours per day cannot exceed 12 hours",
      });
    }

    // Create new time log
    const newTimeLog = {
      id: generateId(),
      project_id,
      user_id: req.user.id,
      hours: Number(hours),
      notes: notes || "",
      log_date: new Date(log_date).toISOString(),
      status,
      created_at: new Date().toISOString(),
    };

    timeLogs.push(newTimeLog);

    // Populate user and project info
    const user = users.find((u) => u.id === req.user.id);
    const populatedLog = {
      ...newTimeLog,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      project: {
        id: project.id,
        name: project.name,
      },
    };

    res.status(201).json({
      success: true,
      data: populatedLog,
    });
  } catch (error) {
    console.error("Create time log error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating time log",
    });
  }
});

// Update time log
app.put("/api/timelogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, notes, status } = req.body;

    const logIndex = timeLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check authorization: employee can only update their own logs
    if (
      req.user.role === "employee" &&
      timeLogs[logIndex].user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this time log",
      });
    }

    // Update time log
    const updatedLog = {
      ...timeLogs[logIndex],
      ...(hours !== undefined && { hours: Number(hours) }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
    };

    // Validation for hours
    if (hours !== undefined && hours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hours must be positive",
      });
    }

    timeLogs[logIndex] = updatedLog;

    // Populate user and project info
    const user = users.find((u) => u.id === updatedLog.user_id);
    const project = projects.find((p) => p.id === updatedLog.project_id);
    const populatedLog = {
      ...updatedLog,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      project: {
        id: project?.id,
        name: project?.name,
      },
    };

    res.json({
      success: true,
      data: populatedLog,
    });
  } catch (error) {
    console.error("Update time log error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating time log",
    });
  }
});

// Update time log status (for drag & drop)
app.put("/api/timelogs/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be todo, in-progress, or done",
      });
    }

    const logIndex = timeLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check authorization: employee can only update their own logs
    if (
      req.user.role === "employee" &&
      timeLogs[logIndex].user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this time log",
      });
    }

    // Update status
    timeLogs[logIndex].status = status;

    res.json({
      success: true,
      data: {
        id,
        status,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating time log status",
    });
  }
});

// Delete time log
app.delete("/api/timelogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const logIndex = timeLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check authorization: employee can only delete their own logs
    if (
      req.user.role === "employee" &&
      timeLogs[logIndex].user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this time log",
      });
    }

    const deletedLog = timeLogs[logIndex];
    timeLogs.splice(logIndex, 1);

    res.json({
      success: true,
      message: "Time log deleted successfully",
      data: deletedLog,
    });
  } catch (error) {
    console.error("Delete time log error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting time log",
    });
  }
});

// ====================
// ADD THIS NEW ENDPOINT FOR FRONTEND COMPATIBILITY
// ====================

// Update time log (alternative endpoint to match frontend path)
app.put("/api/time-logs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hours, notes } = req.body;

    const logIndex = timeLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check authorization: employee can only update their own logs
    if (
      req.user.role === "employee" &&
      timeLogs[logIndex].user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this time log",
      });
    }

    // Validate status if provided
    if (status && !["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be todo, in-progress, or done",
      });
    }

    // Update the log
    const updatedLog = {
      ...timeLogs[logIndex],
      ...(status && { status }),
      ...(hours !== undefined && { hours: Number(hours) }),
      ...(notes !== undefined && { notes }),
    };

    // Validation for hours
    if (hours !== undefined && hours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hours must be positive",
      });
    }

    timeLogs[logIndex] = updatedLog;

    // Populate user and project info for response
    const user = users.find((u) => u.id === updatedLog.user_id);
    const project = projects.find((p) => p.id === updatedLog.project_id);
    const populatedLog = {
      ...updatedLog,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      project: {
        id: project?.id,
        name: project?.name,
      },
    };

    res.json({
      success: true,
      message: "Time log updated successfully",
      data: populatedLog,
    });
  } catch (error) {
    console.error("Update time log error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating time log",
    });
  }
});

// ====================
// BILLING SUMMARY ROUTE
// ====================

// Cache for billing summaries
const billingSummaryCache = new Map();

// Get billing summary for a project
app.get("/api/projects/:id/billing-summary", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `billing-${id}`;

    // Check cache (30 seconds)
    if (billingSummaryCache.has(cacheKey)) {
      const cached = billingSummaryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) {
        return res.json({
          success: true,
          data: cached.data,
          cached: true,
        });
      }
    }

    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Get time logs for this project
    const projectLogs = timeLogs.filter((log) => log.project_id === id);

    // Calculate totals
    const totalHours = projectLogs.reduce((sum, log) => sum + log.hours, 0);
    const totalAmount = totalHours * project.billing_rate;

    // Group by user
    const hoursByUser = {};
    projectLogs.forEach((log) => {
      const user = users.find((u) => u.id === log.user_id);
      const userId = user?.id || "unknown";

      if (!hoursByUser[userId]) {
        hoursByUser[userId] = {
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
          },
          hours: 0,
          amount: 0,
        };
      }
      hoursByUser[userId].hours += log.hours;
      hoursByUser[userId].amount += log.hours * project.billing_rate;
    });

    // Group by date
    const hoursByDate = {};
    projectLogs.forEach((log) => {
      const date = log.log_date.split("T")[0];
      if (!hoursByDate[date]) {
        hoursByDate[date] = {
          hours: 0,
          amount: 0,
        };
      }
      hoursByDate[date].hours += log.hours;
      hoursByDate[date].amount += log.hours * project.billing_rate;
    });

    const summary = {
      project: {
        id: project.id,
        name: project.name,
        billing_rate: project.billing_rate,
        status: project.status,
      },
      total_hours: totalHours,
      total_amount: totalAmount,
      hours_by_user: Object.values(hoursByUser),
      hours_by_date: hoursByDate,
    };

    // Cache the result
    billingSummaryCache.set(cacheKey, {
      data: summary,
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Billing summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating billing summary",
    });
  }
});

// ====================
// HEALTH CHECK
// ====================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    data: {
      users: users.length,
      projects: projects.length,
      timeLogs: timeLogs.length,
    },
  });
});

// ====================
// START SERVER
// ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initializeData();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📁 Project endpoints: http://localhost:${PORT}/api/projects`);
  console.log(`⏱️ Time log endpoints: http://localhost:${PORT}/api/timelogs`);
  console.log(
    `⏱️ Time log endpoints (frontend): http://localhost:${PORT}/api/time-logs`
  );
  console.log(
    `💰 Billing summary: http://localhost:${PORT}/api/projects/1/billing-summary`
  );
});

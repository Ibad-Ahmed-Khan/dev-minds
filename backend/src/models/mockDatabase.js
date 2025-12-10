// Mock database for development without MongoDB
console.log("🔧 Setting up mock database...");

// Mock data storage
const mockDB = {
  users: [],
  projects: [],
  timeLogs: [],
  currentId: 1,
};

// Helper functions
const generateId = () => {
  return (mockDB.currentId++).toString();
};

// Mock User "model"
class MockUser {
  static findOne(query) {
    return new Promise((resolve) => {
      const user = mockDB.users.find((u) => {
        return Object.keys(query).every((key) => u[key] === query[key]);
      });
      resolve(user ? { ...user, _id: user.id } : null);
    });
  }

  static findById(id) {
    return new Promise((resolve) => {
      const user = mockDB.users.find((u) => u.id === id);
      resolve(user ? { ...user, _id: user.id } : null);
    });
  }

  static create(data) {
    return new Promise((resolve) => {
      const user = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        _id: generateId(),
      };

      // Hash password if present
      if (user.password) {
        // Simple mock hash
        user.password = `hashed_${user.password}`;
      }

      mockDB.users.push(user);
      resolve({ ...user, _id: user.id });
    });
  }

  static findByIdAndUpdate(id, update, options) {
    return new Promise((resolve) => {
      const index = mockDB.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockDB.users[index] = { ...mockDB.users[index], ...update };
        resolve({ ...mockDB.users[index], _id: id });
      } else {
        resolve(null);
      }
    });
  }

  static countDocuments(query = {}) {
    return new Promise((resolve) => {
      const count = mockDB.users.filter((u) => {
        return Object.keys(query).every((key) => u[key] === query[key]);
      }).length;
      resolve(count);
    });
  }

  static deleteMany(query = {}) {
    return new Promise((resolve) => {
      mockDB.users = mockDB.users.filter((u) => {
        return !Object.keys(query).every((key) => u[key] === query[key]);
      });
      resolve({ deletedCount: 1 });
    });
  }
}

// Mock Project "model"
class MockProject {
  static create(data) {
    return new Promise((resolve) => {
      const project = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        _id: generateId(),
      };
      mockDB.projects.push(project);
      resolve({ ...project, _id: project.id });
    });
  }

  static find(query = {}) {
    return new Promise((resolve) => {
      let results = mockDB.projects;

      // Apply query filters
      if (query.status) {
        if (query.status.$in) {
          results = results.filter((p) => query.status.$in.includes(p.status));
        } else {
          results = results.filter((p) => p.status === query.status);
        }
      }

      // Simulate populate
      results = results.map((project) => ({
        ...project,
        created_by: mockDB.users.find((u) => u.id === project.created_by) || {
          name: "Admin User",
          email: "admin@example.com",
        },
      }));

      resolve(results.map((p) => ({ ...p, _id: p.id })));
    });
  }

  static findById(id) {
    return new Promise((resolve) => {
      const project = mockDB.projects.find((p) => p.id === id);
      if (project) {
        const populatedProject = {
          ...project,
          created_by: mockDB.users.find((u) => u.id === project.created_by) || {
            name: "Admin User",
            email: "admin@example.com",
          },
          _id: project.id,
        };
        resolve(populatedProject);
      } else {
        resolve(null);
      }
    });
  }

  static findByIdAndUpdate(id, update, options) {
    return new Promise((resolve) => {
      const index = mockDB.projects.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockDB.projects[index] = { ...mockDB.projects[index], ...update };
        const updated = mockDB.projects[index];
        resolve({
          ...updated,
          created_by: mockDB.users.find((u) => u.id === updated.created_by) || {
            name: "Admin User",
            email: "admin@example.com",
          },
          _id: id,
        });
      } else {
        resolve(null);
      }
    });
  }

  static countDocuments(query = {}) {
    return new Promise((resolve) => {
      let results = mockDB.projects;

      if (query.status && query.status.$in) {
        results = results.filter((p) => query.status.$in.includes(p.status));
      }

      resolve(results.length);
    });
  }

  static deleteMany(query = {}) {
    return new Promise((resolve) => {
      mockDB.projects = mockDB.projects.filter((p) => {
        return !Object.keys(query).every((key) => p[key] === query[key]);
      });
      resolve({ deletedCount: 1 });
    });
  }
}

// Seed initial data
const seedData = () => {
  // Clear existing data
  mockDB.users = [];
  mockDB.projects = [];
  mockDB.currentId = 1;

  // Create admin user
  MockUser.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });

  // Create employee user
  MockUser.create({
    name: "Employee User",
    email: "employee@example.com",
    password: "password123",
    role: "employee",
  });

  // Create sample projects
  MockProject.create({
    name: "E-commerce Website",
    description: "Build a full-featured e-commerce platform",
    billing_rate: 50,
    status: "active",
    created_by: "1",
  });

  MockProject.create({
    name: "Mobile App Development",
    description: "Cross-platform mobile application",
    billing_rate: 65,
    status: "active",
    created_by: "1",
  });

  MockProject.create({
    name: "API Integration",
    description: "Third-party API integration project",
    billing_rate: 45,
    status: "completed",
    created_by: "1",
  });

  console.log("✅ Mock database seeded with sample data");
};

// Replace mongoose models with mock models
module.exports = {
  User: MockUser,
  Project: MockProject,
  seedData,
};

// Seed data on startup
setTimeout(seedData, 100);

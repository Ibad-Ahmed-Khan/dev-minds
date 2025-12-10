const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Routes accessible to all authenticated users
router.get("/", getProjects);
router.get("/:id", getProject);

// Admin only routes
router.post("/", authorize("admin"), createProject);
router.put("/:id", authorize("admin"), updateProject);
router.delete("/:id", authorize("admin"), archiveProject);

module.exports = router;

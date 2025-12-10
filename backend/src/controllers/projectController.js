const Project = require("../models/Project");

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    const { name, description, billing_rate, status = "active" } = req.body;

    // Validate required fields
    if (!name || !billing_rate) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and billing rate",
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      billing_rate,
      status,
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};

    // If user is employee, only show active/completed projects
    if (req.user.role === "employee") {
      query.status = { $in: ["active", "completed"] };
    }

    // Fetch projects with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
      .populate("created_by", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      count: projects.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "created_by",
      "name email"
    );

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

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("created_by", "name email");

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

// @desc    Archive project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Soft delete - change status to archived
    project.status = "archived";
    await project.save();

    res.json({
      success: true,
      message: "Project archived successfully",
      data: project,
    });
  } catch (error) {
    console.error("Archive project error:", error);
    res.status(500).json({
      success: false,
      message: "Error archiving project",
      error: error.message,
    });
  }
};

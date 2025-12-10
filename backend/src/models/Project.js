const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    billing_rate: {
      type: Number,
      required: [true, "Billing rate is required"],
      min: [0, "Billing rate cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
projectSchema.index({ status: 1, created_at: -1 });
projectSchema.index({ created_by: 1 });

module.exports = mongoose.model("Project", projectSchema);

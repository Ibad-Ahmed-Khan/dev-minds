const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 12,
    },
    notes: {
      type: String,
      default: "",
    },
    log_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for faster queries
timeLogSchema.index({ project_id: 1 });
timeLogSchema.index({ user_id: 1 });
timeLogSchema.index({ status: 1 });
timeLogSchema.index({ log_date: 1 });
timeLogSchema.index({ project_id: 1, user_id: 1, log_date: 1 });

// ✅ FIXED LINE: Use timeLogSchema, not timeLog
module.exports = mongoose.model("TimeLog", timeLogSchema);

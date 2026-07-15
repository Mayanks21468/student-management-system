const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      trim: true,
      uppercase: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassRoom",
      required: [true, "Subject must belong to a class"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

// Prevent duplicate subject code within the same class
subjectSchema.index({ code: 1, class: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);

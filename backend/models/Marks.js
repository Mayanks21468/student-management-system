const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassRoom",
      required: true,
    },
    examType: {
      type: String,
      required: [true, "Exam type is required"], // e.g. "Unit Test 1", "Midterm", "Final"
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
  },
  { timestamps: true }
);

// One mark entry per student, per subject, per exam type
marksSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);

const mongoose = require("mongoose");

const classRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"], // e.g. "10th Grade", "BSc CS Year 2"
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: "A", // e.g. "A", "B"
    },
    academicYear: {
      type: String,
      trim: true,
      default: () => `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  { timestamps: true }
);

// A class + section + academic year combination should be unique
classRoomSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model("ClassRoom", classRoomSchema);

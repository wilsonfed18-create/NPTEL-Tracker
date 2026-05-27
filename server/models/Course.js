const mongoose = require('mongoose');

// Schema defines the structure of a course document in MongoDB
const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Each course belongs to a specific user
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseType: {
    type: String,
    enum: ['4 weeks', '8 weeks', '12 weeks'],  // Only these 3 values are allowed
    required: true
  },
  assignmentMarks: {
    type: [Number],  // Array of numbers, e.g. [80, 90, 70, 85]
    required: true
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

/*
 * FILE EXPLANATION:
 * This file defines the Course model for MongoDB.
 * Each course has a name, type (4/8/12 weeks), and an array of assignment marks.
 * userId links the course to the user who created it.
 * courseType uses enum to restrict values to only the 3 valid options.
 * assignmentMarks is an array of numbers like [80, 90, 70, 85].
 * This model is used in the course controller for all CRUD operations.
 */

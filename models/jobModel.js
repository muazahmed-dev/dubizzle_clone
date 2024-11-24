const mongoose = require("mongoose");
const { isEmail } = require("validator"); 

const jobSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "A job post must have a title."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "A job post must have a description."],
    trim: true,
  },
  skillsRequired: {
    type: String,
    required: [true, "Specify the required skills for the job."],
    trim: true,
  },
  experienceRequired: {
    type: String,
    required: [true, "Experience level must be specified."],
  },
  salary: {
    type: Number,
    required: [true, "Job must offer a salary."],
    min: [1, "Salary should be greater than 0."],
  },
  currency: {
    type: String,
    required: [true, "Please define the currency."],
  },
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "temporary", "internship"],
    required: [true, "Please define the job type."],
  },
  country: {
    type: String,
    required: [true, "Job location must specify a country."],
  },
  city: {
    type: String,
    required: [true, "Job location must specify a city."],
  },
  category: {
    type: String,
    default: "job",
  },
  designation: {
    type: String,
    required: [true, "Job's subcategory should not be empty."],
  },
  duration: {
    type: Number,
  },
  status: {
    type: String,
    default: "inactive",
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  contact: {
    type: Number,
  },
  emailAddress: {
    type: String,
    validate: {
      validator: isEmail,
      message: "Invalid email format.",
    },
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// INDEXES
jobSchema.index({
  name: 1,
  user: 1,
  isApproved: 1,
  category: 1,
  designation: 1,
  salary: 1,
  country: 1,
  city: 1,
  status: 1,
  createdAt: 1,
});

module.exports = mongoose.model("Job", jobSchema);

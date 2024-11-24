const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isEmail } = require("validator");

// MODEL SCHEMA
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email cannot be empty."],
    trim: true,
    unique: true,
    validate: {
      validator: isEmail,
      message: "Invalid Email",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords do not match.",
    },
  },
  companyName: {
    type: String,
  },
  companyLicenseNumber: {
    type: Number,
  },
  city: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
});

// INDEXES
userSchema.index({ name: 1, city: 1 });

// ================== MONGOOSE MIDDLEWARES ====================//

// ENCRYPT PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// COMPARE PASSWORD
userSchema.methods.correctPassword = async (password, userPassword) => {
  return await bcrypt.compare(userPassword, password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

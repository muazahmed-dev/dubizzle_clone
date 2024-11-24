const mongoose = require("mongoose");
const { isEmail } = require("validator");

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "A product must have a name."],
    trim: true,
  },
  slogan: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Product must belong to a country."],
  },
  city: {
    type: String,
    required: [true, "Product must belong to a city."],
  },
  price: {
    type: Number,
    required: [true, "Product must have a price."],
    min: [1, "Price should be greater than 0."],
  },
  currency: {
    type: String,
    required: [true, "Please define currency."],
  },
  category: {
    type: String,
    required: [true, "Categorize the product please."],
  },
  subcategory: {
    type: String,
    required: [true, "Product's subcategory should not be empty."],
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
productSchema.index({
  name: 1,
  user: 1,
  isApproved: 1,
  category: 1,
  subcategory: 1,
  price: 1,
  country: 1,
  city: 1,
  status: 1,
  createdAt: 1,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

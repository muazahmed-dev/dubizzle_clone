const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();
const app = require("./app");
const adManager = require("./utils/adManager");

const DB = process.env.MONGODB_URI;
const PORT = process.env.PORT;

// CONNECT DATABASE
mongoose
  .connect(DB)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Error connecting DB", err.message));

// RUN SERVER
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}...`)
);

// CRON JOB FOR AD MANAGER
cron.schedule("0 0 * * *", () => {
  console.log("Running ad manager at midnight");
  adManager();
});

// MANAGE UNHANDLED REJECTIONS
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION, Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// MANAGE UNCAUGHT EXCEPTION
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION, Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

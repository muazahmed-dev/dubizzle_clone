const Product = require("../models/productModel");
const Job = require("../models/jobModel");

const batchSize = 100;
const delayBetweenBatches = 2000;

// FUNCITON TO MANAGE ADS DURATION
const adManager = async () => {
  try {
    const products = await Product.find({
      $and: [{ isApproved: true }, { status: "active" }],
    });

    const jobs = await Job.find({
      $and: [{ isApproved: true }, { status: "active" }],
    });

    const ads = products.concat(jobs);

    if (!ads || ads.length === 0) {
      return console.log("No ads found.");
    }

    for (let i = 0; i < ads.length; i += batchSize) {
      const batch = ads.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (ad) => {
          const updatedAd = await ad.constructor.findOneAndUpdate(
            { _id: ad._id },
            { $inc: { duration: -1 } },
            { new: true }
          );
          if (updatedAd.duration === 0) {
            await expireAd(updatedAd);
          }
        })
      );

      if (i + batchSize < ads.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }
  } catch (err) {
    console.log("Error managing ads", err.message);
  }
};

// FUNCTION TO EXPIRE ADS
const expireAd = async (ad) => {
  await ad.constructor.findOneAndUpdate(
    { _id: ad._id },
    { status: "inactive" }
  );
};

module.exports = adManager;

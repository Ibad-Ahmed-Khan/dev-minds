const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes
    await mongoose.connection.db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection("timelogs").createIndex({
      project_id: 1,
      user_id: 1,
      log_date: 1,
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

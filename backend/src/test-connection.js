const mongoose = require("mongoose");

// Your connection string with new password
const uri =
  "mongodb+srv://ibadahmedkhan90:ineverwant@cluster0.9emnxlg.mongodb.net/project_billing_db?retryWrites=true&w=majority";

console.log("🔗 Testing MongoDB Atlas connection...");
console.log("Password: ineverwant");
console.log("Database: project_billing_db\n");

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
    console.log("Database:", mongoose.connection.db.databaseName);

    // List all databases to confirm
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    console.log("\n📊 Available databases:");
    databases.databases.forEach((db) => {
      console.log(`- ${db.name}`);
    });

    mongoose.connection.close();
    console.log(
      "\n🎉 Connection test passed! Update your .env and restart server."
    );
  })
  .catch((err) => {
    console.error("❌ FAILED:", err.message);
    console.log("\nCommon issues:");
    console.log(
      "1. IP not whitelisted → MongoDB Atlas → Network Access → Add IP"
    );
    console.log("2. Password wrong → Reset in Database Access");
    console.log("3. Cluster sleeping → Resume cluster in MongoDB Atlas");
    console.log("4. Network issues → Check internet connection");
  });

import mongoose from "mongoose";
import 'dotenv/config';

const dbUser = process.env.MONGOUSER || "mongo";
const dbPassword = process.env.MONGOPASSWORD || "";
const dbHost = process.env.MONGOHOST || "localhost";
const dbPort = process.env.MONGOPORT || "27017";

// Construct MongoDB URL using Railway-provided variables
const cloudUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/?authSource=admin`;

const mongooseDb = async () => {
    try {
        await mongoose.connect(cloudUri);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    }
};

export default mongooseDb;

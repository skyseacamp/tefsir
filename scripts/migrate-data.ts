import dotenv from "dotenv";
import mongoose from "mongoose";
import { tefsirData } from "../src/data/data";
import { Tefsir } from "../src/models/Tefsir";

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not set in .env");
}

async function migrateData() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Check if data already exists
        const existingCount = await Tefsir.countDocuments();
        console.log(`📊 Existing records: ${existingCount}`);

        if (existingCount > 0) {
            console.log("⚠️  Database already contains data.");
            const readline = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const answer = await new Promise<string>((resolve) => {
                readline.question(
                    "Do you want to clear existing data and re-import? (yes/no): ",
                    resolve
                );
            });
            readline.close();

            if (answer.toLowerCase() === "yes") {
                console.log("🗑️  Clearing existing data...");
                await Tefsir.deleteMany({});
                console.log("✅ Existing data cleared");
            } else {
                console.log("❌ Migration cancelled");
                process.exit(0);
            }
        }

        console.log(`📥 Importing ${tefsirData.length} records...`);

        // Insert data in batches for better performance
        const batchSize = 100;
        let imported = 0;

        for (let i = 0; i < tefsirData.length; i += batchSize) {
            const batch = tefsirData.slice(i, i + batchSize);
            await Tefsir.insertMany(batch);
            imported += batch.length;
            console.log(`   ✓ Imported ${imported}/${tefsirData.length} records`);
        }

        console.log("✅ Data migration completed successfully!");

        // Display statistics
        const stats = await Tefsir.aggregate([
            {
                $group: {
                    _id: "$mufessir",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        console.log("\n📊 Statistics by Mufessir:");
        stats.forEach((stat) => {
            console.log(`   ${stat._id}: ${stat.count} records`);
        });

        const sureStats = await Tefsir.aggregate([
            {
                $group: {
                    _id: "$sure",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        console.log("\n📊 Statistics by Sure:");
        sureStats.forEach((stat) => {
            console.log(`   ${stat._id}: ${stat.count} records`);
        });
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
    }
}

migrateData();

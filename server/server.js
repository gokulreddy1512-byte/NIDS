const Alert = require("./models/Alert");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const TrafficLog = require("./models/TrafficLog");
const AnomalyDetector = require("./detectors/AnomalyDetector");

const detector = new AnomalyDetector();
const app = express();

const PORT = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        app.listen(PORT, () => {
            console.log(`🛡️ NIDS Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:");
        console.error(error.message);
    });

// Test route
app.get("/", (req, res) => {
    res.send("🛡️ NIDS Backend is running!");
});

app.use(express.json());

// POST traffic
app.post("/api/traffic", async (req, res) => {
    try {
        // Save traffic
        const traffic = new TrafficLog(req.body);
        const savedTraffic = await traffic.save();

        // Get recent traffic from the same source
        const recentTraffic = await TrafficLog.find({
            sourceIP: savedTraffic.sourceIP
        })
            .sort({ timestamp: -1 })
            .limit(10);

        // Detect anomalies
        const alerts = detector.analyzeTraffic(
            savedTraffic,
            recentTraffic
        );

        // Save detected alerts
        
const savedAlerts = [];

for (const alert of alerts) {
    const savedAlert = await Alert.create({
        type: alert.type,
        message: alert.message,
        sourceIP: savedTraffic.sourceIP,
        severity: alert.severity || "MEDIUM",
        riskScore: alert.riskScore ?? 0,
        evidence: alert.evidence || [],
        explanation:
            alert.explanation || "No additional explanation available.",
        recommendedActions: alert.recommendedActions || []
    });

    savedAlerts.push(savedAlert);
}


        res.status(201).json({
            traffic: savedTraffic,
            alerts: savedAlerts
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to save traffic",
            error: error.message
        });
    }
});
app.get("/api/alerts", async (req, res) => {
    try {
        const alerts = await Alert.find()
            .sort({ timestamp: -1 });

        res.json(alerts);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch alerts",
            error: error.message
        });
    }
});
// 👇 ADD THE NEW GET ROUTE HERE
app.get("/api/traffic", async (req, res) => {
  try {
    const traffic = await TrafficLog.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(traffic);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch traffic logs"
    });
  }
});
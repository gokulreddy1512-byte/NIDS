const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    sourceIP: {
        type: String,
        default: "Unknown"
    },

    severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "MEDIUM"
    },

    // Explainable investigation details
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    evidence: {
        type: [String],
        default: []
    },

    explanation: {
        type: String,
        default: "No additional explanation available."
    },

    recommendedActions: {
        type: [String],
        default: []
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Alert", alertSchema);
const mongoose = require("mongoose");

const trafficLogSchema = new mongoose.Schema({
    sourceIP: {
        type: String,
        required: true
    },

    destinationIP: {
        type: String,
        required: true
    },

    sourcePort: {
        type: Number,
        required: true
    },

    destinationPort: {
        type: Number,
        required: true
    },

    protocol: {
        type: String,
        required: true
    },

    dataSize: {
        type: Number,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("TrafficLog", trafficLogSchema);
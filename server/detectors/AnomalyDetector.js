
class AnomalyDetector {
    constructor() {
        this.dataVolumeThreshold = 10000;
    }

    checkDataVolume(traffic) {
        return Number(traffic.dataSize) > this.dataVolumeThreshold;
    }

    checkPortScan(trafficLogs) {
        const ports = trafficLogs.map(
            (traffic) => traffic.destinationPort
        );

        const uniquePorts = new Set(
            ports.filter((port) => port !== undefined && port !== null)
        );

        return uniquePorts.size >= 5;
    }

    analyzeTraffic(traffic, recentTraffic) {
        const alerts = [];

        // Rule 1: Unusually high data volume
        if (this.checkDataVolume(traffic)) {
            alerts.push({
                type: "HIGH_DATA_VOLUME",
                message: "Unusually high data volume detected",
                severity: "HIGH",
                riskScore: 85,
                evidence: [
                    `Observed data size: ${traffic.dataSize}`,
                    `Configured threshold: ${this.dataVolumeThreshold}`,
                    `Source IP: ${traffic.sourceIP}`
                ],
                explanation:
                    "This traffic record exceeds the configured data-volume threshold. Large transfers can be legitimate, but may also indicate data exfiltration or unusual network activity.",
                recommendedActions: [
                    "Review the destination IP and destination port.",
                    "Compare this transfer with the source's normal traffic.",
                    "Investigate whether the transfer was authorized."
                ]
            });
        }

        // Rule 2: Possible port scan
        if (this.checkPortScan(recentTraffic)) {
            const uniquePorts = [
                ...new Set(
                    recentTraffic
                        .map((item) => item.destinationPort)
                        .filter((port) => port !== undefined && port !== null)
                )
            ];

            alerts.push({
                type: "PORT_SCAN",
                message: "Possible port scanning detected",
                severity: "HIGH",
                riskScore: 90,
                evidence: [
                    `Distinct destination ports in recent traffic: ${uniquePorts.length}`,
                    `Ports observed: ${uniquePorts.join(", ")}`,
                    `Source IP: ${traffic.sourceIP}`
                ],
                explanation:
                    "Traffic from this source has targeted five or more distinct destination ports in the recent traffic window. This pattern can indicate port scanning, although legitimate network tools may produce similar behavior.",
                recommendedActions: [
                    "Inspect recent connections from this source IP.",
                    "Check whether the source is an authorized scanner.",
                    "Review firewall and destination-host logs for failed connections.",
                    "Escalate for investigation if the activity is unauthorized."
                ]
            });
        }

        return alerts;
    }
}

module.exports = AnomalyDetector;

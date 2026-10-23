class TrafficSimulator {
    constructor() {
        this.sourceIP = "192.168.1.50";
        this.destinationIP = "192.168.1.20";
        this.count = 0;
    }

    generateNormalTraffic() {
        return {
            sourceIP: this.sourceIP,
            destinationIP: this.destinationIP,
            sourcePort: 4000 + Math.floor(Math.random() * 1000),
            destinationPort: 80,
            protocol: "TCP",
            dataSize: 5000
        };
    }

    generateHighVolumeTraffic() {
        return {
            sourceIP: this.sourceIP,
            destinationIP: this.destinationIP,
            sourcePort: 5001,
            destinationPort: 80,
            protocol: "TCP",
            dataSize: 50000
        };
    }

    generatePortScanTraffic(port) {
        return {
            sourceIP: this.sourceIP,
            destinationIP: this.destinationIP,
            sourcePort: 6000,
            destinationPort: port,
            protocol: "TCP",
            dataSize: 1000
        };
    }

    async sendTraffic(traffic) {
        try {
            const response = await fetch(
                "http://localhost:5000/api/traffic",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(traffic)
                }
            );

            const result = await response.json();

            console.log(
                `Traffic ${this.count}:`,
                result.alerts?.length
                    ? `🚨 ${result.alerts.map(a => a.type).join(", ")}`
                    : "✅ NORMAL"
            );

        } catch (error) {
            console.error("Simulator error:", error.message);
        }
    }

    async start() {
        console.log("🛡️ NIDS Traffic Simulator Started");

        setInterval(async () => {
            this.count++;

            // Every 8th request = high data volume
            if (this.count % 8 === 0) {
                await this.sendTraffic(
                    this.generateHighVolumeTraffic()
                );
            }

            // Every 12th request = port scan burst
            else if (this.count % 12 === 0) {
                console.log("🔎 Simulating port scan...");

                for (let port = 20; port < 26; port++) {
                    await this.sendTraffic(
                        this.generatePortScanTraffic(port)
                    );
                }
            }

            // Otherwise = normal traffic
            else {
                await this.sendTraffic(
                    this.generateNormalTraffic()
                );
            }

        }, 3000);
    }
}

const simulator = new TrafficSimulator();
simulator.start();
module.exports = TrafficSimulator;
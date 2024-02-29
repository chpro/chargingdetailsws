const CONFIG = {
    // INFLUX host and tokens
    influxHost: process.env.INFLUX_HOST || "tig",
    influxBaseUrl: process.env.INFLUX_BASE_URL || "http://tig:8086",
    influxToken: process.env.INFLUX_TOKEN,
    timezone: process.env.TZ || "Europe/Vienna",
    calculationWindowSize: process.env.CALCULATION_WINDOW_SIZE || 10,
};

module.exports = {CONFIG}
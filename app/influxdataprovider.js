const axios = require('axios');
const CONFIG = require('./config').CONFIG

const INFLUX_REQUEST_HEADER = {"Authorization" : "Token " + CONFIG.influxToken};

const WP_USAGE = function(from, to) {return `${CONFIG.influxBaseUrl}/query?pretty=true&db=chargers&q=SELECT "energyCounterTotal" FROM "autogen"."wattpilot" WHERE time >= '${from}' and time <= '${to}' tz('${CONFIG.timezone}')`;}
const FROM_GRID = function(from, to) {return `${CONFIG.influxBaseUrl}/query?pretty=true&db=inverter&q=SELECT "EnergyReal_WAC_Plus_Absolute" FROM "autogen"."smartmeter" WHERE time >= '${from}' and time <= '${to}' tz('${CONFIG.timezone}')`;}
const ENERGY_PRICE_BUY = function() {return `${CONFIG.influxBaseUrl}/query?pretty=true&db=energyprices&q=SELECT "buy" FROM "autogen"."electricity" tz('${CONFIG.timezone}')`;}
const ENERGY_PRICE_SELL = function() {return `${CONFIG.influxBaseUrl}/query?pretty=true&db=energyprices&q=SELECT "sell" FROM "autogen"."electricity" tz('${CONFIG.timezone}')`;}


function executeQueries(from, to, callback) {
    axios.all([
        axios.get(WP_USAGE(from, to), {headers: INFLUX_REQUEST_HEADER}),
        axios.get(FROM_GRID(from, to), {headers: INFLUX_REQUEST_HEADER}),
        axios.get(ENERGY_PRICE_BUY(from, to), {headers: INFLUX_REQUEST_HEADER}),
        axios.get(ENERGY_PRICE_SELL(from, to), {headers: INFLUX_REQUEST_HEADER}),
    ]).then(axios.spread((wpUsage, fromGrid, energyPriceBuy, energyPriceSell) => {
        callback(wpUsage, fromGrid, energyPriceBuy, energyPriceSell);
    })).catch(err => {
        console.log(new Date(), err);
        callback();
    });
}

module.exports = {executeQueries}
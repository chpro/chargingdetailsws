const { CONFIG } = require("./config");

const CENT_PER_KWH_TO_EURO_PER_WH_FACTOR = 1/100000;

/**
 * Data Array always needs contain an array with first element time and second element value
 * @param {Array<Array<Object>>} wpUsage Counter for how much energy was used by wattpilot.
 * @param {Array<Array<Object>>} fromGrid Counter for how much energy was used from grid
 * @param {Array<Array<Object>>} energyPriceBuy the energy price for buying energy in cent/kwh
 * @param {Array<Array<Object>>} energyPriceSell the energy price for buying energy in cent/kwh
 * @returns return [
        {time: "2024-02-19T17:30:00+01:00", energy: {grid: 100.00, local: 200.00}, cost: {grid: 25.0, local: 10.0}},
        {time: "2024-02-19T17:40:00+01:00", energy: {grid: 200.00, local: 500.00}, cost: {grid: 50.0, local: 20.0}},
    ]; where energy is in Wh and cost in €
 */
function transformData(wpUsage, fromGrid, energyPriceBuy, energyPriceSell) {
    const ret = []

    const wpUsageArray = getValuesArray00(wpUsage);
    const fromGridArray = getValuesArray00(fromGrid);

    // compensate possible different length
    const length = Math.min(wpUsageArray.length, fromGridArray.length)

    const jump = CONFIG.calculationWindowSize;
    
    // iterate backward through arrays because of assumption that last date is the same
    for (let index = 1; index <= length - jump; index+=jump) {
        const fromGridIndexFirst = fromGridArray.length - index;
        const wpUsageIndexFirst = wpUsageArray.length - index;

        const indexCorrection = length - index - jump < jump ? length - index : jump; // on last jump also incorporate values which would be dismissed otherwise
        const fromGridIndexSecond = fromGridIndexFirst - indexCorrection;
        const wpUsageIndexSecond = wpUsageIndexFirst - indexCorrection;
        //console.log(new Date(), "fromGrid", fromGridIndexFirst, "/", fromGridIndexSecond, " - wpUsage", wpUsageIndexFirst, "/", wpUsageIndexSecond);

        const time = fromGridArray[fromGridIndexFirst][0];
        const wattpilot = wpUsageArray[wpUsageIndexFirst][1] - wpUsageArray[wpUsageIndexSecond][1];
        const grid = fromGridArray[fromGridIndexFirst][1] - fromGridArray[fromGridIndexSecond][1];

        var energyGrid = 0;
        var energyLocal = 0;
        if (wattpilot > 0) {
            if (grid > 0) {
                energyGrid = wattpilot < grid ? wattpilot : grid;
                energyLocal = wattpilot - energyGrid;
            } else {
                energyLocal = wattpilot;
            }
        }

        const entry = {
            time: time,
            energy: {
                grid: energyGrid,
                local: energyLocal,
            },
            cost: {
                grid: getCost(time, energyGrid, energyPriceBuy),
                local: getCost(time, energyLocal, energyPriceSell)
            }
        }
        ret.push(entry);
    }

    return ret;
}

function getValuesArray00(result) {
    if (result) {
        return result.data.results[0].series[0].values;
    } else {
        return [];
    }
}

function getCost(time, energy, energyPrice) {
    const date = new Date(time);
    const values = getValuesArray00(energyPrice).toReversed();
    var costs = 0;

    for (i in values) {
        const element = values[i]
        const refDate = new Date(element[0])
        if (refDate < date) {
            //console.log(new Date(), "determined price", element[1], "for", refDate, "<", date,"with", values)
            costs = energy * element[1] * CENT_PER_KWH_TO_EURO_PER_WH_FACTOR;
            break;
        }
    }

    return costs;
}

module.exports = {transformData}
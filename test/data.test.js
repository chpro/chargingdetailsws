const data = require('../app/influxdataprovider')
const assert = require('assert');

const FROM = "2024-02-19T00:00:00.000Z";
const TO = "2024-02-25T23:59:59.000Z"; 

data.executeQueries(FROM, TO, executeQueriesCB)

function executeQueriesCB(wpUsage, fromGrid, energyPriceBuy, energyPriceSell) {
    console.log(wpUsage)
    assertData(wpUsage.data);
    assertData(fromGrid.data);
    assertData(energyPriceBuy.data);
    assertData(energyPriceSell.data);
}


function assertData(data) {
    console.log(data)
    assert(data.results.length === 1, "expected result length is not 1")
    assert(data.results[0].series.length === 1, "expected result.series length is not 1")
    assert(data.results[0].series[0].values.length > 0, "expected result.series.values length more than zero")
    console.log(new Date(), data.results[0].series[0].values)
}
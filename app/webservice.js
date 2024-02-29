const CONFIG = require('./config').CONFIG
const data = require('./influxdataprovider')
const transfromation = require('./transformation')
const express = require('express')
const cors = require('cors')
const ws = express()
const port = 9201


var corsOptions = {
    origin: 'http://tig:3000',
    credentials: true,
}
ws.use(cors(corsOptions))

ws.get('/data', (req, res) => {
    //console.log(new Date(), "query paramters: ",req.query.from, req.query.to)
    data.executeQueries(req.query.from, req.query.to, function(energyProduction, wpUsage, fromGrid, energyPrice) {
        res.json(transfromation.transformData(energyProduction, wpUsage, fromGrid, energyPrice))
    })
})

ws.get('/config', (req, res) => {
    res.json({"config": CONFIG})
})

ws.get('/', (req, res) => {
    res.status(200).end()
})

ws.listen(port, () => {
    console.log(new Date(), `webserver is listening on port ${port}`)
})
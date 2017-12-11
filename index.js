const prometheus = require('prom-client')
const app = require('express')()
const is = require('is')
const vigicrues = require('./metrics/vigicrues')

const Debits = new prometheus.Gauge({
  name: 'hauteurs',
  help: 'Observations par hauteur H',
  labelNames: ['station']
})

const port = process.env.PORT || 5000

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(prometheus.register.metrics())
})

app.get('/metrics/hauteurs', (req, res) => {
  let stations = []

  if (is.string(req.query.stations)) {
    stations = [req.query.stations]
  } else if (is.array(req.query.stations)) {
    stations = req.query.stations
  }

  Promise.all(stations.map(station =>
      vigicrues.observations(station, 'H')
      .then(vig => {
        console.log(`Got ${vig.Serie.ObssHydro.length} measurements from ${station} (${vig.Serie.LbStationHydro})`)
        const [last] = vig.Serie.ObssHydro.slice(-1)
        if (last) {
          Debits.labels(station).set(last.ResObsHydro, last.DtObsHydro)
        }
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('hauteurs'))
    })
    .catch(err => res.status(500).send(err))
})

app.listen(port)

const patriarchy = require('patriarchy')
const prometheus = require('prom-client')
const app = require('express')()
const vigicrues = require('./metrics/vigicrues')

const Debits = new prometheus.Gauge({
  name: 'debits',
  help: 'Observations par débit Q',
  labelNames: ['station']
})

const port = process.env.PORT || 5000

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(prometheus.register.metrics())
})

app.get('/metrics/debits/:station', (req, res) => {
  const station = req.params.station

  vigicrues.informations(station)
    .then(res => console.log(patriarchy(res)))

  vigicrues.observations(station, 'Q')
    .then(vig => {
      const [last] = vig.Serie.ObssHydro.slice(-1)
      Debits.labels(station).set(last.ResObsHydro, last.DtObsHydro)

      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('debits'))
    })
})

app.listen(port)

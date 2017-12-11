const prometheus = require('prom-client')
const app = require('express')()
const is = require('is')
const vigicrues = require('./metrics/vigicrues')
const darksky = require('./metrics/darksky')

const Temperatures = new prometheus.Gauge({
  name: 'temperatures',
  help: 'Températures',
  labelNames: ['city']
})

const Hauteurs = new prometheus.Gauge({
  name: 'hauteurs',
  help: 'Hauteurs d\'eau',
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
        console.log(`Got water measurements from ${station} (${vig.Serie.LbStationHydro})`)
        const [last] = vig.Serie.ObssHydro.slice(-1)
        if (last) {
          Hauteurs.labels(station).set(last.ResObsHydro, last.DtObsHydro)
        }
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('hauteurs'))
    })
    .catch(err => res.status(500).send(err))
})

app.get('/metrics/temperatures', (req, res) => {
  let cities = []

  if (is.string(req.query.cities)) {
    cities = [req.query.cities]
  } else if (is.array(req.query.cities)) {
    cities = req.query.cities
  }

  Promise.all(cities.map(city =>
      darksky.meteo(city)
      .then(dark => {
        console.log(`Got weather measurements from ${city}`)
        const cur = dark.currently
        Temperatures.labels(city).set(cur.temperature, cur.time)
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('temperatures'))
    })
    .catch(err => res.status(500).send(err))
})

app.listen(port)

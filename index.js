const express = require('express')
const is = require('is')
const prometheus = require('prom-client')

const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const vigicrues = require('./metrics/vigicrues')
const darksky = require('./metrics/darksky')

const app = express()
const adapter = new FileAsync('db.json')

const availableCities = require('./cities.json')

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

const Debits = new prometheus.Gauge({
  name: 'debits',
  help: 'Débits d\'eau',
  labelNames: ['station']
})

const makeArray = (query, field) => {
  let result = []
  if (is.string(query[field])) {
    result = [query[field]]
  } else if (is.array(query[field])) {
    result = query[field]
  }

  return result
}

const port = process.env.PORT || 5000

low(adapter).then(db => {
  db._.mixin({
    upsert(collection, objs, ...keys) {
      objs.forEach(obj => {
        keys = keys || ['time']
        for (let i = 0; i < collection.length; i++) {
          const el = collection[i]
          if (keys.every(key => el[key] === obj[key])) {
            collection[i] = obj
            return collection
          }
        }
        collection.push(obj)
      })
    }
  })

  app.use(express.static('public'))

  app.get('/data/cities', (req, res) => {
    res.json(availableCities)
  })

  app.get('/data/stations', (req, res) => {
    vigicrues.stations('Q').then(vig => res.json(vig))
  })

  app.get('/data/station/:station', (req, res) => {
    vigicrues.informations(req.params.station).then(vig => res.json(vig))
  })

  app.get('/latest/hauteurs', (req, res) => {
    const stations = makeArray(req.query, 'stations')
    res.json(stations.map(station => db.get('current.hauteurs').find({station}).value()))
  })

  app.get('/latest/debits', (req, res) => {
    const stations = makeArray(req.query, 'stations')
    res.json(stations.map(station => db.get('current.debits').find({station}).value()))
  })

  app.get('/metrics/hauteurs', (req, res) => {
    const stations = makeArray(req.query, 'stations')

    Promise.all(stations.map(station =>
      vigicrues.observations(station, 'H')
      .then(vig => {
        const [last] = vig.Serie.ObssHydro.slice(-1)
        const arr = vig.Serie.ObssHydro.map(obs => {
          return {station, time: obs.DtObsHydro, meas: obs.ResObsHydro}
        })

        db.get('historic.hauteurs').upsert(arr, 'station', 'time').write()

        if (last) {
          db.get('current.hauteurs').upsert([{station, label: vig.Serie.LbStationHydro, time: last.DtObsHydro, meas: last.ResObsHydro}], 'station').write()
          Hauteurs.labels(station).set(last.ResObsHydro, last.DtObsHydro)
        }
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('hauteurs'))
    })
    .catch(err => {
      console.error(err)
      res.status(500).send(`${err}`)
    })
  })

  app.get('/metrics/debits', (req, res) => {
    const stations = makeArray(req.query, 'stations')

    Promise.all(stations.map(station =>
      vigicrues.observations(station, 'Q')
      .then(vig => {
        const [last] = vig.Serie.ObssHydro.slice(-1)
        const arr = vig.Serie.ObssHydro.map(obs => {
          return {station, time: obs.DtObsHydro, meas: obs.ResObsHydro}
        })

        db.get('historic.debits').upsert(arr, 'station', 'time').write()

        if (last) {
          db.get('current.debits').upsert([{station, label: vig.Serie.LbStationHydro, time: last.DtObsHydro, meas: last.ResObsHydro}], 'station').write()
          Debits.labels(station).set(last.ResObsHydro, last.DtObsHydro)
        }
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('debits'))
    })
    .catch(err => {
      console.error(err)
      res.status(500).send(`${err}`)
    })
  })

  app.get('/latest/temperatures', (req, res) => {
    const cities = makeArray(req.query, 'cities')
    res.json(cities.map(city => db.get('current.temperatures').find({city}).value()))
  })

  app.get('/metrics/temperatures', (req, res) => {
    const cities = makeArray(req.query, 'cities')

    Promise.all(cities.map(city =>
      darksky.meteo(city)
      .then(dark => {
        const curr = dark.currently
        Temperatures.labels(city).set(curr.temperature, curr.time * 1000)

        const hourly = dark.hourly
        db.get('current.temperatures').upsert([{
          city,
          time: curr.time * 1000,
          summary: curr.summary,
          icon: curr.icon,
          meas: {
            temperature: curr.temperature,
            humidity: curr.humidity,
            pressure: curr.pressure,
            windSpeed: curr.windSpeed
          }
        }], 'city').write()

        const arr = hourly.data.map(meas => {
          return {
            city,
            time: meas.time * 1000,
            summary: meas.summary,
            icon: meas.icon,
            meas: {
              temperature: meas.temperature,
              humidity: meas.humidity,
              pressure: meas.pressure,
              windSpeed: meas.windSpeed
            }
          }
        })

        db.get('historic.temperatures').upsert(arr, 'city', 'time').write()
      })
    ))
    .then(() => {
      res.set('Content-Type', prometheus.register.contentType)
      res.end(prometheus.register.getSingleMetricAsString('temperatures'))
    })
    .catch(err => {
      console.error(err)
      res.status(500).send(`${err}`)
    })
  })

  app.get('/:city/:station', (req, res) => {
    const query = req.query
    const oldQueryParams = Object.keys(query).map(key => `${key}=${encodeURIComponent(query[key])}`).join('&')

    res.redirect(`/?city=${req.params.city}&station=${req.params.station}&${oldQueryParams}`)
  })

  return db.defaults({
    historic: {
      hauteurs: [],
      debits: [],
      temperatures: []
    },
    current: {
      hauteurs: [],
      debits: [],
      temperatures: []
    }
  }).write()
}).then(() => app.listen(port))

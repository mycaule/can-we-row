const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const patriarchy = require('patriarchy')

const vigicrues = require('./metrics/vigicrues')

const adapter = new FileSync('stations.json')
const db = low(adapter)

// https://gist.github.com/liitfr/723abbfc6b8fefe01f5c918605b4d4e1
const toWGS = ({x, y}) => {
  const b7 = 298.257222101
  const b8 = 1 / b7
  const b9 = (2 * b8) - (b8 * b8)
  const b10 = Math.sqrt(b9)
  const b13 = 3
  const b14 = 700000
  const b15 = 12655612.0499
  const b16 = 0.725607765053267
  const b17 = 11754255.426096
  const delx = x - b14
  const dely = y - b15
  const gamma = Math.atan(-delx / dely)
  const r = Math.sqrt((delx * delx) + (dely * dely))
  const latiso = Math.log(b17 / r) / b16
  const sinphiit0 = Math.tanh(latiso + (b10 * Math.atanh(b10 * Math.sin(1))))
  const sinphiit1 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit0)))
  const sinphiit2 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit1)))
  const sinphiit3 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit2)))
  const sinphiit4 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit3)))
  const sinphiit5 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit4)))
  const sinphiit6 = Math.tanh(latiso + (b10 * Math.atanh(b10 * sinphiit5)))
  const longrad = (gamma / b16) + ((b13 / 180) * Math.PI)
  const latrad = Math.asin(sinphiit6)
  const lon = (longrad / Math.PI) * 180
  const lat = (latrad / Math.PI) * 180

  return {lat, lon}
}

db.defaults({
  stationsQ: [],
  stationsH: []
}).write()

vigicrues.stations('Q')
  .then(list => list.Observations.ListeStation.map(x => x.CdStationHydro))
  .then(x => {
    console.log(`wrote ${db.set('stationsQ', x).write().stationsQ.length} stations Q`)
  })

vigicrues.stations('H')
  .then(list => list.Observations.ListeStation.map(x => x.CdStationHydro))
  .then(x => {
    console.log(`wrote ${db.set('stationsH', x).write().stationsH.length} stations H `)
  })

vigicrues.informations('F700000103')
  .then(x1 => {
    const {LbStationHydro, LbCoursEau, CoordStationHydro} = x1
    console.log(patriarchy({x1}))

    console.log({
      LbStationHydro,
      LbCoursEau,
      coords: toWGS({x: CoordStationHydro.CoordXStationHydro, y: CoordStationHydro.CoordYStationHydro})
    })
  })

// TODO Make 1327 + 1747 informations request calls to Vigicrues ! Promise.all or throttle

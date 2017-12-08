/* eslint import/no-unresolved: [2, { ignore: ['\.config.js$'] }] */
/* eslint import/no-unassigned-import: "off" */
/* eslint no-unused-vars: "off" */
/* eslint new-cap: "off" */

const axios = require('axios')
const S = require('superstruct')

const Observations = S.struct({
  VersionFlux: 'string',
  GrdSerie: 'string',
  NbElements: 'number',
  Observations: {
    NbElements: 'number',
    ListeStation: [S.struct({
      DtObsHydro: 'number',
      CdStationHydro: 'string'
    })]
  },
  PasObservations: {
    NbElements: 'number',
    ListeStation: [S.struct({
      CdStationHydro: 'string'
    })]
  }
})
const Measurement = S.struct({
  time: 'number',
  summary: 'string',
  icon: 'string',
  precipIntensity: 'number',
  precipProbability: 'number',
  precipAccumulation: 'number?',
  precipIntensityMax: 'number?',
  precipIntensityMaxTime: 'number?',
  precipType: 'string?',
  temperature: 'number?',
  temperatureMin: 'number?',
  temperatureMinTime: 'number?',
  temperatureMax: 'number?',
  temperatureMaxTime: 'number?',
  temperatureLow: 'number?',
  temperatureLowTime: 'number?',
  temperatureHigh: 'number?',
  temperatureHighTime: 'number?',
  apparentTemperature: 'number?',
  apparentTemperatureMin: 'number?',
  apparentTemperatureMinTime: 'number?',
  apparentTemperatureMax: 'number?',
  apparentTemperatureMaxTime: 'number?',
  apparentTemperatureHigh: 'number?',
  apparentTemperatureHighTime: 'number?',
  apparentTemperatureLow: 'number?',
  apparentTemperatureLowTime: 'number?',
  dewPoint: 'number',
  humidity: 'number',
  pressure: 'number',
  windSpeed: 'number',
  windGust: 'number',
  windGustTime: 'number?',
  windBearing: 'number',
  cloudCover: 'number',
  uvIndex: 'number',
  uvIndexTime: 'number?',
  visibility: 'number?',
  ozone: 'number',
  sunriseTime: 'number?',
  sunsetTime: 'number?',
  moonPhase: 'number?'
})

const Forecast = S.struct({
  latitude: 'number',
  longitude: 'number',
  timezone: 'string',
  currently: Measurement,
  hourly: S.struct({
    summary: 'string',
    icon: 'string',
    data: [Measurement]
  }),
  daily: S.struct({
    summary: 'string',
    icon: 'string',
    data: [Measurement]
  }),
  flags: S.struct({
    sources: ['string'],
    'isd-stations': ['string'],
    units: 'string'
  }),
  offset: 'number'
})

try {
  require('./config')
} catch (err) {
  console.log('Using environment parameters')
}

const vigicrues = axios.create({
  baseURL: 'https://www.vigicrues.gouv.fr/services',
  timeout: 2000
})

const darksky = axios.create({
  baseURL: 'https://api.darksky.net',
  timeout: 2000
})

const observations = () =>
  vigicrues.get('/observations.json')
    .then(resp => Observations(resp.data))

const geocoder = (city = 'paris') => {
  switch (city.toLowerCase()) {
    case 'paris':
      return {lat: 48.866, lon: 2.333}
    case 'lyon':
      return {lat: 45.648, lon: 5.280}
    case 'nantes':
      return {lat: 47.109, lon: -1.114}
    default:
      return {err: `Unknown city : ${city}`}
  }
}

const meteo = (city = 'paris', key = process.env.DARKSKY_API_KEY) => {
  const gps = geocoder(city)
  return darksky.get(`/forecast/${key}/${gps.lat},${gps.lon}`)
    .then(resp => Forecast(resp.data))
}

module.exports = {
  vigiecrues: {
    observations
  },
  darksky: {
    meteo
  }
}

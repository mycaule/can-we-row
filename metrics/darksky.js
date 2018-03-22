/* eslint import/no-unresolved: [2, { ignore: ['\.config.js$'] }] */
/* eslint import/no-unassigned-import: "off" */
/* eslint new-cap: "off" */

const axios = require('axios')
const S = require('superstruct')
const Positions = require('./geocoder')

const Measurement = S.struct({
  time: 'number',
  summary: 'string',
  icon: 'string',
  precipIntensity: 'number',
  precipIntensityError: 'number?',
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
  windGust: 'number?',
  windGustTime: 'number?',
  windBearing: 'number',
  cloudCover: 'number?',
  uvIndex: 'number?',
  uvIndexTime: 'number?',
  visibility: 'number?',
  ozone: 'number',
  sunriseTime: 'number?',
  sunsetTime: 'number?',
  moonPhase: 'number?',
  nearestStormDistance: 'number?',
  nearestStormBearing: 'number?'
})

const Forecast = S.struct({
  latitude: 'number',
  longitude: 'number',
  timezone: 'string',
  currently: Measurement,
  minutely: 'object?',
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
  if (process.env.DARKSKY_API_KEY === undefined) {
    throw new Error('You must set DARKSKY_API_KEY in your environment variables')
  }
}

const darksky = axios.create({
  baseURL: 'https://api.darksky.net',
  timeout: 3000
})

const geocoder = (city = 'paris') => {
  const info = Positions.find(elt => elt.city === city.toLowerCase())
  if (info) {
    return {lat: info.lat, lon: info.lon}
  }
  throw new Error(`Unknown city: ${city}`)
}

const meteo = (city = 'paris', key = process.env.DARKSKY_API_KEY) => {
  const gps = geocoder(city)
  return darksky.get(`/forecast/${key}/${gps.lat},${gps.lon}`, {
    params: {
      units: 'si',
      lang: 'fr'
    }
  }).then(resp => {
    const forecast = Forecast(resp.data)

    const [first, ...rest] = forecast.hourly.data
    const last = rest.pop()

    if (first && last) {
      console.log('Dark Sky', `Got ${forecast.hourly.data.length} measurements for ${city} from ${first.time * 1000} to ${last.time * 1000}`)
    } else {
      console.log('Dark Sky', `No measurements available for ${city}`)
    }

    return forecast
  })
}

module.exports = {meteo}

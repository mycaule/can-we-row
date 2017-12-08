import test from 'ava'

const app = require('./app')

test('Vigiecrues', async t => {
  const observations = await app.vigiecrues.observations()
  t.is(observations.Observations.ListeStation.length, 1747)
  t.is(observations.PasObservations.ListeStation.length, 28)
})

test('Dark Sky', async t => {
  const forecast = await app.darksky.meteo('paris')
  t.is(forecast.hourly.data.length, 49)
  t.is(forecast.daily.data.length, 8)
})

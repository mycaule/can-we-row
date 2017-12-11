import test from 'ava'

const darksky = require('./darksky')

test('Dark Sky', async t => {
  const forecast = await darksky.meteo('paris')
  t.is(forecast.hourly.data.length, 49)
  t.is(forecast.daily.data.length, 8)
})

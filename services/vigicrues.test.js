import test from 'ava'

const vigicrues = require('./vigicrues')

test('stations', async t => {
  const stations = await vigicrues.stations()
  t.is(stations.Observations.NbElements, 1746)
  t.is(stations.PasObservations.NbElements, 29)
  t.is(stations.VersionFlux, 'Beta 0.3')
})

test('observations', async t => {
  const observations = await vigicrues.observations('F700000103', 'H')
  t.is(observations.VersionFlux, 'Beta 0.3')
})

test('informations', async t => {
  const informations = await vigicrues.informations('F700000103')
  t.is(informations.VersionFlux, 'Beta 0.3e')
})

test('bulletin', async t => {
  const bulletin = await vigicrues.bulletin('7')
  t.is(bulletin.version, 'Beta 0.2a')
})

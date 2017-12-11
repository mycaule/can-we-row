import test from 'ava'

const vigicrues = require('./vigicrues')

test('stations', async t => {
  const stations = await vigicrues.stations()
  t.is(stations.Observations.NbElements, 1746)
  t.is(stations.PasObservations.NbElements, 29)
  t.is(stations.VersionFlux, 'Beta 0.3')
})

test('observations', async t => {
  const obsHauteurs = await vigicrues.observations('F700000103', 'H')
  const obsDebits = await vigicrues.observations('F700000103', 'Q')
  const obsDebitsIso = await vigicrues.observations('F700000103', 'Q', 'iso')
  const obsDebitsIsoSimple = await vigicrues.observations('F700000103', 'Q', 'iso', 'simple')
  t.is(obsHauteurs.VersionFlux, 'Beta 0.3')
  t.is(obsDebits.VersionFlux, 'Beta 0.3')
  t.is(obsDebitsIso.VersionFlux, 'Beta 0.3')
  t.is(obsDebitsIsoSimple.VersionFlux, 'Beta 0.3')

  const [first, ...rest] = obsDebitsIsoSimple.Serie.ObssHydro
  const last = rest.pop()
  console.log(first)
  console.log(last)
  console.log(rest.length)
})

test('informations', async t => {
  const informations = await vigicrues.informations('F700000102')
  t.is(informations.VersionFlux, 'Beta 0.3e')
})

test('bulletin', async t => {
  const bulletin = await vigicrues.bulletin('7')
  t.is(bulletin.version, 'Beta 0.2a')
})

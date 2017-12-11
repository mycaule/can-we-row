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

  const [first, ...rest] = obsDebitsIsoSimple.Serie.ObssHydro
  const last = rest.pop()
  console.log(`Got ${rest.length + 2} measurements from ${first[0]} to ${last[0]}`)

  t.is(obsHauteurs.VersionFlux, 'Beta 0.3')
  t.is(obsDebits.VersionFlux, 'Beta 0.3')
  t.is(obsDebitsIso.VersionFlux, 'Beta 0.3')
  t.is(obsDebitsIsoSimple.VersionFlux, 'Beta 0.3')
})

test('informations', async t => {
  const informations = await vigicrues.informations('F700000102')
  t.is(informations.VersionFlux, 'Beta 0.3e')
})

test('bulletin', async t => {
  const bulletin = await vigicrues.bulletin('7')
  t.is(bulletin.version, 'Beta 0.2a')
})

test('station inconnue', async t => {
  const error = await t.throws(vigicrues.observations('F700000105', 'Q'))
  t.is(error.value[0].error_msg, 'Code de station inconnu')
})

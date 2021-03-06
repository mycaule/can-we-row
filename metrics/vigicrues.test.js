import test from 'ava'

const vigicrues = require('./vigicrues')

test('stations', async t => {
  const stationsH = await vigicrues.stations()
  t.true(stationsH.Observations.NbElements > 1700)
  t.true(stationsH.PasObservations.NbElements < 50)
  t.is(stationsH.VersionFlux, 'Beta 0.4b')

  const stationsQ = await vigicrues.stations('Q')
  t.true(stationsQ.Observations.NbElements > 1300)
  t.true(stationsQ.PasObservations.NbElements < 500)
  t.is(stationsQ.VersionFlux, 'Beta 0.4b')
})

test('observations', async t => {
  const obsH = await vigicrues.observations('F700000103', 'H')
  const obsQ = await vigicrues.observations('F700000103', 'Q')
  const obsQIso = await vigicrues.observations('F700000103', 'Q', 'iso')
  const obsQIsoSimple = await vigicrues.observations('F700000103', 'Q', 'iso', 'simple')

  t.is(obsH.VersionFlux, 'Beta 0.4b')
  t.is(obsQ.VersionFlux, 'Beta 0.4b')
  t.is(obsQIso.VersionFlux, 'Beta 0.4b')
  t.is(obsQIsoSimple.VersionFlux, 'Beta 0.4b')
})

test('informations', async t => {
  const informations = await vigicrues.informations('F700000102')
  t.is(informations.VersionFlux, 'Beta 0.3i')
})

test('previsions', async t => {
  const infos1 = await vigicrues.informations('F700000103')
  const infos2 = await vigicrues.informations('M530001010')
  t.is(infos1.VersionFlux, 'Beta 0.3i')
  t.is(infos2.VersionFlux, 'Beta 0.3i')

  const prevsH = await vigicrues.previsions('M530001010', 'H')
  const prevsQ = await vigicrues.previsions('M530001010', 'Q')
  t.is(prevsH.VersionFlux, 'Beta 0.4f')
  t.is(prevsQ.VersionFlux, 'Beta 0.4f')
})

test('bulletin', async t => {
  const bulletin = await vigicrues.bulletin('7')
  t.is(bulletin.version, 'Beta 0.2a')
})

test('station inconnue', async t => {
  const error = await t.throws(vigicrues.observations('F700000105', 'Q'))
  t.is(error.value[0].error_msg, 'Code de station inconnu')
})

test('n\'est pas une station de previsions', async t => {
  const error = await t.throws(vigicrues.previsions('F700000103'))
  t.is(error.value[0].error_msg, 'Cette station n\'est pas une station de prévisions')
})

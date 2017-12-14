import test from 'ava'

const vigicrues = require('./vigicrues')

test('stations', async t => {
  const stationsH = await vigicrues.stations()
  t.is(stationsH.Observations.NbElements, 1747)
  t.is(stationsH.PasObservations.NbElements, 28)
  t.is(stationsH.VersionFlux, 'Beta 0.3')

  const stationsQ = await vigicrues.stations('Q')
  t.is(stationsQ.Observations.NbElements, 1327)
  t.is(stationsQ.PasObservations.NbElements, 448)
  t.is(stationsQ.VersionFlux, 'Beta 0.3')
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

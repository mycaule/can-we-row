/* eslint new-cap: "off" */
/* eslint camelcase: "off" */

const axios = require('axios')
const S = require('superstruct')
const isUrl = require('is-url')

const struct = S.superstruct({
  types: {
    url: isUrl,
    simple: v => v === 'simple',
    iso: v => v === 'iso'
  }
})

const VolumeUnit = struct.enum(['H', 'Q'])

const Stations = struct({
  VersionFlux: 'string',
  GrdSerie: VolumeUnit,
  NbElements: 'number',
  Observations: {
    NbElements: 'number',
    ListeStation: [{
      DtObsHydro: 'number | string',
      CdStationHydro: 'string'
    }]
  },
  PasObservations: {
    NbElements: 'number',
    ListeStation: [{
      CdStationHydro: 'string'
    }]
  }
})

const Observations = struct({
  VersionFlux: 'string',
  Serie: {
    CdStationHydro: 'string',
    LbStationHydro: 'string',
    Link: 'url',
    GrdSerie: VolumeUnit,
    ObssHydro: struct.union([
      [['number | string', 'number']],
      [{
        DtObsHydro: 'number | string',
        ResObsHydro: 'number'
      }]
    ])
  }
})

const Previsions = struct({
  VersionFlux: 'string',
  Simul: {
    CdStationHydro: 'string',
    LbStationHydro: 'string',
    Link: 'url',
    GrdSimul: VolumeUnit,
    DtProdSimul: 'number',
    CommentSimul: 'string',
    Prevs: [{
      DtPrev: 'number',
      ResMinPrev: 'number',
      ResMoyPrev: 'number',
      ResMaxPrev: 'number'
    }]
  }
})

const Informations = struct({
  VersionFlux: 'string',
  CdStationHydro: 'string',
  LbStationHydro: 'string',
  LbCoursEau: 'string',
  CdStationHydroAncienRef: 'string',
  CoordStationHydro: {
    CoordXStationHydro: 'string',
    CoordYStationHydro: 'string'
  },
  CdCommune: 'string',
  Evenement: struct.union(['array', struct({
    DescEvenement: 'string',
    DtEvenement: 'string'
  })]),
  VigilanceCrues: {
    StationPrevision: 'string',
    Photo: 'string',
    PereBoitEntVigiCru: {
      CdEntVigiCru: 'string',
      Link: 'url'
    },
    CruesHistoriques: [{
      LbUsuel: 'string',
      ValHauteur: 'string | null',
      ValDebit: 'string | null'
    }],
    StationsBassin: [{
      CdStationHydro: 'string',
      LbStationHydro: 'string',
      LbCoursEau: 'string',
      Link: 'url'
    }],
    FluxDonnees: {
      Previsions: struct.optional({
        Hauteurs: 'url',
        Debits: 'url'
      }),
      Observations: {
        Hauteurs: 'url',
        Debits: 'url'
      }
    }
  }
})

const Bulletin = struct({
  version: 'string',
  CdEntVigiCru: 'string',
  NomEntVigiCru: 'string',
  FilsBoitEntVigiCru: [{
    CdEntVigiCru: 'string',
    NomEntVigiCru: 'string'
  }]
})

const ReqParams = struct({
  CdStationHydro: 'string',
  GrdSerie: VolumeUnit,
  FormatSortie: 'simple?',
  FormatDate: 'iso?'
})

const ReqParamsSimul = struct({
  CdStationHydro: 'string',
  GrdSimul: VolumeUnit,
  FormatSortie: 'simple?',
  FormatDate: 'iso?'
})

const VigiError = struct([{
  error_msg: 'string'
}])

const vigicrues = axios.create({
  baseURL: 'https://www.vigicrues.gouv.fr/services',
  timeout: 3000
})

const stations = (GrdSerie = 'H', FormatDate = undefined, FormatSortie = undefined) =>
  vigicrues.get('/observations.json/', {
    params: {GrdSerie, FormatDate, FormatSortie}
  }).then(resp => struct.union([Stations, VigiError])(resp.data))

const informations = CdStationHydro =>
  vigicrues.get('/station.json/', {
    params: {CdStationHydro}
  }).then(resp => struct.union([Informations, VigiError])(resp.data))

const observations = (CdStationHydro, GrdSerie = 'H', FormatDate = undefined, FormatSortie = undefined) =>
  vigicrues.get('/observations.json/index.php', {
    params: ReqParams({CdStationHydro, GrdSerie, FormatSortie, FormatDate})
  }).then(resp => {
    const obs = Observations(resp.data)

    const [first, ...rest] = obs.Serie.ObssHydro
    const last = rest.pop()

    if (first && last) {
      console.log('Vigicrues', `${CdStationHydro} ${obs.Serie.LbStationHydro}`, `Got ${obs.Serie.ObssHydro.length} measurements from ${first[0] || first.DtObsHydro} to ${last[0] || last.DtObsHydro}`)
    } else {
      console.log('Vigicrues', `${CdStationHydro} ${obs.Serie.LbStationHydro}`, `No measurements available`)
    }

    return obs
  })

const previsions = (CdStationHydro, GrdSimul = 'H', FormatDate = undefined, FormatSortie = undefined) =>
  vigicrues.get('/previsions.json/index.php', {
    params: ReqParamsSimul({CdStationHydro, GrdSimul, FormatSortie, FormatDate})
  }).then(resp => {
    const prevs = Previsions(resp.data)

    const [first, ...rest] = prevs.Simul.Prevs
    const last = rest.pop()

    if (first && last) {
      console.log('Vigicrues', `${CdStationHydro} ${prevs.Simul.LbStationHydro}`, `Got ${prevs.Simul.Prevs.length} measurements from ${first.DtPrev} to ${last.DtPrev}`)
    } else {
      console.log('Vigicrues', `${CdStationHydro} ${prevs.Simul.LbStationHydro}`, `No measurements available`)
    }

    return prevs
  })

const bulletin = CdEntVigiCru =>
  vigicrues.get('/bulletin.json/', {
    params: {CdEntVigiCru}
  }).then(resp => Bulletin(JSON.parse(resp.data.slice(0, -1).slice(1))))

module.exports = {stations, observations, previsions, informations, bulletin}

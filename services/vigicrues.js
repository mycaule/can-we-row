/* eslint import/no-unresolved: [2, { ignore: ['\.config.js$'] }] */
/* eslint import/no-unassigned-import: "off" */
/* eslint no-unused-vars: "off" */
/* eslint new-cap: "off" */

const axios = require('axios')
const S = require('superstruct')
const isUrl = require('is-url')

const struct = S.superstruct({
  types: {
    url: isUrl
  }
})

const Stations = struct({
  VersionFlux: 'string',
  GrdSerie: 'string',
  NbElements: 'number',
  Observations: {
    NbElements: 'number',
    ListeStation: [{
      DtObsHydro: 'number',
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
    GrdSerie: 'string',
    ObssHydro: [['number', 'number']]
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
  Evenement: 'array',
  VigilanceCrues: {
    StationPrevision: 'string',
    Photo: 'string',
    PereBoitEntVigiCru: {
      CdEntVigiCru: 'string',
      Link: 'url'
    },
    CruesHistoriques: [{
      LbUsuel: 'string',
      ValHauteur: 'string',
      ValDebit: 'string'
    }],
    StationsBassin: [{
      CdStationHydro: 'string',
      LbStationHydro: 'string',
      LbCoursEau: 'string',
      Link: 'url'
    }],
    FluxDonnees: {
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

const vigicrues = axios.create({
  baseURL: 'https://www.vigicrues.gouv.fr/services',
  timeout: 2000
})

const stations = () =>
  vigicrues.get('/observations.json/')
    .then(resp => Stations(resp.data))

const informations = CdStationHydro =>
  vigicrues.get('/station.json/', {
    params: {CdStationHydro}
  }).then(resp => Informations(resp.data))

const observations = (CdStationHydro, GrdSerie = 'H', FormatDate = 'iso', FormatSortie = 'simple') =>
  vigicrues.get('/observations.json/index.php', {
    params: {CdStationHydro, GrdSerie, FormatSortie}
  }).then(resp => Observations(resp.data))

const bulletin = CdEntVigiCru =>
  vigicrues.get('/bulletin.json/', {
    params: {CdEntVigiCru}
  }).then(resp => Bulletin(JSON.parse(resp.data.slice(0, -1).slice(1))))

module.exports = {stations, observations, informations, bulletin}

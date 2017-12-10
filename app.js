const patriarchy = require('patriarchy')
const vigicrues = require('./services/vigicrues')
const darksky = require('./services/darksky')

vigicrues.informations('F700000103')
  .then(res => console.log(patriarchy(res)))

vigicrues.observations('F700000103', 'Q', 'iso', 'simple')
  .then(res => console.log(
    res.Serie.ObssHydro.slice(-10)
  ))

module.exports = {vigicrues, darksky}

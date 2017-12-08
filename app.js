const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')

const WATER_URL = 'http://www.vigicrues.gouv.fr/niveau3.php?idstation=742&idspc=7&typegraphe=q&AffProfondeur=72&AffRef=auto&AffPrevi=non&nbrstations=2&ong=2'
const WEATHER_URL = 'https://api.forecast.io/forecast/1b7e6434c00f230769978325857f97fc/48.8534100,2.3488000'

axios.get(WATER_URL)
  .then((err, res, html) => {
    if (!err && res.statusCode === 200) {
      const $ = cheerio.load(html)
      $('table.liste tr').each((i, row) => {
        if (i > 0) {
          const day = moment(row.children[0].children[0].data, 'DD/MM/YYYY HH:mm').calendar()
          const debit = parseInt(row.children[1].children[0].data, 10)
          console.log(day + '  ' + debit + ' m3/s')
        }
      })
    }
  })

axios.get(WEATHER_URL)
  .then((err, res, body) => {
    if (!err && res.statusCode === 200) {
      const currently = JSON.parse(body).currently
      console.log(currently.summary)
      console.log(currently.temperature)
      console.log(currently.windSpeed)
      console.log(currently.pressure)
    }
  })

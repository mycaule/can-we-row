'use strict';

var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var WATER_URL = 'http://www.vigicrues.gouv.fr/niveau3.php?idstation=742&idspc=7&typegraphe=q&AffProfondeur=72&AffRef=auto&AffPrevi=non&nbrstations=2&ong=2';
var WEATHER_URL = 'https://api.forecast.io/forecast/1b7e6434c00f230769978325857f97fc/48.8534100,2.3488000';

request(WATER_URL, function (err, res, html) {
  if (!err && res.statusCode == 200) {
    var $ = cheerio.load(html);
    $('table.liste tr').each(function(i, row) {
      if (i>0) {
        var day = moment(row.children[0].children[0].data, 'DD/MM/YYYY HH:mm').calendar();
        var debit = parseInt(row.children[1].children[0].data, 10);
        console.log(day + '  ' + debit + ' m3/s');
      }
    });
  }
});

request(WEATHER_URL, function(err, res, body) {
  if (!err && res.statusCode == 200) {
    var currently = JSON.parse(body).currently;
    console.log(currently.summary);
    console.log(currently.temperature);
    console.log(currently.windSpeed);
    console.log(currently.pressure);
  }
})


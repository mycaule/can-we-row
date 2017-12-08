<p align="center">
  Can we row?
</p>

<p align="center">
  <a href="http://travis-ci.org/mycaule/can-we-row"><img src="https://api.travis-ci.org/mycaule/can-we-row.svg?branch=master" alt="Build Status"></a>
  <a href="https://david-dm.org/mycaule/can-we-row"><img src="https://david-dm.org/mycaule/can-we-row/status.svg" alt="dependencies Status"></a>
  <a href="https://david-dm.org/mycaule/can-we-row?type=dev"><img src="https://david-dm.org/mycaule/can-we-row/dev-status.svg" alt="devDependencies Status"></a>
	<br>
	<a href="https://www.npmjs.com/package/can-we-row"><img src="https://img.shields.io/npm/l/can-we-row.svg" alt="npm package"></a>
  <br>
  <br>
</p>

Can we row? Based on water level and weather.

For rowers in Paris, a simple website to check if you can row based on water levels and weather.

Scraping using `cheerio` on [Vigicrues](http://www.vigicrues.gouv.fr) website and using the [Dark Sky API](https://darksky.net/dev/docs).


## Usage

Please make sure to set `process.env.DARKSKY_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'`

## Contributions

[Changes and improvements](https://github.com/mycaule/can-we-row/wiki) are welcome! Feel free to fork and open a pull request into `master`.

### Roadmap

- [ ] Build a backend application
- [ ] Build a web interface with React
* Set the limit: default 700 m3/s
* Select Day of the week: default Wed and Sat
* Select min temperature : 10°C
* Provide URLs you can copy paste in your bookmarks

### License
`can-we-row` is licensed under the [MIT License](https://github.com/mycaule/can-we-row/blob/master/LICENSE).

## References

* [Vigiecrues](http://www.vigicrues.gouv.fr)
* [Dark Sky API](https://darksky.net/dev/docs)

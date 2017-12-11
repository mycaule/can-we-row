<p align="center">
  Can we row?
</p>

<p align="center">
  <a href="http://travis-ci.org/mycaule/can-we-row"><img src="https://api.travis-ci.org/mycaule/can-we-row.svg?branch=master" alt="Build Status"></a>
  <a href="https://david-dm.org/mycaule/can-we-row"><img src="https://david-dm.org/mycaule/can-we-row/status.svg" alt="dependencies Status"></a>
  <a href="https://david-dm.org/mycaule/can-we-row?type=dev"><img src="https://david-dm.org/mycaule/can-we-row/dev-status.svg" alt="devDependencies Status"></a>
  <br>
  <br>
</p>

Can we row? Based on water level and weather.

A simple website for rowers to check if they can row based on different time-series metrics (water levels, weather).

## Usage

Please make sure to set `process.env.DARKSKY_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'`

## Contributions

[Changes and improvements](https://github.com/mycaule/can-we-row/wiki) are welcome! Feel free to fork and open a pull request into `master`.

### Roadmap

- [x] Investigate on common threshold detection techniques for time series and IT monitoring techniques ([Prometheus](https://prometheus.io))
- [ ] Build a web interface with React [Reason-React](https://reasonml.github.io/reason-react/docs/en/installation.html)
  * Set the limit: default 700 m3/s
  * Select Day of the week: default Wed and Sat
  * Select min temperature : 10°C
  * Provide URLs you can copy paste in your bookmarks
- [ ] Use [prophet](https://github.com/facebook/prophet) to forecast conditions

### License
`can-we-row` is licensed under the [MIT License](https://github.com/mycaule/can-we-row/blob/master/LICENSE).

## References

* [Vigicrues](https://www.vigicrues.gouv.fr), [Terms of use](https://www.data.gouv.fr/fr/datasets/hauteurs-deau-et-debits-des-cours-deau-observes-en-temps-reel-aux-stations-du-reseau-vigicrues/)
* [Vigilance Meteo France](https://vigilance.meteofrance.com/)
* [Dark Sky API](https://darksky.net/dev/docs)

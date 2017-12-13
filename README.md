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

A simple webapp for rowers to check if they can row based on different time-series metrics (water levels, weather).

The project uses [French government dataset on rivers activity](https://www.data.gouv.fr/en/reuses/ca-rame-ou-pas/).

It is available for the following French cities: Amiens, Besançon, Bordeaux, Caen, Châlons-en-Champagne, Clermont-Ferrand, Dijon, Lille, Limoges, Lyon, Marseille, Metz, Montpellier, Nantes, Orléans, Paris, Poitiers, Rennes, Rouen, Strasbourg, Toulouse.

[Open an issue](https://github.com/mycaule/can-we-row/issues) if the data is incorrect or if you want [your city to appear on the list](https://github.com/mycaule/can-we-row/issues/1). You can also check [the roadmap for this application](#user-content-roadmap).

I hope you have lots of fun using it!

## Setup

The web application serves a `/metrics` endpoint to scrape historical data and to expose latest to the [Prometheus](https://github.com/prometheus/prometheus) monitoring system. A summary of the latest data can be obtained using `/latest`.

### Routes

[`GET /metrics/hauteurs?stations=...`](https://can-we-row.herokuapp.com/metrics/hauteurs?stations=F700000103&stations=U472002001&stations=O972001001&stations=M800001010&stations=O222251001&stations=A060005050)

```bash
# HELP hauteurs Observations par hauteur H
# TYPE hauteurs gauge
hauteurs{station="F700000103"} 1.46 1512993000000
hauteurs{station="M800001010"} 5.26 1512994800000
hauteurs{station="O222251001"} -0.18 1512995400000
hauteurs{station="U472002001"} 2.32 1512993600000
hauteurs{station="O972001001"} 5.23 1512995400000
hauteurs{station="A060005050"} 2.87 1512993600000
```

[`GET /metrics/temperatures?cities=...`](https://can-we-row.herokuapp.com/metrics/temperatures?cities=paris&cities=lyon)

```bash
# HELP temperatures Températures
# TYPE temperatures gauge
temperatures{city="paris"} 5.56 1513008710000
temperatures{city="lyon"} 7.46 1513008710000
```

[`GET /latest/temperatures?cities=...`](https://can-we-row.herokuapp.com/latest/temperatures?cities=paris&cities=lyon)

```javascript
[{
  city: "paris",
  time: 1513086316000,
  meas: 5.63
}, {
  city: "lyon",
  time: 1513086316000,
  meas: 5.44
}]
```

[`GET /latest/hauteurs?stations=...`](https://can-we-row.herokuapp.com/latest/hauteurs?stations=F700000103&stations=U472002001&stations=O972001001&stations=M800001010&stations=O222251001&stations=A060005050)

```javascript
[{
  station: "F700000103",
  time: 1513083000000,
  meas: 1.89
}, {
  station: "U472002001",
  time: 1513080000000,
  meas: 2.32
}, {
  station: "O972001001",
  time: 1513083300000,
  meas: 4.59
}, {
  station: "M800001010",
  time: 1513081200000,
  meas: 5.46
}, {
  station: "O222251001",
  time: 1513082700000,
  meas: -0.39
}, {
  station: "A060005050",
  time: 1513080000000,
  meas: 3.07
}]
```

### Setting up API keys

Go to [darksky.net](https://darksky.net/dev) to get a developer access to their API. Then, make sure to set `process.env.DARKSKY_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'` before running the web server.

[Vigicrues](https://www.vigicrues.gouv.fr) doesn't need an API key.

### Running a Prometheus instance

```bash
docker run --name prometheus -d -p 127.0.0.1:9090:9090 quay.io/prometheus/prometheus
```

Configuring the Prometheus scrapers.
```bash
# Login into the docker instance
docker exec -it prometheus sh

# Edit the config file to match our template /config/prometheus.yml
vi /etc/prometheus/prometheus.yml

# Get the pid for prometheus
ps -ef

# Reload Prometheus configuration
kill -HUP [pid]
```

## Contributions

Changes and improvements are welcome! Feel free to fork and open a pull request into `master`.

### Roadmap

- [ ] UI: [Threshold detection](https://github.com/mycaule/can-we-row/wiki/Threshold-detection)
- [ ] UI: Graphing past few days historical data and forecasts for next days
- [ ] Calendar: Ability to select future day of the week
- [ ] Calendar: Ability to rate and comment past hikes though FB comments
- [ ] Data quality: Add more metrics (météo des plages, météo des neiges)
- [ ] Purpose: Investigate about Kayak and also river sports events
- [ ] Alert: Add email alerts with custom rules based on thresholds
- [ ] Time series: which one is [the best for our usecase](https://github.com/mycaule/can-we-row/wiki/Time-series-aggregation)
- [ ] Migration: from LowDB to another DB
- [ ] Cartography: provide information [on local map](https://github.com/mycaule/can-we-row/wiki/Cartography)

### License

`can-we-row` is licensed under the [MIT License](https://github.com/mycaule/can-we-row/blob/master/LICENSE).

## References

### Data sources
* [Vigicrues](https://www.vigicrues.gouv.fr), [Terms of use](https://www.data.gouv.fr/fr/datasets/hauteurs-deau-et-debits-des-cours-deau-observes-en-temps-reel-aux-stations-du-reseau-vigicrues/)
* [Vigilance Meteo France](https://vigilance.meteofrance.com/)
* [Dark Sky API](https://darksky.net/dev/docs)
* [Banque Hydro](http://hydro.eaufrance.fr/selection.php?consulte=rechercher), historical data from 1900 to nowadays
* [Repères de crues](www.reperesdecrues.developpement-durable.gouv.fr)

### Application
* [Prometheus](https://github.com/prometheus/prometheus)
* [Marceau Leboeuf - river Alert](https://github.com/MarceauLeboeuf/river_Alert), written in Processing
* [Mavo - A new, approachable way to create Web applications](https://mavo.io/)

### Usability
* [Fédération Française d'Aviron](http://avironfrance.fr/pratiquer-aviron/trouver-club/cartographie) : 556 clubs / [events](http://avironfrance.fr/pratiquer-aviron/programmes-federaux/circuit-randon-aviron)
* [Fédération Française de Canoé-Kayak](http://www.ffck.org/trouver-un-club/), [events](http://www.ffck.org/loisirs/riviere/manifestations/)

/* global moment, v, echarts */

const graph3 = echarts.init(document.getElementById('graph3'))

const getCitiesRef = () => fetch(`/data/cities`).then(res => {
  if (res.ok) {
    return res.json()
  }
  return []
})

const getStationsRef = () => fetch(`/data/stations`).then(res => {
  if (res.ok) {
    return res.json()
  }
  return []
})

const linkTo = (city, citiesRef) => {
  const station = citiesRef.find(elt => elt.city === city).stations[0]
  return station ? `/?city=${city}&station=${station}` : '/'
}

const searchParams = () => {
  const url = new URL(window.location.href)
  return {
    city: url.searchParams.get('city'),
    station: url.searchParams.get('station'),
    temperature: url.searchParams.get('temperature'),
    volume: url.searchParams.get('volume')
  }
}

document.addEventListener('mv-change', evt => {
  console.log(evt.action, evt.property, evt.value)

  if (evt.action === 'propertychange') {
    if (evt.property === 'datetime') {
      console.log(evt.value)
    }

    if (evt.property === 'city') {
      const {city} = searchParams()

      if (evt.value !== city) {
        getCitiesRef().then(cities => {
          window.location.href = linkTo(evt.value, cities)
        })
      }
    }
  }
})

const $ = s => document.querySelector(s)

const reloadMetrics = (city, station) => () =>
  Promise.all([
    fetch(`/metrics/temperatures?cities=${city}`),
    fetch(`/metrics/debits?stations=${station}`)
  ]).then(([res1, res2]) => {
    if (res1.ok && res2.ok) {
      location.reload()

      // FIX Mavo.Expressions.update()
    }
  }).catch(err => {
    console.log(err)
  })

const provideHelp = station => () => {
  console.log(station)
  window.location.href = 'https://github.com/mycaule/can-we-row/issues/1'
}

const setOpenGraphHeaders = (city, station) => {
  $('meta[property=\'og:url\']').content = `https://can-we-row.herokuapp.com/${city}/${station}`
  $('meta[property=\'og:description\']').content = `Conditions extérieures à ${v.titleCase(city)} pour l'aviron`
}

const initHTMLFields = (city, station, citiesRef, stationsRef) => {
  const stations = $('select[property=\'station\']')
  const cities = $('select[property=\'city\']')

  citiesRef.forEach(elt => {
    const opt1 = document.createElement('option')
    opt1.text = elt.label
    opt1.value = elt.city
    cities.add(opt1)

    if (elt.city === city) {
      elt.stations.forEach(sta => {
        const match = stationsRef.find(elt => elt.station === sta)
        const opt2 = document.createElement('option')
        opt2.text = match.label
        opt2.value = match.station
        stations.add(opt2)
      })
    }
  })

  stations.value = station
  cities.value = city
}

const fillWeatherReport = (city, station) =>
  fetch(`/latest/temperatures?cities=${city}`)
    .then(res => {
      if (res.ok) {
        res.json().then(data => {
          if (data.filter(n => n).length === 0) {
            $('.temperature').textContent = `Service indisponible`
            reloadMetrics(city, station)()
          } else {
            const curr = data.find(elt => elt.city === city)
            $('.temperature').textContent = `${curr.meas.temperature.toFixed(1)} °C | ${curr.meas.windSpeed.toFixed(1)} km/h`

            $('.temperature-time').textContent = moment.unix(curr.time / 1000).locale('fr').fromNow()

            $('meta[property=\'temperature\']').content = curr.meas.temperature
            $('meta[property=\'icon\']').content = curr.icon
            $('meta[property=\'summary\']').content = `${v.lowerCase(curr.summary)} | Humid. ${(curr.meas.humidity * 100).toFixed(0)} % | Press. ${curr.meas.pressure.toFixed(0)} hPa`
            console.log(curr)
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

// See https://github.com/mycaule/visus-vigicrues
const getDebitsLastMonth = obs => {
  const dateMin = moment.unix(obs[0].time / 1000).format('YYYY-MM-DD')
  const dateMax = moment.unix(obs.slice(-1)[0].time / 1000).format('YYYY-MM-DD')
  const data = obs.reduce((acc, x) => {
    const date = moment.unix(x.time / 1000)
    acc.push([date.format('YYYY-MM-DD'), x.meas])
    return acc
  }, [])

  return [data, dateMin, dateMax]
}

const drawLastMonth = (observations, levelMax) => {
  console.log('drawLastMonth', observations)
  const [data, dateMin, dateMax] = getDebitsLastMonth(observations)

  console.log('drawLastMonth', dateMin, dateMax)
  const calStart = moment(dateMin).startOf('month').format('2017-MM-DD')
  const calEnd = moment(dateMax).endOf('month').format('2017-MM-DD')

  const option = {
    backgroundColor: '#404a59',

    title: {
      top: 30,
      text: 'Données du mois dernier',
      subtext: 'Source: vigicrues.com',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '30',
      left: '100',
      data: ['Danger'],
      textStyle: {
        color: '#fff'
      }
    },
    calendar: [{
      top: 100,
      left: 'center',
      range: [calStart, calEnd],
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 4,
          type: 'solid'
        }
      },
      yearLabel: {
        formatter: '{start}',
        textStyle: {
          color: '#fff'
        }
      },
      itemStyle: {
        normal: {
          color: '#323c48',
          borderWidth: 1,
          borderColor: '#111'
        }
      }
    }],
    series: [
      {
        name: 'Autres',
        type: 'scatter',
        coordinateSystem: 'calendar',
        data,
        symbolSize(val) {
          return val[1] / 50
        },
        itemStyle: {
          normal: {
            color: '#ddb926'
          }
        }
      },
      {
        name: 'Autres',
        type: 'scatter',
        coordinateSystem: 'calendar',
        calendarIndex: 1,
        data,
        symbolSize(val) {
          return val[1] / 50
        },
        itemStyle: {
          normal: {
            color: '#ddb926'
          }
        }
      },
      {
        name: 'Danger',
        type: 'effectScatter',
        coordinateSystem: 'calendar',
        calendarIndex: 1,
        data: data.filter(x => x[1] > levelMax),
        symbolSize(val) {
          return val[1] / 50
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        itemStyle: {
          normal: {
            color: '#f4e925',
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        zlevel: 1
      },
      {
        name: 'Danger',
        type: 'effectScatter',
        coordinateSystem: 'calendar',
        data: data.filter(x => x[1] > levelMax),
        symbolSize(val) {
          return val[1] / 50
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        itemStyle: {
          normal: {
            color: '#f4e925',
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        zlevel: 1
      }
    ]
  }

  graph3.setOption(option, true)
}

const fillWaterReport = station =>
  fetch(`/latest/debits?stations=${station}`)
    .then(res => {
      if (res.ok) {
        res.json().then(data => {
          if (data.filter(n => n).length === 0) {
            $('.water-level').textContent = `Service indisponible`
          } else {
            const curr = data.find(elt => elt.station === station)
            $('.water-level').textContent = `${curr.meas.toFixed(1)} m³/s`
            $('.water-level-time').textContent = moment.unix(curr.time / 1000).locale('fr').fromNow()
            $('meta[property=\'stationLabel\']').content = curr.label
            $('meta[property=\'level\']').content = curr.meas
            $('time[property=\'datetime\']').setAttribute('datetime', moment().format('YYYY-MM-DD'))
            console.log(curr)

            const levelMax = $('input[property=\'levelMax\']').value
            drawLastMonth(curr.historic, levelMax)
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

const {city, station} = searchParams()

if (city === null || station === null) {
  window.location.href = '/?city=paris&station=F700000103'
} else {
  $('.refresh-data').onclick = reloadMetrics(city, station)
  $('.help-station').onclick = provideHelp(station)

  setOpenGraphHeaders(city, station)

  getCitiesRef().then(cities => {
    getStationsRef(station).then(stations => initHTMLFields(city, station, cities, stations))
    fillWeatherReport(city, station)
    fillWaterReport(station)
  })
}

/* global moment, Mavo, v */

const availableCities = [
  {
    city: 'amiens',
    label: 'Amiens',
    stations: ['E640091001']
  }, {
    city: 'besancon',
    label: 'Besançon',
    stations: ['U251542001']
  }, {
    city: 'bordeaux',
    label: 'Bordeaux',
    stations: ['O919001001']
  }, {
    city: 'caen',
    label: 'Caen',
    stations: ['I362101001']
  }, {
    city: 'chalons',
    label: 'Châlons-en-Champagne',
    stations: ['H520101003']
  }, {
    city: 'clermont',
    label: 'Clermont-Ferrand',
    stations: ['K322201001']
  }, {
    city: 'dijon',
    label: 'Dijon',
    stations: ['U132401001']
  }, {
    city: 'lille',
    label: 'Lille',
    stations: ['E381126501']
  }, {
    city: 'limoges',
    label: 'Limoges',
    stations: ['L040061002']
  }, {
    city: 'lyon',
    label: 'Lyon',
    stations: ['V163002002']
  }, {
    city: 'marseille',
    label: 'Marseille',
    stations: ['Y442404001']
  }, {
    city: 'metz',
    label: 'Metz',
    stations: ['A743061001']
  }, {
    city: 'montpellier',
    label: 'Montpellier',
    stations: ['Y321001001']
  }, {
    city: 'nantes',
    label: 'Nantes',
    stations: ['M530001010']
  }, {
    city: 'orleans',
    label: 'Orléans',
    stations: ['K435001010']
  }, {
    city: 'paris',
    label: 'Paris',
    stations: ['F700000103']
  }, {
    city: 'poitiers',
    label: 'Poitiers',
    stations: ['L250161001']
  }, {
    city: 'rennes',
    label: 'Rennes',
    stations: ['J709063002']
  }, {
    city: 'rouen',
    label: 'Rouen',
    stations: ['H438021010']
  }, {
    city: 'strasbourg',
    label: 'Strasbourg',
    stations: ['A061005051']
  }, {
    city: 'toulouse',
    label: 'Toulouse',
    stations: ['O200001001']
  }
]

const getCitiesRef = () => fetch(`/data/cities`).then(res => {
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

Mavo.Functions.changeDateTime = newDateTime => {
  console.log('--changeDateTime')
  console.log(newDateTime)
  return newDateTime
}

Mavo.Functions.changeCity = newCity => {
  console.log('--changeCity')
  console.log(newCity)
  const {city} = searchParams()

  if (newCity === city) {
    console.log('staying here!')
  } else {
    window.location.href = linkTo(newCity, availableCities)
  }

  return newCity
}

const $ = s => document.querySelector(s)

const reloadMetrics = (city, station) => () =>
  Promise.all([
    fetch(`/metrics/temperatures?cities=${city}`),
    fetch(`/metrics/debits?stations=${station}`)
  ]).then(([res1, res2]) => {
    if (res1.ok && res2.ok) {
      location.reload()
    }
  }).catch(err => {
    console.log(err)
  })

const setOpenGraphHeaders = (city, station) => {
  $('meta[property=\'og:url\']').setAttribute('content', `https://can-we-row.herokuapp.com/${city}/${station}`)
  $('meta[property=\'og:description\']').setAttribute('content', `Conditions extérieures à ${v.titleCase(city)} pour l'aviron`)
}

const initHTMLFields = (city, station, citiesRef) => {
  const stations = $('select[property=\'station\']')
  const cities = $('select[property=\'city\']')

  citiesRef.forEach(elt => {
    const opt1 = document.createElement('option')
    opt1.text = elt.label
    opt1.value = elt.city
    cities.add(opt1)

    if (elt.city === city) {
      elt.stations.forEach(sta => {
        const opt2 = document.createElement('option')

        opt2.text = sta
        opt2.value = sta
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
            $('.temperature').textContent = `${v.lowerCase(curr.summary)}, ${curr.meas.temperature.toFixed(1)} °C`

            $('.temperature-time').textContent = `Humid. ${(curr.meas.humidity * 100).toFixed(0)} %, Press. ${curr.meas.pressure.toFixed(0)} hPa, Vent ${curr.meas.windSpeed.toFixed(1)} km/h, ${moment.unix(curr.time / 1000).locale('fr').fromNow()}`

            $('input[property=\'temperature\']').setAttribute('value', curr.meas.temperature)
            $('input[property=\'icon\']').setAttribute('value', curr.icon)
            console.log(curr)
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

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
            $('.water-level-time').textContent = `${curr.label}, ${moment.unix(curr.time / 1000).locale('fr').fromNow()}`
            $('input[property=\'level\']').setAttribute('value', curr.meas)
            $('time[property=\'datetime\']').setAttribute('datetime', moment().format('YYYY-MM-DD'))
            console.log(curr)
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

  setOpenGraphHeaders(city, station)

  getCitiesRef().then(cities => {
    initHTMLFields(city, station, cities)
    fillWeatherReport(city, station)
    fillWaterReport(station)
  })
}

/* global moment, Mavo, v */

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

Mavo.Functions.changeDateTime = newDateTime => {
  if (newDateTime) {
    console.log('--changeDateTime')
    console.log(newDateTime)
  }
  return newDateTime
}

Mavo.Functions.changeCity = newCity => {
  if (newCity) {
    console.log('--changeCity')
    const {city} = searchParams()

    if (newCity !== city) {
      getCitiesRef().then(cities => {
        window.location.href = linkTo(newCity, cities)
      })
    }
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

      // FIX Mavo.Expressions.update()
    }
  }).catch(err => {
    console.log(err)
  })

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

            $('input[property=\'temperature\']').value = curr.meas.temperature
            $('input[property=\'icon\']').value = curr.icon
            $('input[property=\'summary\']').value = `${v.lowerCase(curr.summary)} | Humid. ${(curr.meas.humidity * 100).toFixed(0)} % | Press. ${curr.meas.pressure.toFixed(0)} hPa`
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
            $('.water-level-time').textContent = moment.unix(curr.time / 1000).locale('fr').fromNow()
            $('input[property=\'stationLabel\']').value = curr.label
            $('input[property=\'level\']').value = curr.meas
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
    getStationsRef(station).then(stations => initHTMLFields(city, station, cities, stations))
    fillWeatherReport(city, station)
    fillWaterReport(station)
  })
}

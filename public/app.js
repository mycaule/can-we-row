/* global moment, Mavo */

const findStation = city => {
  switch (city) {
    case 'amiens': return 'E640091001'
    case 'besancon': return 'U251542001'
    case 'bordeaux': return 'O919001001'
    case 'caen': return 'I362101001'
    case 'chalons': return 'H520101003'
    case 'clermont': return 'K322201001'
    case 'dijon': return 'U132401001'
    case 'lille': return 'E381126501'
    case 'limoges': return 'L040061002'
    case 'lyon': return 'V163002002'
    case 'marseille': return 'Y442404001'
    case 'metz': return 'A743061001'
    case 'montpellier': return 'Y321001001'
    case 'nantes': return 'M530001010'
    case 'orleans': return 'K435001010'
    case 'paris': return 'F700000103'
    case 'poitiers': return 'L250161001'
    case 'rennes': return 'J709063002'
    case 'rouen': return 'H438021010'
    case 'strasbourg': return 'A061005051'
    case 'toulouse': return 'O200001001'
    default: return undefined
  }
}

const linkTo = city => {
  const station = findStation(city)

  if (station) {
    return `/?city=${city}&station=${station}`
  }

  return '/'
}

Mavo.Functions.onchange = newCity => {
  const oldUrl = new URL(window.location.href)
  const oldParams = oldUrl.searchParams
  const oldCity = oldParams.get('city')

  if (newCity === oldCity) {
    console.log('staying here!')
  } else {
    window.location.href = linkTo(newCity)
  }
}

const $ = s => document.querySelector(s)

const url = new URL(window.location.href)
const params = url.searchParams
const city = params.get('city')
const station = params.get('station')

const selectItemByValue = (elt, value) => {
  for (let i = 0; i < elt.options.length; i++) {
    if (elt.options[i].value === value) {
      elt.selectedIndex = i
      break
    }
  }
}

const reloadMetrics = (city, station) => () =>
    Promise.all([
      fetch(`/metrics/temperatures?cities=${city}`),
      fetch(`/metrics/debits?stations=${station}`)
    ]).then(([res1, res2]) => {
      if (res1.ok && res2.ok) {
        location.reload()
      }
    })

if (city === null || station === null) {
  window.location.href = '/?city=paris&station=F700000103'
} else {
  $('.refresh-data').onclick = reloadMetrics(city, station)
  selectItemByValue($('#cities'), city)
  $('#cities').value = city

  fetch(`/latest/temperatures?cities=${city}`)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          if (data.filter(n => n).length === 0) {
            reloadMetrics(city, station)()
          } else {
            const curr = data.find(elt => elt.city === city)
            $('.temperature').textContent = `${curr.meas.temperature.toFixed(1)} °C, ${curr.summary} ${curr.icon}`

            $('.temperature-time').textContent = `Humid. ${(curr.meas.humidity * 100).toFixed(0)} %, ${curr.meas.pressure.toFixed(0)} hPa, Vent ${curr.meas.windSpeed.toFixed(1)} km/h, ${moment.unix(curr.time / 1000).lang('fr').fromNow()}`

            $('input[property=\'temperature\']').setAttribute('value', curr.meas.temperature)
            console.log(curr)
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

  fetch(`/latest/debits?stations=${station}`)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          if (data.filter(n => n).length === 0) {
            $('.water-level').textContent = `Aucune mesure de débit`
          } else {
            const curr = data.find(elt => elt.station === station)
            $('.water-level').textContent = `${curr.meas.toFixed(1)} m³/s`
            $('.water-level-time').textContent = `à ${curr.label}, ${moment.unix(curr.time / 1000).lang('fr').fromNow()}`
            $('input[property=\'level\']').setAttribute('value', curr.meas)
            $('.current-date').textContent += ` ${moment().lang('fr').format('ll')}`
            console.log(curr)
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

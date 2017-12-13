/* global moment, v */

const $ = s => document.querySelector(s)

const url = new URL(window.location.href)
const params = url.searchParams
const city = params.get('city')
const station = params.get('station')

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

  fetch(`/latest/temperatures?cities=${city}`)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          if (data.filter(n => n).length === 0) {
            reloadMetrics(city, station)()
          } else {
            const curr = data.find(elt => elt.city === city)
            $('.title').textContent += ` à ${v.titleCase(curr.city)}`
            $('.temperature').textContent = `${curr.meas.toFixed(1)} °C`
            $('.temperature-time').textContent = moment.unix(curr.time / 1000).lang('fr').fromNow()

            $('input[property=\'temperature\']').setAttribute('value', curr.meas)
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
            $('.water-level-time').textContent = moment.unix(curr.time / 1000).lang('fr').fromNow()
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

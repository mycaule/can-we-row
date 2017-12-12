/* global moment, v */

const $ = s => document.querySelector(s)

const url = new URL(window.location.href)
const params = url.searchParams
const city = params.get('city')
const station = params.get('station')

if (city === null || station === null) {
  window.location.href = '/?city=paris&station=F700000103'
} else {
  $('.refresh-data').onclick = () => {
    console.log('Refreshing')

    Promise.all([
      fetch(`/metrics/temperatures?cities=${city}`),
      fetch(`/metrics/hauteurs?stations=${station}`)
    ]).then(([res1, res2]) => {
      if (res1.ok && res2.ok) {
        location.reload()
      }
    })
  }

  fetch(`/latest/temperatures?cities=${city}`)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          const curr = data.find(elt => elt.city === city)
          $('.city').textContent = v.titleCase(curr.city)
          $('.temperature').textContent = `${curr.meas} °C (${moment.unix(curr.time / 1000).lang('fr').fromNow()})`
          console.log(curr)
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

  fetch(`/latest/hauteurs?stations=${station}`)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          const curr = data.find(elt => elt.station === station)
          $('.water-level').textContent = `${curr.meas} mètres (${moment.unix(curr.time / 1000).lang('fr').fromNow()})`
          $('.current-date').textContent = `${moment().lang('fr').format('LLL')}`
          console.log(curr)
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

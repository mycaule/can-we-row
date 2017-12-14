const moment = require('moment')

// https://github.com/dbushell/Pikaday
// https://momentjs.com/docs/#/displaying/calendar-time/

Array.from(Array(3), (_, x) => x + 1).reverse().forEach(elt => {
  const str = moment().locale('fr').subtract(elt, 'days').calendar()
  console.log(`${elt} ${str}`)
})

const str = moment().locale('fr').calendar()
console.log(`0 ${str}`)

Array.from(Array(3), (_, x) => x + 1).forEach(elt => {
  const str = moment().locale('fr').add(elt, 'days').calendar()
  console.log(`${elt} ${str}`)
})

import test from 'ava'

const app = require('./app')

test('Application', t => {
  t.is(typeof app.vigicrues, 'object')
  t.is(typeof app.darksky, 'object')
})

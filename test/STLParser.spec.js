import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')

// these two are needed by the parser
// import Rx from 'rx'
// let Rx = require('rx')
import assign from 'fast.js/object/assign'
import parse, { outputs } from '../src/index'
// import parse, {outputs}'../lib/stl-parser'

test.cb('STL parser tests: can parse ascii stl files', t => {
  //this.timeout(5000)
  let data = fs.readFileSync('./data/slotted_disk_ascii.stl', 'binary')
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(function (parsedSTL) {
    t.deepEqual(parsedSTL.positions.length / 3, 864) // we divide by three because each entry is 3 long
    t.end()
  })
})

test.cb('STL parser tests: can parse binary stl files', t => {
  let data = fs.readFileSync('./data/pr2_head_pan_bin.stl', 'binary')
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(function (parsedSTL) {
    t.deepEqual(parsedSTL.positions.length / 3, 3000) // we divide by three because each entry is 3 long
    t.end()
  })
})

test.cb('STL parser tests: should handle errors gracefully', t => {
  let data = {foo: '42'}
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(undefined, function (error) {
    t.deepEqual(error.message, 'First argument to DataView constructor must be an ArrayBuffer')
    t.end()
  })
})

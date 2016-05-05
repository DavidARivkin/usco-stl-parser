//'use strict'
// importScripts('./stl-utils.js')
import { parseSteps } from './parseHelpers'
//var parseSteps = require('./parseHelpers').parseSteps

module.exports = function () {
  self.onmessage = function (event) {
    let result = parseSteps(event.data.data)

    let positions = result.positions.buffer
    let normals = result.normals.buffer

    console.log('here in stl parser worker')

    //console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
    self.postMessage({positions, normals}, [positions, normals])
    if('close' in self) {
      self.close()
    }
  }
}

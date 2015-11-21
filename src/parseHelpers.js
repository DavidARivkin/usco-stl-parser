export function parseBinaryThree (data) {

  var face, geometry, n_faces, reader, length, normal, i, dataOffset, faceLength, start, vertexstart

  reader = new DataView( data )
  n_faces = reader.getUint32(80,true)
  geometry = new THREE.Geometry()
  dataOffset = 84
  faceLength = 12 * 4 + 2

  for (face = 0; face < n_faces; face++) {

    start = dataOffset + face * faceLength
    normal = new THREE.Vector3(
      reader.getFloat32(start,true),
      reader.getFloat32(start + 4,true),
      reader.getFloat32(start + 8,true)
    )

    for (i = 1; i <= 3; i++) {

      vertexstart = start + i * 12
      geometry.vertices.push(
        new THREE.Vector3(
          reader.getFloat32(vertexstart,true),
          reader.getFloat32(vertexstart +4,true),
          reader.getFloat32(vertexstart + 8,true)
        )
      )

    }

    length = geometry.vertices.length
    geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal))

  }
  return geometry
}

export function parseBinary = function( data )
{
  var reader = new DataView( data )
  var faces = reader.getUint32( 80, true )
  var dataOffset = 84
  var faceLength = 12 * 4 + 2
  var offset = 0
  
  var vertices = new Float32Array( faces * 3 * 3 )
  var normals = new Float32Array( faces * 3 * 3 )

  for ( var face = 0; face < faces; face ++ ) {

    var start = dataOffset + face * faceLength

    for ( var i = 1; i <= 3; i ++ ) {

      var vertexstart = start + i * 12

      vertices[ offset     ] = reader.getFloat32( vertexstart, true )
      vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true )
      vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true )

      normals[ offset     ] = reader.getFloat32( start    , true )
      normals[ offset + 1 ] = reader.getFloat32( start + 4, true )
      normals[ offset + 2 ] = reader.getFloat32( start + 8, true )
      offset += 3
    }
  }
  return {vertices, normals}
}


//ASCII stl parsing 


export function parseASCIIThree (data) {

  var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text
  geometry = new THREE.Geometry()
  patternFace = /facet([\s\S]*?)endfacet/g

  while ( ( result = patternFace.exec( data ) ) !== null ) {

    text = result[0]
    patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g

    while ( ( result = patternNormal.exec( text ) ) !== null ) {

      normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) )

    }

    patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g

    while ( ( result = patternVertex.exec( text ) ) !== null ) {

      geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) )

    }

    length = geometry.vertices.length

    geometry.faces.push( new THREE.Face3( length - 3, length - 2, length - 1, normal ) )

  }

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  return geometry
}

export function parseASCII( data ) {

  var normal, patternFace, patternNormal, patternVertex, result, text
  patternFace = /facet([\s\S]*?)endfacet/g

  var posArray = []
  var normArray = []
  var indicesArray = []
  var faces = 0
  
  while ( ( result = patternFace.exec( data ) ) !== null ) {
    var length = 0
    
    text = result[0]
    patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g

    while ( ( result = patternNormal.exec( text ) ) !== null ) {
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) )
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) )
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) )
    }

    patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g

    while ( ( result = patternVertex.exec( text ) ) !== null ) {

      posArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) )
      length += 1
    }
    faces +=1
  }

  var vertices = new Float32Array( faces * 3 * 3 )
  var normals = new Float32Array( faces * 3 * 3 )
  
  vertices.set( posArray )
  normals.set ( normArray )

  return {vertices, normals}
}


export function geometryFromBuffers({vertices,normals}){
  var geometry = new THREE.BufferGeometry()
  geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )
  geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) )
  return geometry
}

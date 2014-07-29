require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"VcsyFv":[function(require,module,exports){
/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 *
 * Description: A THREE parser for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 * 	Binary decoding ignores header. There doesn't seem to be much of a use for it.
 * 	There is perhaps some question as to how valid it is to always assume little-endian-ness.
 * 	ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 * 	var parser = new STLParser();
 *	var loader = new THREE.XHRLoader( parser );
 * 	loader.addEventListener( 'load', function ( event ) {
 *
 * 		var geometry = event.content;
 * 		scene.add( new THREE.Mesh( geometry ) );
 *
 * 	} );
 * 	loader.load( './models/stl/slotted_disk.stl' );
 */
var detectEnv = require("composite-detect");
if(detectEnv.isNode) var THREE = require("three");
if(detectEnv.isBrowser) var THREE = window.THREE;
if (detectEnv.isModule) var Q = require('q');

STLParser = function () {
  this.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser
};

STLParser.prototype = {
	constructor: STLParser
};

STLParser.prototype.parse = function (data, parameters) {

  var parameters = parameters || {};
  var useBuffers = parameters.useBuffers !== undefined ? parameters.useBuffers : true;
  var useWorker = parameters.useWorker !== undefined ?  parameters.useWorker && detectEnv.isBrowser: true;
  
  var deferred = Q.defer();

	var isBinary = function (data) {
		var expect, face_size, n_faces, reader;
		reader = new DataView( data );
		face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
		
		n_faces = reader.getUint32(80,true);
		expect = 80 + (32 / 8) + (n_faces * face_size);
		return expect === reader.byteLength;

	};

  var s = Date.now();
	data = this.ensureBinary( data );
	var isBinary = isBinary(data);
	if(!isBinary){
	  data = this.ensureString( data );
	}
	var e1 = Date.now();
  console.log( "STL prepare time " + (e1-s) + " ms" );
	
	var s = Date.now();
	if ( useWorker ) {
var s3 = Date.now();var URL = window.webkitURL || window.URL;
		var worker = new Worker(URL.createObjectURL(new Blob([';(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module \'"+n+"\'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){\nself.ensureBinary =function(buf){\n\n\tif (typeof buf === "string"){\n\t\tvar array_buffer = new Uint8Array(buf.length);\n\t\tfor(var i = 0; i < buf.length; i++) {\n\t\t\tarray_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian\n\t\t}\n\t\treturn array_buffer.buffer || array_buffer;\n\t} else {\n\t\treturn buf;\n\t}\n\n}\n\n\nself.parseASCII = function( data ) {\n\n  var normal, patternFace, patternNormal, patternVertex, result, text;\n\tpatternFace = /facet([\\s\\S]*?)endfacet/g;\n\n  var posArray = [];\n  var normArray = [];\n  var indicesArray = [];\n  var faces = 0;\n  \n\twhile ( ( result = patternFace.exec( data ) ) !== null ) {\n    var length = 0;\n    \n\t\ttext = result[0];\n\t\tpatternNormal = /normal[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n\t\twhile ( ( result = patternNormal.exec( text ) ) !== null ) {\n      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );\n      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );\n      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );\n\t\t}\n\n\t\tpatternVertex = /vertex[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n\t\twhile ( ( result = patternVertex.exec( text ) ) !== null ) {\n\n      posArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );\n      length += 1;\n\t\t}\n\t\tfaces +=1;\n\t}\n\n  var vertices = new Float32Array( faces * 3 * 3 );\n\tvar normals = new Float32Array( faces * 3 * 3 );\n\t\n\tvertices.set( posArray );\n\tnormals.set ( normArray );\n\n  return {vertices: vertices, normals:normals};\n}\n\nself.parseBinary = function( data )\n{\n  var reader = new DataView( data );\n\tvar faces = reader.getUint32( 80, true );\n\tvar dataOffset = 84;\n\tvar faceLength = 12 * 4 + 2;\n\n\tvar offset = 0;\n  \n  \n  var vertices = new Float32Array( faces * 3 * 3 );\n\tvar normals = new Float32Array( faces * 3 * 3 );\n\n\tfor ( var face = 0; face < faces; face ++ ) {\n\n\t\tvar start = dataOffset + face * faceLength;\n\n\t\tfor ( var i = 1; i <= 3; i ++ ) {\n\n\t\t\tvar vertexstart = start + i * 12;\n\n\t\t\tvertices[ offset     ] = reader.getFloat32( vertexstart, true );\n\t\t\tvertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );\n\t\t\tvertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );\n\n\t\t\tnormals[ offset     ] = reader.getFloat32( start    , true );\n\t\t\tnormals[ offset + 1 ] = reader.getFloat32( start + 4, true );\n\t\t\tnormals[ offset + 2 ] = reader.getFloat32( start + 8, true );\n\t\t\toffset += 3;\n\t\t}\n\t}\n\treturn {vertices: vertices, normals:normals};\n}\n\nself.onmessage = function( event ) {\n  var data = event.data;\n  //data = self.ensureBinary(data );\n  var isBinary = data.isBinary;\n  data = data.data;\n  var result = null;\n  if( isBinary )\n  {\n    result = self.parseBinary( data );\n  }\n  else{ result = self.parseASCII( data ) };\n\n  var vertices = result.vertices.buffer;\n  var normals =  result.normals.buffer;\n  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] );\n\tself.close();\n\n}\n\n},{}]},{},[1])\n;'],{type:"text/javascript"})));
		worker.onmessage = function( event ) {
		  var e3 = Date.now();
		  var vertices = new Float32Array( event.data.vertices );
		  var normals = new Float32Array( event.data.normals );
		  var geometry = new THREE.BufferGeometry();
		  var s2 = Date.now();
		  geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	    geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	    
	    var e1 = Date.now();
	    console.log( "STL data parse time [worker]: " + (e1-s) + " ms" );
	    console.log( "STL data parse time-creation [worker]: " + (e1-s2) + " ms" );
	    console.log( "STL data parse time-to post [worker]: " + (e3-s3) + " ms" );
	    deferred.resolve( geometry );
		};
		var s3 = Date.now();
		worker.postMessage( {data:data,isBinary:isBinary});
		
	}
	else
	{
	  if( isBinary )
    {
      if( useBuffers ){
      
      var parsedData = this.parseBinaryBuffers( data );
      var e1 = Date.now();
	    console.log( "STL data parse time [non worker]: " + (e1-s) + " ms" );
	    
      deferred.resolve( parsedData );}
      else{
        deferred.resolve( this.parseBinary( data ) );
      }
    }
    else{
      if( useBuffers ){
        var parsedData = this.parseASCIIBuffers( this.ensureString( data ) );
        var e1 = Date.now();
	      console.log( "STL [ascii] data parse time [non-worker]: " + (e1-s) + " ms" );
        deferred.resolve( parsedData );
      }
      else{
        deferred.resolve( this.parseASCII( this.ensureString( data ) ) );
      }
    }
	}
	return deferred.promise;
};

STLParser.prototype.parseBinary = function (data) {

	var face, geometry, n_faces, reader, length, normal, i, dataOffset, faceLength, start, vertexstart;

	reader = new DataView( data );
	n_faces = reader.getUint32(80,true);
	geometry = new THREE.Geometry();
	dataOffset = 84;
	faceLength = 12 * 4 + 2;

	for (face = 0; face < n_faces; face++) {

		start = dataOffset + face * faceLength;
		normal = new THREE.Vector3(
			reader.getFloat32(start,true),
			reader.getFloat32(start + 4,true),
			reader.getFloat32(start + 8,true)
		);

		for (i = 1; i <= 3; i++) {

			vertexstart = start + i * 12;
			geometry.vertices.push(
				new THREE.Vector3(
					reader.getFloat32(vertexstart,true),
					reader.getFloat32(vertexstart +4,true),
					reader.getFloat32(vertexstart + 8,true)
				)
			);

		}

		length = geometry.vertices.length;
		geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal));

	}
	return geometry;
};


STLParser.prototype.parseBinaryBuffers = function (data) {
	var reader = new DataView( data );
	var faces = reader.getUint32( 80, true );
	var dataOffset = 84;
	var faceLength = 12 * 4 + 2;

	var offset = 0;

	var geometry = new THREE.BufferGeometry();

	var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );

	for ( var face = 0; face < faces; face ++ ) {

		var start = dataOffset + face * faceLength;

		for ( var i = 1; i <= 3; i ++ ) {

			var vertexstart = start + i * 12;

			vertices[ offset     ] = reader.getFloat32( vertexstart, true );
			vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );
			vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );

			normals[ offset     ] = reader.getFloat32( start    , true );
			normals[ offset + 1 ] = reader.getFloat32( start + 4, true );
			normals[ offset + 2 ] = reader.getFloat32( start + 8, true );
			offset += 3;
		}
	}

	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	return geometry;
};


STLParser.prototype.parseASCIIBuffers = function (data) {
	var normal, patternFace, patternNormal, patternVertex, result, text;
	patternFace = /facet([\s\S]*?)endfacet/g;

  var posArray = [];
  var normArray = [];
  var indicesArray = [];
  var faces = 0;
  
	while ( ( result = patternFace.exec( data ) ) !== null ) {
    var length = 0;
    
		text = result[0];
		patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternNormal.exec( text ) ) !== null ) {
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
		}

		patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternVertex.exec( text ) ) !== null ) {

      posArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      length += 1;
		}
		faces +=1;
	}

  var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );
	
	vertices.set( posArray );
	normals.set ( normArray );

  var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	return geometry;
};


STLParser.prototype.parseASCII = function (data) {

	var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
	geometry = new THREE.Geometry();
	patternFace = /facet([\s\S]*?)endfacet/g;

	while ( ( result = patternFace.exec( data ) ) !== null ) {

		text = result[0];
		patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternNormal.exec( text ) ) !== null ) {

			normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );

		}

		patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternVertex.exec( text ) ) !== null ) {

			geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );

		}

		length = geometry.vertices.length;

		geometry.faces.push( new THREE.Face3( length - 3, length - 2, length - 1, normal ) );

	}

	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;
};

STLParser.prototype.ensureString = function (buf) {

	if (typeof buf !== "string"){
		var array_buffer = new Uint8Array(buf);
		var str = '';
		for(var i = 0; i < buf.byteLength; i++) {
			str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
		}
		return str;
	} else {
		return buf;
	}

};

STLParser.prototype.ensureBinary = function (buf) {

	if (typeof buf === "string"){
		var array_buffer = new Uint8Array(buf.length);
		for(var i = 0; i < buf.length; i++) {
			array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
		}
		return array_buffer.buffer || array_buffer;
	} else {
		return buf;
	}

};

if ( typeof DataView === 'undefined'){

	DataView = function(buffer, byteOffset, byteLength){
	
		console.log("poue")

		this.buffer = buffer;
		this.byteOffset = byteOffset || 0;
		this.byteLength = byteLength || buffer.byteLength || buffer.length;
		this._isString = typeof buffer === "string";

	}

	DataView.prototype = {

		_getCharCodes:function(buffer,start,length){
			start = start || 0;
			length = length || buffer.length;
			var end = start + length;
			var codes = [];
			for (var i = start; i < end; i++) {
				codes.push(buffer.charCodeAt(i) & 0xff);
			}
			return codes;
		},

		_getBytes: function (length, byteOffset, littleEndian) {

			var result;

			// Handle the lack of endianness
			if (littleEndian === undefined) {

				littleEndian = this._littleEndian;

			}

			// Handle the lack of byteOffset
			if (byteOffset === undefined) {

				byteOffset = this.byteOffset;

			} else {

				byteOffset = this.byteOffset + byteOffset;

			}

			if (length === undefined) {

				length = this.byteLength - byteOffset;

			}

			// Error Checking
			if (typeof byteOffset !== 'number') {

				throw new TypeError('DataView byteOffset is not a number');

			}

			if (length < 0 || byteOffset + length > this.byteLength) {

				throw new Error('DataView length or (byteOffset+length) value is out of bounds');

			}

			if (this.isString){

				result = this._getCharCodes(this.buffer, byteOffset, byteOffset + length);

			} else {

				result = this.buffer.slice(byteOffset, byteOffset + length);

			}

			if (!littleEndian && length > 1) {

				if (!(result instanceof Array)) {

					result = Array.prototype.slice.call(result);

				}

				result.reverse();
			}

			return result;

		},

		// Compatibility functions on a String Buffer

		getFloat64: function (byteOffset, littleEndian) {

			var b = this._getBytes(8, byteOffset, littleEndian),

				sign = 1 - (2 * (b[7] >> 7)),
				exponent = ((((b[7] << 1) & 0xff) << 3) | (b[6] >> 4)) - ((1 << 10) - 1),

			// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
				mantissa = ((b[6] & 0x0f) * Math.pow(2, 48)) + (b[5] * Math.pow(2, 40)) + (b[4] * Math.pow(2, 32)) +
							(b[3] * Math.pow(2, 24)) + (b[2] * Math.pow(2, 16)) + (b[1] * Math.pow(2, 8)) + b[0];

			if (exponent === 1024) {
				if (mantissa !== 0) {
					return NaN;
				} else {
					return sign * Infinity;
				}
			}

			if (exponent === -1023) { // Denormalized
				return sign * mantissa * Math.pow(2, -1022 - 52);
			}

			return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);

		},

		getFloat32: function (byteOffset, littleEndian) {

			var b = this._getBytes(4, byteOffset, littleEndian),

				sign = 1 - (2 * (b[3] >> 7)),
				exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
				mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

			if (exponent === 128) {
				if (mantissa !== 0) {
					return NaN;
				} else {
					return sign * Infinity;
				}
			}

			if (exponent === -127) { // Denormalized
				return sign * mantissa * Math.pow(2, -126 - 23);
			}

			return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
		},

		getInt32: function (byteOffset, littleEndian) {
			var b = this._getBytes(4, byteOffset, littleEndian);
			return (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
		},

		getUint32: function (byteOffset, littleEndian) {
			return this.getInt32(byteOffset, littleEndian) >>> 0;
		},

		getInt16: function (byteOffset, littleEndian) {
			return (this.getUint16(byteOffset, littleEndian) << 16) >> 16;
		},

		getUint16: function (byteOffset, littleEndian) {
			var b = this._getBytes(2, byteOffset, littleEndian);
			return (b[1] << 8) | b[0];
		},

		getInt8: function (byteOffset) {
			return (this.getUint8(byteOffset) << 24) >> 24;
		},

		getUint8: function (byteOffset) {
			return this._getBytes(1, byteOffset)[0];
		}

	 };

}

if (detectEnv.isModule) module.exports = STLParser;

},{"composite-detect":false,"three":false}],"stl-parser":[function(require,module,exports){
module.exports=require('VcsyFv');
},{}]},{},["VcsyFv"])

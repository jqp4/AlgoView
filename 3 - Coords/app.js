var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

function getBufferIndecesShift(indices){
	return indices.length == 0 ? 0 : (Math.max(...indices) + 1);
}

function drawBox(objData, x0, y0, z0){
	var newBoxVertices = 
	[   // X, Y, Z                      R, G, B
		// Top
		x0 - 1.0, y0 + 1.0, z0 - 1.0,   0.5, 0.5, 0.5,
		x0 - 1.0, y0 + 1.0, z0 + 1.0,   0.5, 0.5, 0.5,
		x0 + 1.0, y0 + 1.0, z0 + 1.0,   0.5, 0.5, 0.5,
		x0 + 1.0, y0 + 1.0, z0 - 1.0,   0.5, 0.5, 0.5,

		// Left
		x0 - 1.0, y0 + 1.0, z0 + 1.0,   0.75, 0.25, 0.5,
		x0 - 1.0, y0 - 1.0, z0 + 1.0,   0.75, 0.25, 0.5,
		x0 - 1.0, y0 - 1.0, z0 - 1.0,   0.75, 0.25, 0.5,
		x0 - 1.0, y0 + 1.0, z0 - 1.0,   0.75, 0.25, 0.5,

		// Right
		x0 + 1.0, y0 + 1.0, z0 + 1.0,   0.25, 0.25, 0.75,
		x0 + 1.0, y0 - 1.0, z0 + 1.0,   0.25, 0.25, 0.75,
		x0 + 1.0, y0 - 1.0, z0 - 1.0,   0.25, 0.25, 0.75,
		x0 + 1.0, y0 + 1.0, z0 - 1.0,   0.25, 0.25, 0.75,

		// Front
		x0 + 1.0, y0 + 1.0, z0 + 1.0,   1.0, 0.0, 0.15,
		x0 + 1.0, y0 - 1.0, z0 + 1.0,   1.0, 0.0, 0.15,
		x0 - 1.0, y0 - 1.0, z0 + 1.0,   1.0, 0.0, 0.15,
		x0 - 1.0, y0 + 1.0, z0 + 1.0,   1.0, 0.0, 0.15,

		// Back
		x0 + 1.0, y0 + 1.0, z0 - 1.0,   0.0, 1.0, 0.15,
		x0 + 1.0, y0 - 1.0, z0 - 1.0,   0.0, 1.0, 0.15,
		x0 - 1.0, y0 - 1.0, z0 - 1.0,   0.0, 1.0, 0.15,
		x0 - 1.0, y0 + 1.0, z0 - 1.0,   0.0, 1.0, 0.15,

		// Bottom
		x0 - 1.0, y0 - 1.0, z0 - 1.0,   0.5, 0.5, 1.0,
		x0 - 1.0, y0 - 1.0, z0 + 1.0,   0.5, 0.5, 1.0,
		x0 + 1.0, y0 - 1.0, z0 + 1.0,   0.5, 0.5, 1.0,
		x0 + 1.0, y0 - 1.0, z0 - 1.0,   0.5, 0.5, 1.0,
	];

	// var shift = objData.boxIndices.length == 0 ? 0 : (Math.max(...objData.boxIndices) + 1);
	var shift = getBufferIndecesShift(objData.boxIndices);

	var newboxIndices =
	[
		// Top
		shift + 0, shift + 1, shift + 2,
		shift + 0, shift + 2, shift + 3,

		// Left
		shift + 5, shift + 4, shift + 6,
		shift + 6, shift + 4, shift + 7,

		// Right
		shift + 8, shift + 9, shift + 10,
		shift + 8, shift + 10, shift + 11,

		// Front
		shift + 13, shift + 12, shift + 14,
		shift + 15, shift + 14, shift + 12,

		// Back
		shift + 16, shift + 17, shift + 18,
		shift + 16, shift + 18, shift + 19,

		// Bottom
		shift + 21, shift + 20, shift + 22,
		shift + 22, shift + 20, shift + 23
	];

	objData.boxVertices = objData.boxVertices.concat(newBoxVertices);
	objData.boxIndices = objData.boxIndices.concat(newboxIndices);
}	


function drawTriangle(objData, x0, y0, z0){
	var newTriangleVertices = 
	[ // X, Y, Z                   R, G, B
		x0 + 0.0, y0 + 1.0, z0,    1.0, 1.0, 0.0,
		x0 - 1.0, y0 - 1.0, z0,    0.7, 0.0, 1.0,
		x0 + 1.0, y0 - 1.0, z0,    0.1, 1.0, 0.6
	];

	var shift = getBufferIndecesShift(objData.boxIndices);

	var newTriangleIndices =
	[
		shift + 0, shift + 1, shift + 2,
		shift + 2, shift + 1, shift + 0, // invert
	];

	objData.boxVertices = objData.boxVertices.concat(newTriangleVertices);
	objData.boxIndices = objData.boxIndices.concat(newTriangleIndices);
}


var InitDemo = function () {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	// var boxVertexBufferObject = gl.createBuffer();
	// var boxIndexBufferObject = gl.createBuffer();

	// gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);

	// var IndicesLength = 0
	// IndicesLength += drawBox(gl, boxVertexBufferObject, boxIndexBufferObject, IndicesLength, 1, 1, 1);
	// IndicesLength += drawBox(gl, boxVertexBufferObject, boxIndexBufferObject, IndicesLength, -1, -1, -1);

	//
	// Create buffers
	//

	var objData = {boxVertices: [], boxIndices: []};
	// drawTriangle(objData, 0, 0, 0);
	// console.log('objData: ', objData);
	drawBox(objData, 1, 1, 1);
	console.log('objData: ', objData);
	drawBox(objData, -1, -1, -1);
	console.log('objData: ', objData);

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objData.boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objData.boxIndices), gl.STATIC_DRAW);
	

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, objData.boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};

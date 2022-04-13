"use strict"
let vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'uniform vec2 translation;',
'uniform vec2 rotation;',
'uniform vec2 scale;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  vec2 scaledPosition = vertPosition * scale;',
'  vec2 rotatedPos = vec2(scaledPosition.x * rotation.y + scaledPosition.y * rotation.x, scaledPosition.y * rotation.y - scaledPosition.x * rotation.x);',
'  vec2 position = rotatedPos + translation;',
'  fragColor = vertColor;',
'  gl_Position = vec4(position, 0.0, 1.0);',
'}'
].join('\n');

let fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

let canvas, gl, bufferData, rectanglesToRender, cloudMovement = 1;
let angleInDegr = 0;

let negMov = 1;

let lowColor = [1.0, 0.1, 0.0];
let highColor = [1.0, 0.2, 0.0];

function initWebGL() {
	canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.0, 0.85, 1.0, 1.0);
}

function initShaders(gl, program) {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

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
}

function setRectangle(x, y, width, height, ...color) {
	rectanglesToRender++;
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
    bufferData.push(
		x1, y1, color[0], color[1], color[2],
		x1, y2, color[0], color[1], color[2],
		x2, y2, color[0], color[1], color[2],

		x1, y1, color[0], color[1], color[2],
		x2, y1, color[0], color[1], color[2],
		x2, y2, color[0], color[1], color[2]
		);
}

function drawPipe(){
	let count = rectanglesToRender;
	setRectangle(-0.0, -0, 0.12, -0.2, 0.0, 1.0, 0.0);
	setRectangle(-0.03, 0.05, 0.18, -0.1, 0.0, 1.0, 0.0);
	setRectangle(-0.03, 0.05, 0.18, -0.1, 0.0, 1.0, 0.0);
	return (rectanglesToRender - count)*6;
}

function drawPlayer(){
	let count = rectanglesToRender;
	//ботинки
	setRectangle(0.0, 0.0, 0.06, -0.05, 0.0, 0.0, 0.0);
	setRectangle(-0.08, 0.0, 0.06, -0.05, 0.0, 0.0, 0.0);
	//ноги
	setRectangle(0.0, 0.0, 0.06, 0.15, 0.0, 0.0, 1.0);
	setRectangle(-0.08, 0.0, 0.06, 0.15, 0.0, 0.0, 1.0);
	setRectangle(-0.08, 0.2, 0.14, -0.05, 0.3, 0.4, 1.0);
	//туловище
	setRectangle(-0.08, 0.4, 0.14, -0.2, 1.0, 0.9, 0.8);
	setRectangle(-0.03, 0.4, 0.05, 0.03, 1.0, 0.9, 0.8);
	//руки
	setRectangle(0.06, 0.4, 0.04, -0.17, 1.0, 0.9, 0.8);
	setRectangle(0.06, 0.23, 0.04, -0.04, 0.5, 0.2, 0.2);
	//голова
	setRectangle(-0.04, 0.5, 0.07, -0.08, 1.0, 0.9, 0.8);
	setRectangle(-0.04, 0.53, 0.07, -0.04, 1.0, 0.0, 0.0);
	setRectangle(0.03, 0.51, 0.03, -0.02, 1.0, 0.0, 0.0);
	setRectangle(0.0, 0.48, 0.01, -0.02, 0.0, 0.0, 0.0);
	setRectangle(0.02, 0.48, 0.01, -0.02, 0.0, 0.0, 0.0);
	//нож
	setRectangle(0.06, 0.22, 0.04, -0.02, 0.0, 0.0, 0.0);
	setRectangle(0.1, 0.235, 0.01, -0.05, 0.5, 0.5, 0.5);
	setRectangle(0.11, 0.22, 0.05, -0.02, 1.0, 1.0, 1.0);
	//рука левая анимация
	setRectangle(0.0, 0.0, -0.1, 0.05, 1.0, 0.9, 0.8);
	//молотов
	setRectangle(-0.13, 0.05, 0.03, -0.07, 0.0, 0.2, 0.1);
	setRectangle(-0.123, 0.07, 0.015, -0.02, 0.0, 0.2, 0.1);
	setRectangle(-0.123, 0.09, 0.01, -0.02, lowColor[0], lowColor[1], lowColor[2]);
	setRectangle(-0.133, 0.09, 0.02, -0.01, highColor[0], highColor[1], highColor[2]);
	let tmp = lowColor;
	lowColor = highColor;
	highColor = tmp;
	return (rectanglesToRender - count)*6
}

function main() {
    // инициализация
	initWebGL();
    let program = gl.createProgram();
    initShaders(gl, program);
	let VertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VertexBufferObject);

	let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	let translationLocation = gl.getUniformLocation(program, "translation");
	let rotateLocation = gl.getUniformLocation(program, "rotation");
	let scaleLocation = gl.getUniformLocation(program, "scale");
	
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	
	gl.useProgram(program);
	
	gl.enableVertexAttribArray(colorAttribLocation);
	gl.enableVertexAttribArray(positionAttribLocation);
	
	let rendered = 0;

	bufferData = [];
	rectanglesToRender = 0;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//			  x,   y,   width,height,  ...color
	//платформа
	setRectangle(0.0, 0.0, 2.0, -0.2, 0.7, 0.4, 0.0);
	//труба левая
	let pipeCount = drawPipe();
	let pipe2Count = drawPipe();
	let firstPlayerCount = drawPlayer();
	let secondPlayerCount = drawPlayer();
	//прорисовка
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);

	if (angleInDegr > 30)
		negMov = -1;
	if (angleInDegr < 0.2)
		negMov = 1;
	angleInDegr += 4 * negMov;
	
	setAtrib(0, [-1.0, -0.8], [1, 1], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	rendered += 6;
	setAtrib(0, [-0.8, -0.6], [1, 1], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, pipeCount);
	rendered += pipeCount;
	setAtrib(180, [0.5, -0.7], [2, 2], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, pipe2Count);
	rendered += pipe2Count;
	setAtrib(0, [-0.4, -0.75], [1, 1], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, firstPlayerCount - 30);
	rendered += firstPlayerCount - 30;
	setAtrib(angleInDegr, [-0.48, -0.4], [1, 1], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, 30);
	rendered += 30;
	setAtrib(0, [0, -0.775], [-0.5, 0.5], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, secondPlayerCount - 30);
	rendered += secondPlayerCount - 30;
	setAtrib(0, [0.04, -0.6], [-0.5, 0.5], rotateLocation, translationLocation, scaleLocation);
	gl.drawArrays(gl.TRIANGLES, rendered, 30);
};

function setAtrib(angleDeg, translation, scale, ...atrib){
	//set rotation
	let angle = angleDeg * Math.PI / 180;
	let cosB = Math.sin(angle);
	let sinB = Math.cos(angle);
	//set translation
	gl.uniform2fv(atrib[1], translation);
	gl.uniform2f(atrib[0], cosB, sinB);
	//set scaling
	gl.uniform2fv(atrib[2], scale);
}

setInterval(main, 100);
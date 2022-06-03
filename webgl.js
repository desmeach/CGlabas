var cubeRotation = 0.0;
var curInd = -1;
var radius = 10;
let lightCoord = [-3.0, 0.0, 4.0];

main();

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;
    
    uniform vec3 uLightWorldPosition;
    uniform mat4 uWorld;
    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying highp vec3 vLighting;
    varying lowp vec3 vSurfaceToLight;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      vec3 surfaceWorldPosition = (uWorld * aVertexPosition).xyz;

      highp vec3 ambientLight = vec3(0, 0, 0);
      highp vec3 directionalLightColor = vec3(0,0,0);
      highp vec3 directionalVector = normalize(vec3(0.0, 10.0, 10.0));
      vSurfaceToLight = normalize(uLightWorldPosition - aVertexPosition.xyz);
    
      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 0.0);
      highp float spotLight = max(dot(transformedNormal.xyz, vSurfaceToLight), 0.0);
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional) + spotLight;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;
    varying highp vec3 vLighting;
    void main(void) {
      gl_FragColor = vColor;
      gl_FragColor.rgb *= vLighting;
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      colorLocation: gl.getUniformLocation(shaderProgram, 'vColor'),
      lightPositionLocation: gl.getUniformLocation(shaderProgram, 'uLightWorldPosition'),
      worldLocation: gl.getUniformLocation(shaderProgram, 'uWorld'),
    }
  };

  const buffers = initBuffers(gl);

  var then = 0;

  function render(now) {
    now *= 0.001; 
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initTreeBuffer() {
	const vertexTree = [
    //front
		-5.0,  20.0,  1.0,
		 5.0,  20.0,  1.0,
		 5.0,  -20.0,  1.0,
		-5.0,  -20.0,  1.0,
		//left
		-5.0, 20.0, 1.0,
		-5.0, 20.0, -9.0, 
		-5.0, -20.0, -9.0,
		-5.0, -20.0, 1.0,
		//back
		-5.0, 20.0, -9.0,
		-5.0, 0.0, -9.0,
		5.0, 20.0, -9.0,
		5.0, 0.0, -9.0,
		//right
		5.0, 20.0, -9.0,
		5.0, -20.0, -9.0,
		5.0, 20.0, 1.0,
		5.0, -20.0, 1.0,
    //bottom
		-5.0, -20.0, -9.0,
		5.0, -20.0, -9.0,
		-5.0, -20.0, 1.0,
		5.0, -20.0, 1.0,
    //top
		-5.0, 20.0, -9.0,
		5.0, 20.0, -9.0,
		-5.0, 20.0, 1.0,
		5.0, 20.0, 1.0,
	//background
		-500.0, 500.0, -50.0,
		-500.0, -500.0, -50.0,
		500.0, 500.0, -50.0,
		500.0, -500.0, -50.0,
	//leeve
		-15.0,  20.0,  10.0,
		 15.0,  20.0,  10.0,
		 0.0,  100.0,  -5.0,
		 
		 -15.0,  20.0,  10.0,
		 -15.0,  20.0,  -18.0,
		 0.0,  100.0,  -5.0,
		 
		 15.0,  20.0,  -18.0,
		 -15.0,  20.0,  -18.0,
		 0.0,  100.0,  -5.0,
		 
     15.0,  20.0,  -18.0,
		 15.0,  20.0,  10.0,
		 0.0,  100.0,  -5.0,

     15.0,  20.0,  -18.0,
		 -15.0,  20.0,  -18.0,
		 15.0,  20.0,  10.0,
     -15.0,  20.0,  10.0,
	];

  const vertexNormals = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    //bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    //top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
	//background
	  0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
	//leeve
	  0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
	
	  -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
  ];
	
	const colorTree = [
		[0.4,  0.2,  0.2,  1.0],
		[0.4,  0.2,  0.2,  1.0],
		[0.4,  0.2,  0.2,  1.0],
		[0.4,  0.2,  0.2,  1.0],
		[0.4,  0.2,  0.2,  1.0],
		[0.4,  0.2,  0.2,  1.0],
	
		[0.4,  0.5,  0.9,  1.0],
		
		[0.2,  0.8,  0.0,  1.0],
		[0.2,  0.8,  0.0,  1.0],
		[0.2,  0.8,  0.0,  1.0],
		[0.2,  0.8,  0.0,  1.0],
    [0.2,  0.8,  0.0,  1.0],
	];
	
	const indexTree = [
		curInd+1, curInd+2, curInd+3, curInd+1, curInd+3, curInd+4,
		curInd+5, curInd+6, curInd+7, curInd+5, curInd+7, curInd+8,
		curInd+9, curInd+10, curInd+11, curInd+10, curInd+11, curInd+12,
		curInd+13, curInd+14, curInd+15, curInd+14, curInd+15, curInd+16,
    curInd+17, curInd+18, curInd+19, curInd+18, curInd+19, curInd+20,
    curInd+21, curInd+22, curInd+23, curInd+22, curInd+23, curInd+24,
	  
    curInd+25, curInd+26, curInd+27, curInd+26, curInd+27, curInd+28,
	
	  curInd+29, curInd+30, curInd+31, 
	  curInd+32, curInd+33, curInd+34, 
	  curInd+35, curInd+36, curInd+37, 
	  curInd+38, curInd+39, curInd+40, 
    curInd+41, curInd+42, curInd+43, curInd+42, curInd+43, curInd+44, 
	];
	
	curInd += vertexTree / 3;
	
	return {
		vertex: vertexTree,
		color: colorTree,
		index: indexTree,
    normal: vertexNormals,
	}
}

function initBuffers(gl) {
  const tree = initTreeBuffer();

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = tree.vertex;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  const normals = tree.normal;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  const faceColors = tree.color;
  var colors = [];
  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    colors = colors.concat(c, c, c, c);
  }
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Index on render
  const indices = tree.index;
  const size = indices.length;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    size: size,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(.0, .0, .0, 0.5); 
  gl.clearDepth(1.0);                
  gl.enable(gl.DEPTH_TEST);      
  gl.depthFunc(gl.LEQUAL);          

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 1000.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  
  const slider_r = document.querySelector("#slider_r");
  const slider_z = document.querySelector("#slider_z");
  // let camera = [0, 0, 3.0];
  // let target = [0, 10, 0];
  // let up = [0, 1, 0];
  // let cameraMatrix = m4.lookAt(camera, target, up);
  const cameraAngle = slider_r.value * Math.PI / 180;
  const range = slider_z.value;
  const cameraMatrix = mat4.create();
  const worldMatrix = mat4.create();
  mat4.rotateY(worldMatrix, worldMatrix, cameraAngle);
  mat4.rotateY(cameraMatrix, cameraMatrix, cameraAngle);
  mat4.translate(cameraMatrix, cameraMatrix, [0.0, 10.0, range])
  const modelViewMatrix = mat4.create();
  mat4.invert(modelViewMatrix, cameraMatrix);
  // mat4.translate(modelViewMatrix,     // destination matrix
  //               modelViewMatrix,     // matrix to translate
  //               [0, 0.0, -10]);  // amount to translate
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation,     // amount to rotate in radians
  //             [1, 0, 0]);       // axis to rotate around (Z)
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation * .5,// amount to rotate in radians
  //             [Math.cos(0) * radius, 0.0, Math.sin(0) * radius]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.worldLocation,
      false,
      worldMatrix);
  const lightPos = vec4.fromValues(Math.cos(cubeRotation) * 15, 10, Math.sin(cubeRotation) * 20,1);
  //const lightPos = vec4.fromValues(100, 100, 100,1);
  //mat4.multiply(lightPos, lightPos, projectionMatrix);
  // mat4.multiply(lightPos, lightPos, modelViewMatrix);
  gl.uniform3fv(programInfo.uniformLocations.lightPositionLocation, [lightPos[0], lightPos[1], lightPos[2]]);
  
  {
    const vertexCount = buffers.size;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  cubeRotation += 0.05;
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
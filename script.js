const errorMessage = document.getElementById('error-message');

function showError(text) {
  errorMessage.textContent = text;
  errorMessage.style.display = 'block';
  console.log(text);
}

const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShaderSourceCode = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main() {
  fragColor = vec4(0.1, 0.9, 0.2, 1.0);
}
`

function render() {
  /** @type {HTMLCanvasElement | null} */
  const canvas = document.getElementById('canvas');
  if (!canvas) {
    showError('Canvas element not found');
    return;
  }

  const gl = canvas.getContext('webgl2');

  if (!gl) {
    const isWebGl1Supported = !!canvas.getContext('webgl');
    showError(`WebGL 2 is not supported. WebGL 1 is ${isWebGl1Supported ? 'supported' : 'not supported'}`);
    return;
  }

  gl.clearColor(3/255, 190/255, 252/255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const triangleVertices = [
    0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ]

  const triangleVerticesCpuBuffer = new Float32Array(triangleVertices);
  const triangleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW);

  // vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    showError(`Vertex shader error: ${gl.getShaderInfoLog(vertexShader)}`);
    return;
  }

  // fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    showError(`Fragment shader error: ${gl.getShaderInfoLog(fragmentShader)}`);
    return;
  }

  const triangleShaderProgram = gl.createProgram();
  gl.attachShader(triangleShaderProgram, vertexShader);
  gl.attachShader(triangleShaderProgram, fragmentShader);
  gl.linkProgram(triangleShaderProgram);

  if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
    showError(`Shader program error: ${gl.getProgramInfoLog(triangleShaderProgram)}`);
    return;
  }

  const vertexPositionAttributeLocation = gl.getAttribLocation(triangleShaderProgram, 'position');
  if (vertexPositionAttributeLocation === -1) {
    showError('Vertex position attribute location not found');
    return;
  }

  // output merger
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl.clearColor(3/255, 190/255, 252/255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // rasterizer
  gl.viewport(0, 0, canvas.width, canvas.height);

  // set gpu program
  gl.useProgram(triangleShaderProgram);
  gl.enableVertexAttribArray(vertexPositionAttributeLocation);

  // input assembler
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.vertexAttribPointer(
    vertexPositionAttributeLocation,
    2,
    gl.FLOAT,
    false,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  // draw call
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

try {
  render();
} catch (error) {
  showError(`Uncaught javascript exception ${error}`)
}
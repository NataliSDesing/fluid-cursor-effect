'use strict';

let canvas;
let gl;
let ext;

function getWebGLContext(canvas) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false
  };

  let gl = canvas.getContext('webgl2', params);
  if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

  if (!gl) alert('WebGL is not supported.');

  return gl;
}

function initGL() {
  canvas = document.getElementById('fluid-canvas');
  gl = getWebGLContext(canvas);

  ext = getSupportedExtensions(gl);

  if (!ext.supported) {
    alert('Your browser does not support required WebGL extensions.');
    throw new Error('WebGL extensions missing');
  }
}

function getSupportedExtensions(gl) {
  const halfFloat = gl.getExtension('OES_texture_half_float');
  const supportLinearHalf = gl.getExtension('OES_texture_half_float_linear');
  const supportColorBufferFloat = gl.getExtension('WEBGL_color_buffer_float');

  return {
    supported: !!(halfFloat && supportLinearHalf && supportColorBufferFloat),
    halfFloat,
    supportLinearHalf,
    supportColorBufferFloat
  };
}
'use strict';

let canvas = window.canvas;
let gl = canvas.getContext('webgl2', { alpha: false });
if (!gl) {
  alert('WebGL 2 not supported. This demo requires WebGL 2 to run.');
  throw new Error('WebGL 2 not supported');
}

function compileShader(type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function createProgram(vertexSource, fragmentSource) {
  let program = gl.createProgram();
  let vShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  let fShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}
let textureWidth = gl.drawingBufferWidth;
let textureHeight = gl.drawingBufferHeight;

function createTexture(width, height, internalFormat, format, type, param) {
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
  return texture;
}

function createFBO(texture) {
  let fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, textureWidth, textureHeight);
  return fbo;
}

let velocity, dye, divergence, curl, pressure;
let velocityFBO, dyeFBO, divergenceFBO, curlFBO, pressureFBO;

function initFramebuffers() {
  textureWidth = gl.drawingBufferWidth;
  textureHeight = gl.drawingBufferHeight;

  let texType = gl.HALF_FLOAT || gl.FLOAT;

  velocity = createTexture(textureWidth, textureHeight, gl.RG16F, gl.RG, texType, gl.LINEAR);
  velocityFBO = createFBO(velocity);

  dye = createTexture(textureWidth, textureHeight, gl.RGBA16F, gl.RGBA, texType, gl.LINEAR);
  dyeFBO = createFBO(dye);

  divergence = createTexture(textureWidth, textureHeight, gl.R16F, gl.RED, texType, gl.NEAREST);
  divergenceFBO = createFBO(divergence);

  curl = createTexture(textureWidth, textureHeight, gl.R16F, gl.RED, texType, gl.NEAREST);
  curlFBO = createFBO(curl);

  pressure = createTexture(textureWidth, textureHeight, gl.R16F, gl.RED, texType, gl.NEAREST);
  pressureFBO = createFBO(pressure);
}
function update() {
  applyInputs();       // пользовательские взаимодействия (мышь/палец)
  computeCurl();       // вычисление вихря
  applyVorticity();    // турбулентность
  computeDivergence(); // расхождение потока
  clearPressure();     // сброс давления
  solvePressure();     // итеративное решение давления
  subtractPressure();  // корректировка скорости по давлению
  advect();            // перемещение краски и скорости
  render();            // финальный рендер на экран

  requestAnimationFrame(update);
}
function applyInputs() {}
function computeCurl() {}
function applyVorticity() {}
function computeDivergence() {}
function clearPressure() {}
function solvePressure() {}
function subtractPressure() {}
function advect() {}
function render() {}
let pointers = [];

function createPointer(id, x, y) {
  return {
    id,
    down: true,
    moved: false,
    color: [Math.random(), Math.random(), Math.random()],
    dx: 0,
    dy: 0,
    x,
    y,
    prevX: x,
    prevY: y
  };
}
function applyInputs() {
  for (let i = 0; i < pointers.length; i++) {
    const p = pointers[i];
    if (!p.down || !p.moved) continue;
    p.moved = false;

    splat(p.x, p.y, p.dx, p.dy, p.color);
  }
}
canvas.addEventListener('mousedown', (e) => {
  const pointer = createPointer(-1, e.offsetX, e.offsetY);
  pointers.push(pointer);
});

canvas.addEventListener('mousemove', (e) => {
  const p = pointers[0];
  if (!p) return;
  p.moved = true;
  p.dx = e.offsetX - p.prevX;
  p.dy = e.offsetY - p.prevY;
  p.prevX = p.x;
  p.prevY = p.y;
  p.x = e.offsetX;
  p.y = e.offsetY;
});

window.addEventListener('mouseup', () => {
  const p = pointers[0];
  if (p) p.down = false;
});
function splat(x, y, dx, dy, color) {
  gl.viewport(0, 0, simWidth, simHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
  gl.useProgram(programs.splat.program);
  gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach);
  gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(programs.splat.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
  gl.uniform3f(programs.splat.uniforms.color, dx, -dy, 1.0);
  gl.uniform1f(programs.splat.uniforms.radius, 0.0005);
  blit(velocity.write);

  velocity.swap();

  gl.bindFramebuffer(gl.FRAMEBUFFER, density.write.fbo);
  gl.uniform1i(programs.splat.uniforms.uTarget, density.read.attach);
  gl.uniform3f(programs.splat.uniforms.color, color[0], color[1], color[2]);
  blit(density.write);

  density.swap();
}
function blit(target) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
// init.js — продолжение

function update() {
  applyInputs();
  step();
  render(null);
  requestAnimationFrame(update);
}

function applyInputs() {
  for (let i = 0; i < pointers.length; i++) {
    const p = pointers[i];
    if (p.moved) {
      splat(p.x, p.y, p.dx, p.dy, p.color);
      p.moved = false;
    }
  }
}

function step() {
  gl.viewport(0, 0, simWidth, simHeight);

  // Curl
  gl.bindFramebuffer(gl.FRAMEBUFFER, curl.fbo);
  gl.useProgram(programs.curl.program);
  gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach);
  blit(curl);

  // Vorticity
  gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
  gl.useProgram(programs.vorticity.program);
  gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach);
  gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach);
  gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
  gl.uniform1f(programs.vorticity.uniforms.dt, config.DT);
  blit(velocity.write);
  velocity.swap();

  // Divergence
  gl.bindFramebuffer(gl.FRAMEBUFFER, divergence.fbo);
  gl.useProgram(programs.divergence.program);
  gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach);
  blit(divergence);

  // Clear pressure
  gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
  gl.useProgram(programs.clear.program);
  gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach);
  gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE);
  blit(pressure.write);
  pressure.swap();

  // Pressure solve
  gl.useProgram(programs.pressure.program);
  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
    gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach);
    gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach);
    blit(pressure.write);
    pressure.swap();
  }

  // Gradient subtract
  gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
  gl.useProgram(programs.gradientSubtract.program);
  gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach);
  gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach);
  blit(velocity.write);
  velocity.swap();

  // Advect velocity
  gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
  gl.useProgram(programs.advection.program);
  gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach);
  gl.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach);
  gl.uniform1f(programs.advection.uniforms.dt, config.DT);
  gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
  blit(velocity.write);
  velocity.swap();

  // Advect density
  gl.bindFramebuffer(gl.FRAMEBUFFER, density.write.fbo);
  gl.uniform1i(programs.advection.uniforms.uSource, density.read.attach);
  gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
  blit(density.write);
  density.swap();
}

function render(target) {
  if (!target) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    gl.viewport(0, 0, target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  }

  gl.useProgram(programs.display.program);
  gl.uniform1i(programs.display.uniforms.uTexture, density.read.attach);
  blit(target);
}

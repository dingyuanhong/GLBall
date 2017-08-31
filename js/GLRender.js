"use strict";

var GLRender = function(Canvas,width,height){

  var defaultOption = {
      'width': '1140',
      'height': '640',
      'sphereRadius': 1,
      'spherePrecision': 50,
      'textureFileURL': 'test.mp4',
      'textureType': 'video'
  },
          canvas,
          gl,
          program,
          spherePointsCoordData = [],
          textureCoordData = [],
          pointNum,
          vMatrix = new Matrix4(),
          pMatrix = new Matrix4(),
          mMatrix = new Matrix4(),
          mvpMatrix = new Matrix4(),
          mvpMatrixLocation,
          uSampler,
          angleAlpha = 0,
          angleBeta = 0,
          lastAngleAlpha = 0,
          lastAngleBeta = 0,
          leftBtnDown = false,
          lastX,
          lastY,
          curX,
          curY,
          distance = 1,
          eyeX = 0,
          eyeY = 0,
          eyeZ = distance,
          fovy = 40,
          frameUpdate = false,
          mediaReady = false;

  canvas = Canvas;

  initWebGL(defaultOption);
  calcSphereData(defaultOption);
  setMatrix(mMatrix, setmMatrix);
  setMatrix(pMatrix, setpMatrix);
  setMatrix(vMatrix, setvMatrix);
  setMatrix(mvpMatrix, multmvpMatrix);
  var mvpMatrixLocation = gl.getUniformLocation(program, "mvpMatrix");
  gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements);
  setBuffer(spherePointsCoordData, 'avertexPosition', 3);
  setBuffer(textureCoordData, 'aTexCoord', 2);
  initTexture();
  handleUserInterface(canvas);

  function initWebGL(options) {
      canvas.width = options.width;
      canvas.height = options.height;
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.viewport(0, 0, options.width, options.height);
      //init shaders
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      var vshaderSource =
              'attribute vec4 avertexPosition;\n' +
              'uniform mat4 mvpMatrix;\n' +
              'attribute vec2 aTexCoord;\n' +
              'varying vec2 vTexCoord;\n' +
              'void main(){\n' +
              'gl_Position = mvpMatrix * avertexPosition;\n' +
              'vTexCoord = aTexCoord;\n' +
              '}';
      var fshaderSource =
              'precision mediump float;\n' +
              'uniform sampler2D uSampler;\n' +
              'varying vec2 vTexCoord;\n' +
              'void main(){\n' +
              'gl_FragColor = texture2D(uSampler, vTexCoord);\n' +
              '}';

      gl.shaderSource(vertexShader, vshaderSource);
      gl.shaderSource(fragmentShader, fshaderSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          console.log(gl.getShaderInfoLog(vertexShader));
      }
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          console.log(gl.getShaderInfoLog(fragmentShader));
      }
      //init program
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.log(gl.getProgramInfoLog(program));
      }
  }

  function initTexture(){
    uSampler = gl.getUniformLocation(program, "uSampler");
    var texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function renderFrame() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      pMatrix.setPerspective(fovy, canvas.width / canvas.height, 0.1, 100);
      setMatrix(vMatrix, setvMatrix);
      setMatrix(mvpMatrix, multmvpMatrix);
      gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements);

      render();
  }

  function renderTexture(frame) {
      // imgData.data.set(frame);
      // console.log(imgData);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,  frame);

      //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,width,height,0, gl.RGBA, gl.UNSIGNED_BYTE, frame );
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,width,height,0, gl.RGB, gl.UNSIGNED_BYTE, frame );


      //var buf = new Uint8Array(frame,0);
      // // var buf = frame;
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,width,height,0, gl.RGB, gl.UNSIGNED_BYTE, buf );
      //buf = null;

      gl.uniform1i(uSampler, 0);

      renderFrame();
  }

  function render(){
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointNum);
  }

  function calcSphereData(options) {
      for (var latNumber = 0; latNumber < options.spherePrecision; latNumber++) {
          for (var longNumber = 0; longNumber < options.spherePrecision; longNumber++) {

              getPoint(latNumber, longNumber, options.spherePrecision, options.sphereRadius);
              getPoint(latNumber, longNumber + 1, options.spherePrecision, options.sphereRadius);
              getPoint(latNumber + 1, longNumber + 1, options.spherePrecision, options.sphereRadius);

              getPoint(latNumber, longNumber, options.spherePrecision, options.sphereRadius);
              getPoint(latNumber + 1, longNumber + 1, options.spherePrecision, options.sphereRadius);
              getPoint(latNumber + 1, longNumber, options.spherePrecision, options.sphereRadius);
          }
      }
      pointNum = spherePointsCoordData.length / 3;
  }

  function getPoint(latNumber, longNumber, precision, radius) {
      var a = latNumber * Math.PI / precision;//弧度=((2*PI/360)*角度)
      var b = 2 * longNumber * Math.PI / precision;
      var x = Math.sin(a) * Math.sin(b) * radius;
      var y = Math.cos(a) * radius;
      var z = Math.sin(a) * Math.cos(b) * radius;
      var v = 1 - longNumber / precision;
      var u = 1 - latNumber / precision;

      spherePointsCoordData.push(x);
      spherePointsCoordData.push(y);
      spherePointsCoordData.push(z);

      textureCoordData.push(v);
      textureCoordData.push(u);
  }

  function setBuffer(data, location, size) {
      var vertex = new Float32Array(data);
      var FSIZE = vertex.BYTES_PER_ELEMENT;
      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
      var storeLocation = gl.getAttribLocation(program, location);
      gl.vertexAttribPointer(storeLocation, size, gl.FLOAT, false, FSIZE * size, 0);
      gl.enableVertexAttribArray(storeLocation);
  }

  function handleUserInterface(target) {
      target.addEventListener("mouseover", handleMouseOver, false);
      target.addEventListener("mousedown", handleMouseDown, false);
      target.addEventListener("mousemove", handleMouseMove, false);
      target.addEventListener("mouseup", handleMouseUp, false);
      target.addEventListener("mouseout", handleMouseOut, false);

	  target.addEventListener("touchstart", handleMouseDown, false);
      target.addEventListener("touchmove", handleMouseMove, false);
      target.addEventListener("touchend", handleMouseUp, false);
      target.addEventListener("touchcancel", handleMouseOut, false);
  }

  function handleMouseOver(){
    this.style.cursor = "-webkit-grab";
  }

  function handleMouseDown(){
    if (event.button == undefined || (event.button == 0 || window.event.button == 1))
		{
	    this.style.cursor = "-webkit-grabbing";
	    leftBtnDown = true;
			var Event = event;
			if(Event.touches != undefined)
			{
				Event = event.touches[0];
			}
			lastX = Event.clientX;
			lastY = Event.clientY;
    }
  }

  function handleMouseMove() {
      if (leftBtnDown) {
					var Event = event;
					if(Event.touches != undefined)
					{
						Event = event.touches[0];
					}

          curX = Event.clientX;
          curY = Event.clientY;
          var fovy_ = 2 * Math.atan(Math.tan(fovy * Math.PI / 360) * defaultOption.width / defaultOption.height);
          // console.log('fovy_:' + fovy_);
          var deltaX = curX - lastX;
          var deltaY = curY - lastY;
          var deltaAlpha = fovy_ * deltaX / defaultOption.width;
          var deltaBeta = fovy * (Math.PI / 180) * deltaY / defaultOption.height;

          angleAlpha = lastAngleAlpha + deltaAlpha;
          angleBeta = Math.max(Math.min(lastAngleBeta - deltaBeta, Math.PI / 2), -Math.PI / 2);
          // console.log('angleBeta:' + angleBeta);
          eyeX = distance * Math.cos(angleBeta) * Math.sin(angleAlpha);
          eyeY = distance * Math.sin(angleBeta);
          eyeZ = distance * Math.cos(angleBeta) * Math.cos(angleAlpha);
          frameUpdate = true;

          renderFrame();
					event.preventDefault();
      }
  }

  function handleMouseUp() {
      this.style.cursor = "-webkit-grab";
      leftBtnDown = false;
      lastX = curX;
      lastY = curY;
      lastAngleAlpha = angleAlpha;
      lastAngleBeta = angleBeta;
  }

  function handleMouseOut() {
      leftBtnDown = false;
      this.style.cursor = "auto";
  }

  function setMatrix(matrix, handleFn) {
      handleFn(matrix);
  }

  function setmMatrix(matrix) {
      matrix.setIdentity();
  }

  function setpMatrix(matrix) {
      matrix.setPerspective(fovy, defaultOption.width / defaultOption.height, 0.1, 100);
  }

  function setvMatrix(matrix) {
      matrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
  }

  function multmvpMatrix(matrix) {
      matrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);
  }

  var GLRender = {};
  GLRender.prototype = GLRender;
  GLRender.updata = renderTexture;

  return GLRender;
}

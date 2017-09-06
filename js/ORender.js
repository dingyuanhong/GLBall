function Render(Canvas,target){
  function GetGL(canvas){
    return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  }

  var defaultOption = {
      'width': '1140',
      'height': '640',
      'sphereRadius': 1.0,
      'spherePrecision': 50
  };

  var canvas = Canvas,
  gl = GetGL(canvas),
  program = null,
  spherePointsCoordData = [],
  textureCoordData = [],
  pointNum = 0;

  if(gl == null){
    return null;
  }

  defaultOption.width = canvas.width;
  defaultOption.height = canvas.width;

  initWebGL(defaultOption);
  initTexture();
  calcSphereData(defaultOption);

  setBuffer(spherePointsCoordData, 'avertexPosition', 3);
  setBuffer(textureCoordData, 'aTexCoord', 2);

  var mvpMatrixLocation = gl.getUniformLocation(program, "mvpMatrix");
  var uSampler = gl.getUniformLocation(program, "uSampler");

  //初始化webgl
  function initWebGL(options) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

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
			var ball_vertex = JCore.$import('./Shader/ball_vertex.glsl')
			var ball__fragment = JCore.$import('./Shader/ball_fragment.glsl')
			vshaderSource = ball_vertex.text;
			fshaderSource = ball__fragment.text;

			var extensions = gl.getSupportedExtensions();
			console.log(extensions);
			gl.getExtension('OES_standard_derivatives');
			gl.getExtension('EXT_shader_texture_lod');

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
  //初始化纹理
	function initTexture(){
		var texture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	function initFBO()
	{
		var width = defaultOption.width;
		var height = defaultOption.height;
		var frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		//绑定纹理
		var renderbBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGB565, width, height);
		// gl.RenderbufferStorageMultisample(GL_RENDERBUFFER, 16, GL_RGBA8, width, heigh);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbBuffer);
		//深度缓冲区
		var depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer);
		gl.bindRenderbuffer(gl.RENDERBUFFER,null);

		var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(e != gl.FRAMEBUFFER_COMPLETE)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
			console.log("fbo check error!" + e);
			return null;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		return {"frame":frameBuffer,"render":renderBuffer,"depth":depthBuffer};

	}

	function Draw(frameBuffer)
	{
		console.log("draw");
		var width = defaultOption.width;
		var height = defaultOption.height;

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, frameBuffer);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
		gl.blitFramebuffer(0, 0, width, height, 0, 0,
			width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
	}

	var fboBuffer = null;
	function bindFBO()
	{
		if(fboBuffer == null)
		{
			fboBuffer = initFBO();
		}
		if(fboBuffer != null)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER,fboBuffer.frame);
		}
	}

	function fboDraw()
	{
		if(fboBuffer != null)
		{
			Draw(fboBuffer.frame);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	}

	//绘制图片
	function renderTexture(frame) {
		
		//bindFBO();
		gl.viewport(0, 0, defaultOption.width, defaultOption.height);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  frame);
		gl.useProgram(program);
		gl.uniform1i(uSampler, 0);

		renderFlush();

		//fboDraw();
	}
  //渲染
  function renderArray(){
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.POINTS, 0, pointNum);
    // gl.drawArrays(gl.LINES, 0, pointNum);
    // gl.drawArrays(gl.LINE_LOOP, 0, pointNum);
    // gl.drawArrays(gl.LINE_STRIP, 0, pointNum);
    gl.drawArrays(gl.TRIANGLES, 0, pointNum);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointNum);
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, pointNum);
  }
  //获取圆球数据
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
  //获取圆球点
  function getPoint(latNumber, longNumber, precision, radius) {
      var a = latNumber * Math.PI / precision;//弧度=((2*PI/360)*角度),Math.sin参数为弧度
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
	//设置参数
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
	//设置矩阵
	function SetMVPMatrix(mvpMatrix){
		gl.useProgram(program);
		gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements);
	}

//矩阵操作
	var vMatrix = new Matrix4();    //视点矩阵
	var pMatrix = new Matrix4();    //透视变换矩阵
	var mMatrix = new Matrix4();    //模型矩阵
	var mvpMatrix = new Matrix4();  //变换计算完成后的矩阵

	var fovy = 40;    //视角度数
	var distance = 1.0; //视点球半径

	var eyeX = 0,     //视点坐标
	eyeY = 0,
	eyeZ = distance;
	var upX = 0,      //上方向
	upY = 1,
	upZ = 0;
	var near = 0.1;   //近视点

	//当前视点弧度
	var angleAlpha = eyeX==0?Math.atan(eyeZ/eyeX):(eyeZ >= 0?0:Path.PI);
	var angleBeta = Math.acos(eyeY/distance);

	function setMatrix(matrix, handleFn) {
		handleFn(matrix);
	}

	//初始化
	function setmMatrix(matrix) {
		matrix.setIdentity();
	}

	//透视投影可视空间
	function setpMatrix(matrix) {
		matrix.setPerspective(fovy, defaultOption.width / defaultOption.height, near, 100);
	}

	//视点矩阵
	function setvMatrix(matrix) {
		matrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, upX, upY, upZ);
	}

	//变换组合
	function multmvpMatrix(matrix) {
		matrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);
	}

//初始化矩阵
	function initMatrix(){
	    setMatrix(mMatrix, setmMatrix);
	    setMatrix(vMatrix, setvMatrix);   //世界坐标转视口坐标
	    // setMatrix(pMatrix, setmMatrix);
	    setMatrix(pMatrix, setpMatrix);
	    setMatrix(mvpMatrix, multmvpMatrix);

	    SetMVPMatrix(mvpMatrix);
	}

//变换矩阵
	function matrixTransformation(){
		setMatrix(pMatrix, setpMatrix);//视点矩阵
		setMatrix(vMatrix, setvMatrix);
		setMatrix(mvpMatrix, multmvpMatrix);

		SetMVPMatrix(mvpMatrix);
	}

	//刷新效果
	function renderFlush(){
		matrixTransformation();
		renderArray();
	}

	function FovZoon(fovDistance)
	{
		var distance = parseInt(fovDistance*1000);
		var newFov = fovy - distance;
		if(distance == 0){
			return;
		}else if(newFov < 10){
			fovy = 10;
		}else if(newFov > 170){
			fovy = 170;
		}else {
			fovy = newFov;
		}
		//renderFlush();
	}

//鼠标操作
	function handleUserInterface(target) {
		var leftBtnDown = false;
		var lastX = 0;
		var lastY = 0;
		var curX = 0;
		var curY = 0;
		var frameUpdate = false;
		var lastAngleAlpha = 0;
		var lastAngleBeta = 0;

		var RotateY = false;

		var timer = null;
		var timeValue = 10;
		var timeBegin = 0;
		var timeEnd = 0;

		//调整alpha参数
		function AdjustAlpha(angleAlpha){
			//匹配弧长是否大于圆球弧长,大则反转,弧长小于0则反转
			if(angleAlpha > Math.PI*2){
				angleAlpha -= Math.PI*2;
			}else if(angleAlpha < 0 )
			{
				angleAlpha += Math.PI*2;
			}
		}
		//调整beta参数
		function AdjustBeta(angleAlpha){
			//Y轴弧长需要处理两个极点坐标(0,180,360)
			if(angleBeta == Math.PI){
			  angleBeta += 0.001;
			}
			else if(angleBeta == Math.PI*2)
			{
			  angleBeta -= 0.001;
			}
			else if(angleBeta == 0)
			{
			  angleBeta += 0.001;
			}
			{
				//匹配弧长是否大于圆球弧长,大则反转,弧长小于0则反转
				if(angleBeta > Math.PI*2)
				{
					angleBeta -= Math.PI*2;
				}
				else if(angleBeta <= 0 )
				{
					angleBeta += Math.PI*2;
				}

				//切换上方向,保证观看方向正确,画面不翻转
				upY = 1;
				if(angleBeta >= Math.PI)
				{
					upY = -1;
				}
			}
		}

		//移动视点矩阵
		function vMatrixMove(ratio){
			// var fovy_ = 2 * Math.atan(Math.tan(fovy * Math.PI / 360) *  target.width / defaultOption.height);
			// var fovy_t = (fovy/360)*2*Math.PI;
			// console.log(fovy_ + ' ' + fovy_t);

			var deltaX = curX - lastX;  //x轴移动距离
			var deltaY = curY - lastY;  //y轴移动距离
			var deltaAlpha = 2*Math.PI*(fovy/360)*(deltaX*ratio / target.width);//计算X轴弧度
			var deltaBeta =  Math.PI*(fovy/180)*(deltaY*ratio / target.height); //计算Y轴弧度

			angleAlpha = lastAngleAlpha - deltaAlpha;
			angleBeta = lastAngleBeta + deltaBeta;

			AdjustAlpha(angleAlpha);
			if(!RotateY){
			  //y轴不转过头
			  angleBeta = Math.max(Math.min(angleBeta, Math.PI -0.0001 ), 0.0001);
			  // angleBeta = Math.max(Math.min(angleBeta, Math.PI ), 0);//黑屏
			}else{
			  //y轴转过头
			  AdjustBeta(angleBeta);
			}

			eyeX = distance * Math.sin(angleBeta) * Math.cos(angleAlpha);
			eyeY = distance * Math.cos(angleBeta);
			eyeZ = distance * Math.sin(angleBeta) * Math.sin(angleAlpha);
		}

		function Zoon(Distance)
		{
			Distance = distance*Distance*10;
			Distance = distance - Distance;
			if(Distance <= 0.2){
			  distance = 0.2;
		  	}else if(Distance > 8){
			  distance = 8;
			}else {
			  distance = Distance;
			}

			eyeX = distance * Math.sin(angleBeta) * Math.cos(angleAlpha);
			eyeY = distance * Math.cos(angleBeta);
			eyeZ = distance * Math.sin(angleBeta) * Math.sin(angleAlpha);
			near = distance;
			//renderFlush();
		}

		function timerCallback(){
			if(timeValue < 100){
				lastAngleAlpha = angleAlpha;
				lastAngleBeta = angleBeta;

				//计算距离,归一化,(0,1)间
				var aspectRatio = Math.sqrt(target.width*target.width + target.height*target.height);
				var deltaX = curX - lastX;  //x轴移动距离
				var deltaY = curY - lastY;  //y轴移动距离
				var aspect = Math.sqrt(deltaX*deltaX + deltaY*deltaY);  //距离
				if(aspect <= 0){
					clearTimeout(timer);
					return;
				}
				//计算时差,(0~1000)间
				var jetLag = 200 - (timeEnd - timeBegin); //时差
				if(jetLag <= 0){
					clearTimeout(timer);
					return;
				}
				//计算拖动比率
				var distanceRatio = jetLag * aspectRatio/aspect;
				//检查参数是否正确
				if(distanceRatio <= 0 ){
					clearTimeout(timer);
					return;
				}
				//计算旋转角度
				var ratio = 4*distanceRatio/((timeValue)*(timeValue)*9.8/2);
				// console.log('jetLag:' + jetLag + ' \ndistanceRatio:' + distanceRatio + ' timeValue:' + timeValue + ' \nratio:' + ratio);

				//计算渲染超时时间
				var timeout = 1000/60;
				//如果需要移动的步数超过1,则在一帧内快速计算移动,避免画面跳跃
				if(ratio > 1){
					timeout /= ratio;
					ratio = 1;
					timeValue += 0.8;
					}else{
					timeValue += timeout;
				}

				//移动
				vMatrixMove(ratio);
				//渲染
				//renderFlush();

				//开启定时器
				timer = setTimeout(timerCallback,timeout);
			}else{
				clearTimeout(timer);
			}
		}

		function handleMouseOver(){
			// this.style.cursor = "-webkit-grab";
		}

		function handleMouseDown(){
			console.log("MouseDown");
			if (event.button == undefined || (event.button == 0 || window.event.button == 1)) {
				if(timer != null) clearTimeout(timer);
				// this.style.cursor = "-webkit-grabbing";
				leftBtnDown = true;
				var Event = event;
				if(Event.touches != undefined)
				{
					Event = event.touches[0];
				}
				lastX = Event.clientX;
				lastY = Event.clientY;
				curX = lastX;
				curY = lastY;

				lastAngleAlpha = angleAlpha;
				lastAngleBeta = angleBeta;

				timeBegin = new Date().getTime();
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
				vMatrixMove(1);
				//renderFlush();
				event.preventDefault();
			}
		}

		function handleMouseUp() {
			// this.style.cursor = "-webkit-grab";
			leftBtnDown = false;

			// console.log("------------------------------");
			timeEnd = new Date().getTime();
			timeValue = 10;
			timer = setTimeout(timerCallback,1000/60);
			}

			function handleMouseOut() {
			leftBtnDown = false;
			// this.style.cursor = "auto";
		}

		function handleMouseWheel(e){
			if(timer != null) clearTimeout(timer);
			var e = window.event || e; // old IE support
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

			Zoon(4*delta/100);
			return false;
		}

		function dist(pointA,pointB)
		{
			var dist = (pointA[0] - pointB[0])*(pointA[0] - pointB[0])  + (pointA[1] - pointB[1])*(pointA[1] - pointB[1]);
			var distance = Math.sqrt(dist);
			return distance;
		}

		var touchStart = function ()
		{
			handleMouseDown();
		}

		target.LastScaletLen  = 0;
		var touchMove = function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			if(e.touches && e.touches.length === 1) {
				this.LastScaletLen = 0;
				handleMouseMove();
		    } else if(e.touches && e.touches.length === 2) {
				handleMouseUp();
				var LastScaletLen = this.LastScaletLen;
				var len = dist(
				  [e.touches[0].screenX, e.touches[0].screenY],
				  [e.touches[1].screenX, e.touches[1].screenY]
				  );
				if(len == NaN) return;
				len = parseInt(len);
				if(LastScaletLen <= 0)
  				{
					this.LastScaletLen = len;
					return;
  				}
				if(len - LastScaletLen == 0) return;
				var scale = (len - LastScaletLen)/(LastScaletLen*1.0);
				this.LastScaletLen = len;
				Zoon(scale);
				// FovZoon(scale);
			}
		}

		var touchEnd = function (e)
		{
			this.LastScaletLen = 0;
			handleMouseUp();
		}

		target.addEventListener("mouseover", handleMouseOver, false);
		target.addEventListener("mousedown", handleMouseDown, false);
		target.addEventListener("mousemove", handleMouseMove, false);
		target.addEventListener("mouseup", handleMouseUp, false);
		target.addEventListener("mouseout", handleMouseOut, false);

		target.addEventListener("mousewheel", handleMouseWheel, false);

		target.addEventListener("touchstart", touchStart,false);
		target.addEventListener("touchmove", touchMove,false);
		target.addEventListener("touchend", touchEnd,false);
  }

  initMatrix();
  handleUserInterface(target);

  var render = {};
  render.updata = renderTexture;
  render.render = renderFlush;
  render.option = defaultOption;
  return render;
}

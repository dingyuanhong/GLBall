var VideoCallback = function(id,callback){
	var video = document.getElementById(id);

	var timerCallback = function(){
		if(video.paused || video.ended){
		  return;
		}
		callback(video);
		setTimeout(function(){
		  timerCallback();
		},1000/60);
	}

	video.addEventListener("play",function(){
		timerCallback();	
	},false);

	if(video.autoplay){
		timerCallback();
	}
}

var VideoPlay= function(canvas,video)
{
	console.log(video);
	canvas.width = 1000;
	canvas.height = 800;
	canvas.clientWidth = 3040;
	canvas.clientHeight = 1520;
	//console.log(video.clientWidth);
	
	var render = new Render(canvas,canvas);
	var camputeFrame = function(image){
		render.updata(image);
	}

	VideoCallback("video",camputeFrame);
}

var onLoadGLTest = function(){
	var video = document.getElementById('video');
	
	// var gl = document.getElementById("imgCanvas").getContext("2d");
	var canvas = document.getElementById("glCanvas");
	
	//var render = new GLRender(canvas,800,800);
	//var render = new GLRender(canvas,canvas.width,canvas.height);
	
	video.oncanplay =  function() {
		VideoPlay(canvas,video);
		video.oncanplay = null;
	};

	window.ondragover=function(e) {
		//console.log(e);
		e.preventDefault(); 
		//e.stopPropagation();
		return false;
	};
	window.ondrop=function(e) {
		//获取路径
		//浏览器专用
		var url = window.URL.createObjectURL(e.dataTransfer.files[0]);
		document.getElementById('video2').src = url;
		//electron 专用
		//console.log(e.dataTransfer.files[0].path);
		e.preventDefault();
		//e.stopPropagation();
		return true;
	};
}

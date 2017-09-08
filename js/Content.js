function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

function browserPC() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
        return true;
    }
	return false;
}

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
		if(browserPC() || IsPC())
			timerCallback();
	}
	
	video.onerror = function(e) {
		console.log("video error!");
		console.log(video.error);
		alert(video.error.message);
	};
}

var VideoPlay= function(canvas,video)
{
	console.log(video);
	canvas.width = 1000;
	canvas.height = 800;
	canvas.clientWidth = 3040;
	canvas.clientHeight = 1520;
	//console.log(video.clientWidth);
	
	var render = new Render(canvas,canvas,{'selfRender':true});
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
	
	VideoPlay(canvas,video);
	if(!(browserPC() || IsPC()))
	{
		var openBtn = document.getElementById('videoOpen');
		openBtn.addEventListener("click",function(){
			video.play();
		});
	}
	else
	{
		var openBtn = document.getElementById('videoOpen');
		openBtn.setAttribute('class','hide');
	}

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

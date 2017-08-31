var CreateActiveXObject = function ()
{
	if(typeof ActiveXObject == "undefined") return null;

	var versions = ["MSXML.XMLHttp","MSXML.XMLHttp.6.0","MSXML.XMLHttp.3.0"];
	var activeXString = '';
	for(i=0,len=version.length;i<len;i++){
		try{
			new ActiveXObject(versions[i]);
			activeXString = versions[i];
			break;
		}catch(e){
		//step
		}
	}
	if(activeXString == '')
	{
		return null;
	}
	return new ActiveXObject(activeXString); // IE6, IE5 浏览器执行代码
}

var JCore = {//构造核心对象
    version:1.0,
	$load:function(url)
	{
		var xmlhttp = null;
		if (window.XMLHttpRequest)
		{
		  xmlhttp = new XMLHttpRequest();  // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
		}
		else if(typeof ActiveXObject != "undefined")
		{
			xmlhttp = CreateActiveXObject();
		}
		if (xmlhttp == null) {
			return '';
		}

		xmlhttp.open("GET",url,false);
		xmlhttp.send();
		if (xmlhttp.status == 200)
		{
			var text = xmlhttp.responseText;
			return text;
		}else {
			return '';
		}
	},
	$import:function(url){
	    var file = url.toString();
	    var IsRelativePath = (file.indexOf("$")==0 ||file.indexOf("/")==-1);//相对路径(相对于JCore)
	    var path=file;
	    if(IsRelativePath){//计算路径,$开头表示使用当前脚本路径，/开头则是完整路径
	        if(file.indexOf("$")==0)
	            file = file.substr(1);
	        path = JCore.$dir+file;
	    }
	    var newElement=null;
	    var ext = path.substr(path.lastIndexOf(".")+1);
	    if(ext.toLowerCase()=="js"){
	        var scriptTags = document.getElementsByTagName("script");
	        for(var i=0;i < scriptTags.length;i++) {
	            if(scriptTags[i].src && scriptTags[i].src.indexOf(path)!=-1)
	                return scriptTags[i];
	        }
	        newElement=document.createElement("script");
	        newElement.type="text/javascript";
	        newElement.src=path;
	    }
	    else if(ext.toLowerCase()=="css"){
	        var linkTags = document.getElementsByTagName("link");
	        for(var i=0;i < linkTags.length;i++) {
	            if(linkTags[i].href && linkTags[i].href.indexOf(path)!=-1)
	                return linkTags[i];
	        }
	        newElement=document.createElement("link");
	        newElement.type="text/css";
	        newElement.rel="Stylesheet";
	        newElement.href=path;
	    }
	    else if (ext.toLowerCase()=="glsl") {
			var scriptTags = document.getElementsByTagName("script");
			for(var i=0;i < scriptTags.length;i++) {
				if(scriptTags[i].src && scriptTags[i].src.indexOf(path)!=-1)
					return scriptTags[i];
			}
			var vertex = path.lastIndexOf("_vertex.glsl")
			if(vertex > 0)
			{
				newElement = document.createElement("script");
				newElement.type="x-shader/x-vertex";
				newElement.src=path;
				var doc = this.$load(path);
				newElement.text = doc;
				return newElement;
			}else {
				newElement = document.createElement("script");
				newElement.type="x-shader/x-fragment";
				newElement.src=path;
				var doc = this.$load(path);
				newElement.text = doc;
				return newElement;
			}
	    }
	    else{
			console.log('$import Unknown ext:' + ext);
			return;
		}
		return newElement;
	},
	$dir : function(){
		var scriptTags = document.getElementsByTagName("script");
		for(var i=0;i < scriptTags.length ;i++) {
		    if(scriptTags[i].src && scriptTags[i].src.match('/JCore/.js$/')) {
		        path = scriptTags[i].src.replace('/JCore/.js$/',"");
		        return path;
		    }

		}
		return "";
	}()
}

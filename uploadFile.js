function onprogress(evt){
	var loaded = evt.loaded;     //�Ѿ��ϴ���С���
	var tot = evt.total;      //�����ܴ�С
	var per = Math.floor(100*loaded/tot);  //�Ѿ��ϴ��İٷֱ�
	var value = parseInt(loaded);
	var b = parseInt(value%1024)
	var kb = parseInt((value/1024)%1024)
	var mb = parseInt((value/(1024*1024))%1024)
	var gb = parseInt(value/(1024*1024*1024))

	var ss = '';
	if(gb > 0){
		ss += gb + 'G';
	}
	if(mb > 0){
		ss += mb + 'M';
	}
	if(kb > 0){
		ss += kb + 'K';
	}
	if(b > 0){
		ss += b;
	}

	$("#son").html( ss + '      ' + per +"%" );
}

function uploadFile(){
  var formData = new FormData($("#frmUploadFile")[0]);
  $("#spanMessage").html('');
  $.ajax({
    url: '/upload',
    type: 'POST',
    data: formData,
    async: true,
    cache: false,
    contentType: false,
    processData: false,
	dataType:'json',
	xhr: function(){
		var xhr = $.ajaxSettings.xhr();
		if(onprogress && xhr.upload) {
			xhr.upload.addEventListener("progress" , onprogress, false);
			return xhr;
		}
	},
    success: function(data){
	console.log(data)
      if(200 === data.code) {
        $("#imgShow").attr('href', data.msg.url);
		$("#imgShow").text(data.msg.url);
        $("#spanMessage").html("�ϴ��ɹ� " + data.code);
      } else {
        $("#spanMessage").html("�ϴ�ʧ�� " + data.code);
      }
    },
    error: function(){
      $("#spanMessage").html("�������ͨ�ŷ�������");
    }
  });
}

$(document).ready(function(){
	window.ondragover=function(e) {
		//console.log(e);
		e.preventDefault();
		//e.stopPropagation();
		return false;
	};
	window.ondrop=function(e) {
		//console.log(e)
		//var data = event.dataTransfer.getData('text');
		console.log(window.URL.createObjectURL(e.dataTransfer.files[0]));
		e.preventDefault();
		e.stopPropagation();
	};
})

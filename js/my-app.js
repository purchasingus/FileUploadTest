var jphoto = null;
var newBlob;

function onAppReady() {
	
	document.getElementById('btnCamera').addEventListener("click", fnCamera, false);
    document.getElementById('btnGallery').addEventListener("click", fnGallery, false);
	
	document.getElementById('btn1').addEventListener("click", fnBtn1, false);
	document.getElementById('btn2').addEventListener("click", fnBtn2, false);
	document.getElementById('btn3').addEventListener("click", fnBtn3, false);
	
    document.getElementById('btnSubmit').addEventListener("click", fnSubmit, false);
	
	
}
document.addEventListener("deviceready", onAppReady, false) ;

function fnCamera() {
    
    navigator.camera.getPicture(
        onSuccess, 
        onFail, 
        {
			quality: 75,
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI,
			allowEdit : false,
			targetWidth: 1920,
			targetHeight: 1080,
			correctOrientation: true,
			saveToPhotoAlbum: false 
        }
    );

    function onSuccess(result) {
        
		try {
		
		// convert JSON string to JSON Object
        var thisResult = JSON.parse(result);
		
        /*
		jphoto = encodeURI(thisResult.filename);
		var image = document.getElementById('myImage');
        image.src = thisResult.filename;
		*/
        
		
        document.getElementById('debug1').innerText = JSON.stringify(thisResult);
		//document.getElementById('debug2').innerText = JSON.stringify(metadata);
		
		
        } catch(e) {
			alert('camera onsuccess ' + e);
		}
		
		
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
    
}

function fnGallery() {
	
    /*navigator.camera.getPicture(
        onSuccess, 
        onFail, 
        {
            quality: 75,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URI,
			allowEdit : false,
			targetWidth: 1920,
			targetHeight: 1080,
			correctOrientation: true,
			saveToPhotoAlbum: false 
        }
    );*/
    
}

function fnBtn1() {
	
	try {
		
		var tempImage = new Image();
		tempImage.src = jphoto;
		tempImage.onload = function() {
			
			var iWidth = this.width; 
			var iHeight = this.height; 
			
			/* write image into temp canvas with new size */
			var t_Canvas = document.createElement("canvas");
			t_Canvas.width = iWidth;
			t_Canvas.height = iHeight;
			var t_Ctx = t_Canvas.getContext("2d");
			t_Ctx.drawImage(tempImage, 0, 0, iWidth, iHeight);
			
			/* turn into base64 */
			var dataURL = t_Canvas.toDataURL('image/jpeg', 0.8);
			
			/* convert to blob */
			var byteString;
			byteString = atob(dataURL.split(',')[1]);
			
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			newBlob = new Blob([ia], {type: 'image/jpg'});
			
			alert('blob created');
			
		}
		
	} catch(e) {
		alert('error fnBtn1 ' + e);
	}
	
}

function fnBtn2() {
	
	try {
	
		alert('do nothing');
	
	} catch(e) {
		alert('error fnBtn2 ' + e);
	}
	
}

function fnBtn3() {
	
	try {
	
		
		var path = document.getElementById('debug2').innerText;
		var img = document.getElementById('myImage');
        img.src = path;
		
		alert('btn3 done');
	
	} catch(e) {
		alert('error fnBtn3 ' + e);
	}
	
}

function fnSubmit() {
    
	if (jphoto!=null) {
		
		try {

			var fileURL = jphoto;
			var uri = encodeURI("http://ztest.cornerstone-cloud.com/myrol/MyROL_app_listener.cfm");
			var jFileName = new Date().getTime() + '.jpg';  //force filename to get around unicode and other illegal characters issue
			
			
			var formData = new FormData();
			formData.append('fphoto1', newBlob, jFileName);
			
			formData.append('var1', 'value1');
			formData.append('lng', 101.673599);
			formData.append('lat', 3.207070);
			
			
			var xhr = new XMLHttpRequest();
			
			
			xhr.upload.addEventListener('loadstart', onloadstartHandler, false);
			xhr.upload.addEventListener('progress', onprogressHandler, false);
			xhr.upload.addEventListener('load', onloadHandler, false);
			xhr.addEventListener('readystatechange', onreadystatechangeHandler, false);
			
			
			xhr.open('POST', uri);
			
			xhr.send(formData);
			
			
			
			/*
			var options = new FileUploadOptions();
			options.fileKey = "fphoto1";
			options.fileName = jFileName;
			options.mimeType = "text/plain";
			options.chunkedMode = false;

			var params = {};    //other data
			params.fLng = $$('#fLng').val();
			params.fLat = $$('#fLat').val();
			params.fType = $$('#fType').val();
			params.fIssue = $$('#fIssue').val();
			params.fSource = JSON.stringify($$('#fSource').val());
			params.fObservation = JSON.stringify($$('#fObservation').val());
			params.fConcerns = JSON.stringify($$('#fConcerns').val());
			params.fComment = $$('#fComment').val();
			params.fUserID = window.localStorage.getItem("userid");
			options.params = params;

			//var headers = { 'headerParam': 'headerValue' };
			//options.headers = headers;

			options.httpMethod = "POST";

			var ft = new FileTransfer();
			ft.upload(fileURL, uri, onSuccess, onError, options);

			function onSuccess(r) {
				//console.log("Code = " + r.responseCode);
				//console.log("Response = " + r.response);
				//console.log("Sent = " + r.bytesSent);
				myApp.alert(useArr['SubmitSuccess'], 'ROL Citizen\'s Eye');
				resetForm();
			}

			function onError(error) {
				//console.log("An error has occurred: Code = " + error.code);
				//console.log("upload error source " + error.source);
				//console.log("upload error target " + error.target);
				myApp.alert(useArr['SubmitFail'], 'ROL Citizen\'s Eye');
				$$('#btnSubmit').removeAttr('disabled');
			}
			*/

		} catch(e) {
			alert(e);
		}

	}
    
}

// Handle the start of the transmission
function onloadstartHandler(evt) {
  var div = document.getElementById('upload-status');
  div.innerHTML = 'Upload started.';
}
// Handle the end of the transmission
function onloadHandler(evt) {
  var div = document.getElementById('upload-status');
  div.innerHTML += '<' + 'br>File uploaded. Waiting for response.';
}
// Handle the progress
function onprogressHandler(evt) {
  var div = document.getElementById('progress');
  var percent = evt.loaded/evt.total*100;
  div.innerHTML = 'Progress: ' + percent + '%';
}
// Handle the response from the server
function onreadystatechangeHandler(evt) {
  var status, text, readyState;
  try {
    readyState = evt.target.readyState;
    text = evt.target.responseText;
    status = evt.target.status;
  }
  catch(e) {
    return;
  }
  if (readyState == 4 && status == '200' && evt.target.responseText) {
    var status = document.getElementById('upload-status');
    status.innerHTML += '<' + 'br>Success!';
    var result = document.getElementById('result');
    result.innerHTML = '<p>The server saw it as:</p><pre>' + evt.target.responseText + '</pre>';
  }
}



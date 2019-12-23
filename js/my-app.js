var jphoto = null;

function onAppReady() {
	
	document.getElementById('btnCamera').addEventListener("click", fnCamera, false);
    document.getElementById('btnGallery').addEventListener("click", fnGallery, false);
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
        // convert JSON string to JSON Object
        var thisResult = JSON.parse(result);
		
		// convert json_metadata JSON string to JSON Object 
        var metadata = JSON.parse(thisResult.json_metadata);
        
        jphoto = encodeURI(thisResult.filename);
		var image = document.getElementById('myImage');
        image.src = thisResult.filename;
        
		
        document.getElementById('debug1').innerText = JSON.stringify(thisResult);
		document.getElementById('debug2').innerText = JSON.stringify(metadata);

        
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
    
}

function fnGallery() {
	
    navigator.camera.getPicture(
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
    );

    function onSuccess(result) {
        // convert JSON string to JSON Object
        var thisResult = JSON.parse(result);
	   
	    // convert json_metadata JSON string to JSON Object 
        var metadata = JSON.parse(thisResult.json_metadata);
		//$$('#cmetadata').text(thisResult.filename);
        
        jphoto = encodeURI(thisResult.filename);
        var image = document.getElementById('myImage');
        image.src = thisResult.filename;
        
        
		document.getElementById('debug1').innerText = JSON.stringify(thisResult);
		document.getElementById('debug2').innerText = JSON.stringify(metadata);
		
        
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
}

function fnSubmit() {
    
	if (jphoto!=null) {
		
		try {

			var fileURL = jphoto;
			var uri = encodeURI("http://ztest.cornerstone-cloud.com/myrol/MyROL_app_listener.cfm");
			var jFileName = new Date().getTime() + '.jpg';  //force filename to get around unicode and other illegal characters issue
			
			var blob = new Blob([fileURL], {type: 'image/jpg'});
			
			var formData = new FormData();
			formData.append('myPhotofile', blob, jFileName);
			
			
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



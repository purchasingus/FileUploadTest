// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon: true
});

// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: true,
    // Enable Dom Cache so we can use all inline pages DISABLED FOR GOOGLE MAP
    domCache: false
});


//initialize empty pushwooshid
if (window.localStorage.getItem("didAddPushUser")==null) {
    window.localStorage.setItem("didAddPushUser", "");
}

//initialize phantom userid
if (window.localStorage.getItem("userid")==null) {
    window.localStorage.setItem("userid", "-1");
}

//initialize phantom user email
if (window.localStorage.getItem("userEmail")==null) {
    window.localStorage.setItem("userEmail", "");
}


//initialize empty about page EN
if (window.localStorage.getItem("aboutPageEN")==null) {
    window.localStorage.setItem("aboutPageEN", "");
}

//initialize empty about page BM
if (window.localStorage.getItem("aboutPageBM")==null) {
    window.localStorage.setItem("aboutPageBM", "");
}

var aboutPageID = { //menuid
    'EN': 8, 
    'BM': 14
}



//EN-BM translation moved to lang.js

var arrkeys = Object.keys(arrLabelEN); 

function switchLang(lang) {
	
	var useArr = eval('arrLabel'+lang);
	var key; 
	
	for (var i=0; i<arrkeys.length; i++) {
		
		key = arrkeys[i];
        
        if (key=='sLngLat') {   //special case for "No Location" only
            var curVal = $$('#sLngLat').text();
            if (curVal.indexOf('(')!=-1) {
                document.getElementById(key).innerHTML = useArr[key];
            }
            
        } else if (key=='pac-input') {  //special case for autofill placeholdertext
            $$('#pac-input').attr('placeholder', useArr[key]);
        
        } else if (key=='fLoginEmail') {  //special case for login email placeholdertext
            $$('#fLoginEmail').attr('placeholder', useArr[key]);
        
        } else if (key=='fLoginPassword') {  //special case for login password placeholdertext
            $$('#fLoginPassword').attr('placeholder', useArr[key]);
        
        } else if (key=='fRegEmail') {  //special case for registration email placeholdertext
            $$('#fRegEmail').attr('placeholder', useArr[key]);
        
        } else if (key=='fRegPassword') {  //special case for registration password placeholdertext
            $$('#fRegPassword').attr('placeholder', useArr[key]);
        
        } else if (key=='fRegPassword2') {  //special case for registration password2 placeholdertext
            $$('#fRegPassword2').attr('placeholder', useArr[key]);
        
        } else if (key=='fRetPwdEmail') {  //special case for retrieve password email placeholdertext
            $$('#fRetPwdEmail').attr('placeholder', useArr[key]);
        
        } else if (key.substr(0, 3)=='val') {  //special case for values translation for myrol listing page
            
            $$('.'+key).each(function(num, elm) {
                
                elm.innerHTML = useArr[key];
            });
        
        } else {
            document.getElementById(key).innerHTML = useArr[key];
            
        }
		
	}
	
	myApp.params.smartSelectBackText = arrLabelBack[lang];
	myApp.initSmartSelects($$('#pageOverall'));
	
    $$('#btnEN').removeClass('button-fill'); 
    $$('#btnBM').removeClass('button-fill'); 
    $$('#btn'+lang).addClass('button-fill');
    
	myApp.formStoreData('formLang', { 'Lang': lang });
	myApp.closePanel();
    
    fnInfoPage();
	
}


//init lang storage
var storedLang = myApp.formGetData('formLang');
if (storedLang) {
	
	switchLang(storedLang.Lang);
	
} else {
	
	//myApp.formStoreData('formLang', { 'Lang': 'EN' });
    
    myApp.modal({
        title:  'Welcome to Citizen\'s Eye',
        text: 'Choose your preferred language',
        verticalButtons: true,
        buttons: [
            {
                text: 'English',
                onClick: function() { switchLang('EN') }
            },
            {
                text: 'Bahasa Malaysia',
                onClick: function() { switchLang('BM') }
            }
        ]
    });
}


function switchType(type) {
	
	if (type=='Issue' && $$('#fType').val()!='Issue') {
		
		$$('#lbl_Type_Issue').addClass('active');
		$$('#lbl_Type_BestPractice').removeClass('active');
		$$('#fType').val('Issue');
		
		$$('.grpIssue').show();
		
	} else if (type=='BestPractice' && $$('#fType').val()!='BestPractice') {
		
		$$('#lbl_Type_Issue').removeClass('active');
		$$('#lbl_Type_BestPractice').addClass('active');
		$$('#fType').val('BestPractice');
		
		$$('.grpIssue').hide();
		
	}
	
}

function resetLang() {
    myApp.formDeleteData('formLang');
}


$$('#pageOverall').on('pageInit', function(obj) { 
	
    //if ($$('#ssfIssue')[0]) {
        
        var mySwiper = myApp.swiper('.swiper-container', {
            /*autoplay: {
                delay: 5000,
            },*/
            loop:true,
            pagination:'.swiper-pagination',
            speed: 2000,
            spaceBetween: 100
        }); 
        
        
        
    //}
    
    
    
});

var map;
var mapTab3;
var markerTab3 = [];

function initAutocomplete() {
    
    //location map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 3.220340, lng: 101.726957},
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    $$('<div />').addClass('centerMarker').appendTo(map.getDiv());

    google.maps.event.addListener(map,'center_changed', function() {
        //console.log(map.getCenter().lat() + ',' + map.getCenter().lng());
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {

        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);

    });
    
    
    //map tab3
    var mapOptionsTab3 = {
        zoom: 13,
        center: new google.maps.LatLng(3.1551771, 101.7113164),
        mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	mapTab3 = new google.maps.Map(document.getElementById('map_canvasTab3'), mapOptionsTab3);
    
    
    //out of bound overlay
    var outOfBoundCoords = [
        { lat: 3.337068421, lng: 101.6646222 }, 
        { lat: 3.285142754, lng: 101.6604198 }, 
        { lat: 3.274748176, lng: 101.5992979 }, 
        { lat: 3.235976176, lng: 101.6110558 }, 
        { lat: 3.214147517, lng: 101.6067042 }, 
        { lat: 3.199159053, lng: 101.6189596 }, 
        { lat: 3.178955397, lng: 101.6225182 }, 
        { lat: 3.176336583, lng: 101.6308747 }, 
        { lat: 3.161219334, lng: 101.6293231 }, 
        { lat: 3.149149695, lng: 101.6412134 }, 
        { lat: 3.130327547, lng: 101.6346850 }, 
        { lat: 3.116832199, lng: 101.6410392 }, 
        { lat: 3.068061042, lng: 101.6918229 }, 
        { lat: 3.070590727, lng: 101.7164828 }, 
        { lat: 3.073749768, lng: 101.7479227 }, 
        { lat: 3.102118253, lng: 101.7614153 }, 
        { lat: 3.101346318, lng: 101.7805567 }, 
        { lat: 3.127969963, lng: 101.7983696 }, 
        { lat: 3.146066234, lng: 101.8028915 }, 
        { lat: 3.154359886, lng: 101.8140814 }, 
        { lat: 3.190694711, lng: 101.8114218 }, 
        { lat: 3.224228119, lng: 101.8232514 }, 
        { lat: 3.280610360, lng: 101.8612667 }, 
        { lat: 3.362601513, lng: 101.7854309 }, 
        { lat: 3.402510792, lng: 101.7193457 }, 
        { lat: 3.337068421, lng: 101.6646222 }
    ];
    
    var outOfBoundPolygon = new google.maps.Polygon({
        paths: outOfBoundCoords, 
        strokeColor: '#FF8C1A',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF8C1A',
        fillOpacity: 0.05
    });
	outOfBoundPolygon.setMap(map);
    
}


function fnMarkLocation() {
    
    var thislng = map.getCenter().lng();
    var thislat = map.getCenter().lat();
    
    var outOfBoundCoords = [
        { lat: 3.337068421, lng: 101.6646222 }, 
        { lat: 3.285142754, lng: 101.6604198 }, 
        { lat: 3.274748176, lng: 101.5992979 }, 
        { lat: 3.235976176, lng: 101.6110558 }, 
        { lat: 3.214147517, lng: 101.6067042 }, 
        { lat: 3.199159053, lng: 101.6189596 }, 
        { lat: 3.178955397, lng: 101.6225182 }, 
        { lat: 3.176336583, lng: 101.6308747 }, 
        { lat: 3.161219334, lng: 101.6293231 }, 
        { lat: 3.149149695, lng: 101.6412134 }, 
        { lat: 3.130327547, lng: 101.6346850 }, 
        { lat: 3.116832199, lng: 101.6410392 }, 
        { lat: 3.068061042, lng: 101.6918229 }, 
        { lat: 3.070590727, lng: 101.7164828 }, 
        { lat: 3.073749768, lng: 101.7479227 }, 
        { lat: 3.102118253, lng: 101.7614153 }, 
        { lat: 3.101346318, lng: 101.7805567 }, 
        { lat: 3.127969963, lng: 101.7983696 }, 
        { lat: 3.146066234, lng: 101.8028915 }, 
        { lat: 3.154359886, lng: 101.8140814 }, 
        { lat: 3.190694711, lng: 101.8114218 }, 
        { lat: 3.224228119, lng: 101.8232514 }, 
        { lat: 3.280610360, lng: 101.8612667 }, 
        { lat: 3.362601513, lng: 101.7854309 }, 
        { lat: 3.402510792, lng: 101.7193457 }, 
        { lat: 3.337068421, lng: 101.6646222 }
    ];
    
    var outOfBoundPolygon = new google.maps.Polygon({paths: outOfBoundCoords});
    
    var thisLatLng = new google.maps.LatLng(thislat, thislng);
    
    var insideBound = google.maps.geometry.poly.containsLocation(
        thisLatLng, 
        outOfBoundPolygon
    );
    
    
    var storedLang = myApp.formGetData('formLang');
    var useArr = arrErrMsgEN;
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    if (!insideBound) {
        myApp.alert(useArr['OutOfBound'], 'ROL Citizen\'s Eye');
    } else {
        setLngLat(thislng, thislat);
        myApp.showTab('#view-1');
    }
    
}


$$(document).on('DOMNodeInserted', function() {
    $$('.pac-item, .pac-item span', this).addClass('no-fastclick');
}, '.pac-container');



document.getElementById('view-1').addEventListener('show', function() {
    if (window.localStorage.getItem("userid")==-1) {
        myApp.showTab('#view-7');
        //forced to use setTimeout because show event and addClass not yet finished
        window.setTimeout(function(){ 
            $$('#btnHome').removeClass('active'); 
        }, 10);
    }
}, false);

document.getElementById('view-5').addEventListener('show', function() { 
    
    //F7 & GOOGLE MAP BUG: gmap won't init until subview shows
    if (document.getElementById('gmapinit').value=='no') {
        initAutocomplete(); 
        document.getElementById('gmapinit').value = 'yes';
    }
    
}, false);

document.getElementById('view-2').addEventListener('show', function() {
    //document.getElementById('tab2iframe').src+='';
    fnListing();
}, false);

document.getElementById('view-3').addEventListener('show', function() {
    //document.getElementById('tab3iframe').src+='';
    fnCaseMap();
}, false);

document.getElementById('view-4').addEventListener('show', function() {
    //document.getElementById('tab4iframe').src+='';
    fnInfoPage();
}, false);


// profile->login page if no login
document.getElementById('view-6').addEventListener('show', function() {
    if (window.localStorage.getItem("userid")==-1) {
        myApp.showTab('#view-7');
        //forced to use setTimeout because show event and addClass not yet finished
        window.setTimeout(function(){ 
            $$('#btnProfile').removeClass('active'); 
        }, 10);
    } else {
        fnProfile();
    }
}, false);

// reg page
document.getElementById('view-8').addEventListener('show', function() {
    $$('#regSuc').text('');
    $$('#regErr').text('');
}, false);

// login page
document.getElementById('view-7').addEventListener('show', function() {
    $$('#loginErr').text('');
}, false);

// retrieve password page
document.getElementById('view-9').addEventListener('show', function() {
    $$('#retSuc').text('');
    $$('#retErr').text('');
}, false);


window.setTimeout(function(){ 
    if (window.localStorage.getItem("userid")==-1) {
        myApp.showTab('#view-7');
        //forced to use setTimeout because show event and addClass not yet finished
        window.setTimeout(function(){ 
            $$('#btnHome').removeClass('active'); 
        }, 10);
    }
}, 10);
window.setTimeout(function(){ 
    fnListing(); 
}, 1000);
window.setTimeout(function(){ 
    fnCaseMap(); 
}, 1500);
window.setTimeout(function(){ 
    fnInfoPage(); 
}, 2000);




/********************************************** cordova code starts ************************************************/

var pushNotification; 
var jlat = null;
var jlatts = null;
var jlng = null;
var jlngts = null;
var jphoto = null;
var newBlob = null;

function onAppReady() {
    
    if( navigator.splashscreen && navigator.splashscreen.hide ) {   // Cordova API detected
        navigator.splashscreen.hide() ;
    }
    
    /*
    //initialize empty pushwooshid
	if (window.localStorage.getItem("didAddPushUser")==null) {
        window.localStorage.setItem("didAddPushUser", "");
    }
    
    //initialize phantom userid
    if (window.localStorage.getItem("userid")==null) {
        window.localStorage.setItem("userid", "-1");
    }
    */
    
	document.addEventListener("resume", onResume, false);
	document.addEventListener("active", onResume, false);
    document.addEventListener("backbutton", onBackButton, false);
	
    
	if (window.MobileAccessibility) {
		window.MobileAccessibility.usePreferredTextZoom(false);		//to enforce fixed font size
	}
	
	
	//button events
	document.getElementById('btnCamera').addEventListener("click", fnCamera, false);
    document.getElementById('btnGallery').addEventListener("click", fnGallery, false);
    document.getElementById('btnSubmit').addEventListener("click", fnSubmit, false);
	
	
	//ga tracking
	/*lost ga since deprecated by google in nov 2019
	document.getElementById('view-1').addEventListener('show', function(){ window.analytics.trackView('/Home'); }, false);
	document.getElementById('view-2').addEventListener('show', function(){ window.analytics.trackView('/Reports'); }, false);
	document.getElementById('view-3').addEventListener('show', function(){ window.analytics.trackView('/Map'); }, false);
	document.getElementById('view-4').addEventListener('show', function(){ window.analytics.trackView('/Info'); }, false);
	document.getElementById('view-6').addEventListener('show', function(){ window.analytics.trackView('/Profile'); }, false);
	*/
	
	//test ok - binding and trigger
	//document.getElementById('view-7').addEventListener('show', function(){ alert(777); }, false);
	//document.getElementById('lllll').addEventListener("click", function() { myApp.showTab('#view-9'); }, false);
	
    
	initGeolocation();
	initPushwoosh();
	
	//google analytics
	//lost ga since deprecated by google in nov 2019
	//window.analytics.startTrackerWithId('UA-38816455-42');
	
    //alert('on app ready end');
    
    
    //document.getElementById("uploadFile").addEventListener("click", uploadFile);
    //document.getElementById("downloadFile").addEventListener("click", downloadFile);
    
	
}
document.addEventListener("deviceready", onAppReady, false) ;



/*
function downloadFile() {
   var fileTransfer = new FileTransfer();
   var uri = encodeURI("http://s14.postimg.org/i8qvaxyup/bitcoin1.jpg");
   var fileURL =  "///storage/emulated/0/DCIM/myFile";

   fileTransfer.download(
      uri, fileURL, function(entry) {
         //console.log("download complete: " + entry.toURL());
          alert("download complete: " + entry.toURL());
      },
		
      function(error) {
         //console.log("download error source " + error.source);
         //console.log("download error target " + error.target);
         //console.log("download error code" + error.code);
          alert("download error source " + error.source);
          alert("download error target " + error.target);
          alert("download error code" + error.code);
      },
		
      false, {
         headers: {
            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
         }
      }
   );
}

function uploadFile() {
   var fileURL = "///storage/emulated/0/DCIM/myFile"
   var uri = encodeURI("http://www.klriver.org/zzzpostlistener.cfm");
   var options = new FileUploadOptions();
   options.fileKey = "file";
   options.fileName = fileURL.substr(fileURL.lastIndexOf('/')+1);
   options.mimeType = "text/plain";
   options.chunkedMode = false;
   
   var headers = {'headerParam':'headerValue'};
   options.headers = headers;
   var ft = new FileTransfer();
   ft.upload(fileURL, uri, onSuccess, onError, options);

   function onSuccess(r) {
      //console.log("Code = " + r.responseCode);
      //console.log("Response = " + r.response);
      //console.log("Sent = " + r.bytesSent);
      alert("Code = " + r.responseCode);
      alert("Response = " + r.response);
      alert("Sent = " + r.bytesSent);
   }

   function onError(error) {
      alert("An error has occurred: Code = " + error.code);
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
   }
	
}
*/






function onResume() {
	
	//alert('on resume');
	
}


function onBackButton() {
	
	var currentTab = $$('.view.active')[0].id;
	
	switch (currentTab) {
		case 'view-5':
			myApp.showTab('#view-1');
			break;
		case 'view-8':
			myApp.showTab('#view-7');
			break;
        default: 
			navigator.app.exitApp();
	}
	
}


function initPushwoosh() {
	
	//alert('init pw');
	
	pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

	// Should be called before pushwoosh.onDeviceReady
	document.addEventListener('push-notification', function(event) {
        var notification = event.notification;
		// handle push open here
		myApp.alert(notification.message, 'Message from ROL Citizen\'s Eye');
		//alert(JSON.stringify(notification));
	});

	// Initialize Pushwoosh. This will trigger all pending push notifications on start.
	pushNotification.onDeviceReady({
		//appid: "07923-6F941", 
		//projectid: "313762854552"
		appid: "84837-A0D3E", 
		projectid: "625499343081"
	});
	
	pushNotification.registerDevice(
        function(status) {  //success
            
			var deviceToken = status.pushToken;
            window.localStorage.setItem("didAddPushUser", deviceToken);
			
			/*
			pushNotification.startLocationTracking();	//start tracking for geofencing
			*/
			
        },
        function(status) {  //failure
            
            //alert("reg failed");
			
			//if first init failed, prompt to restart app to restart pw init
			if (window.localStorage.getItem("didAddPushUser")==null) {
				alert("Failed to initialize notification. Please restart App. ");
			}
            
        }
    );
	
	pushNotification.clearNotificationCenter();
	pushNotification.setApplicationIconBadgeNumber(0);
	
}


function initGeolocation() {
	
	//init geolocation (no timeout)
	navigator.geolocation.getCurrentPosition(
		//onSuccess
		function(position) {
			jlat = position.coords.latitude;
			jlatts = new Date();
			jlng = position.coords.longitude;
			jlngts = new Date();
		}, 
		//onError
		function onError(error) {
			//probably timeout or GPS not on, do nothing
		}, 
		//parameters
		{
			enableHighAccuracy: true	//true=use satellite, false=use network
		}
	);
	
}

    
function openIAB(thisURL) {
    
    var ref = cordova.InAppBrowser.open(thisURL, '_system', 'location=yes');

}


function fnCamera() {
    
    navigator.camera.getPicture(
        onSuccess, 
        onFail, 
        {
            quality: 75,
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI,
			allowEdit : false,
			correctOrientation: true,
			saveToPhotoAlbum: false,
			targetWidth: 1920,
			targetHeight: 1080
        }
    );

    function onSuccess(result) {
        
		try {
		
			// convert JSON string to JSON Object
			var thisResult = JSON.parse(result);
			
			// convert json_metadata JSON string to JSON Object 
			var metadata = JSON.parse(thisResult.json_metadata);
			
			jphoto = encodeURI(thisResult.filename);
			var img = document.getElementById('myImage');
			img.src = jphoto;
			
			fnBlob();
		
        } catch(e) {
			alert('camera onsuccess ' + e);
		}
		
        
        //reset lng lat
        resetLngLat();
        $$('#btnLocateOnMap').removeAttr('disabled');
        
        
        //redirect to location picker
        myApp.showTab('#view-5');
        
        
        //todo: set current location? 
        if (jlat!=null && jlng!=null) {
            map.setCenter({
                lat: jlat, 
                lng: jlng
            });
        }

        if (thisResult.json_metadata != "{}") {
            if (device.platform == 'iOS') {

              // notice the difference in the properties below and the format of the result when you run the app.
              // iOS and Android return the exif and gps differently and I am not converting or accounting for the Lat/Lon reference.
              // This is simply the raw data being returned.

                //navigator.notification.alert('Lat: '+metadata.GPS.Latitude+' Lon: '+metadata.GPS.Longitude);
                
                var imgLat = null; 
                var imgLng = null; 
                try {
                    
                    imgLat = deg2dec(metadata.GPS.Latitude); 
                    imgLng = deg2dec(metadata.GPS.Longitude);
                    map.setCenter({
                        lat: imgLat, 
                        lng: imgLng
                    });
                    
                } catch(e) {
                    //alert('no lng lat');
                }
                
            } else {
                //navigator.notification.alert('Lat: '+metadata.gpsLatitude+' Lon: '+metadata.gpsLongitude);
                
                var imgLat = null; 
                var imgLng = null; 
                try {
                    
                    imgLat = deg2dec(metadata.gpsLatitude); 
                    imgLng = deg2dec(metadata.gpsLongitude);
                    map.setCenter({
                        lat: imgLat, 
                        lng: imgLng
                    });
                    
                } catch(e) {
                    //alert('no lng lat');
                }
                
            }

        }
    }

    function onFail(message) {
        //alert('Failed because: ' + message);
        myApp.alert('Failed because: ' + message, 'System Message');
        //probably cancelled
    }
    
}

function fnGallery() {
	
    navigator.camera.getPicture(
        onSuccess, 
        onFail, 
        {
            quality: 75,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.FILE_URI,
			allowEdit : false,
			correctOrientation: true,
			targetWidth: 1920,
			targetHeight: 1080
        }
    );

    function onSuccess(result) {
        
		try {
		
			// convert JSON string to JSON Object
			var thisResult = JSON.parse(result);
			
			//android allows multiple images to be chosen from gallery. returns array of json
			//ios doesn't allow. returns single json
			if (Array.isArray(thisResult)) {
				jphoto = encodeURI(thisResult[0].filename);	//Android: use only first image even if multiple images chosen
				// convert json_metadata JSON string to JSON Object 
				var metadata = JSON.parse(thisResult[0].json_metadata);
			} else {
				jphoto = encodeURI(thisResult.filename);
				// convert json_metadata JSON string to JSON Object 
				var metadata = JSON.parse(thisResult.json_metadata);
			}
			var img = document.getElementById('myImage');
			img.src = jphoto;
			
			fnBlob();
		
        } catch(e) {
			alert('gallery onsuccess ' + e);
		}
		
        
        //reset lng lat
        resetLngLat();
        $$('#btnLocateOnMap').removeAttr('disabled');
        
        //redirect to location picker
        myApp.showTab('#view-5');

        if (thisResult.json_metadata != "{}") {
            if (device.platform == 'iOS') {

              // notice the difference in the properties below and the format of the result when you run the app.
              // iOS and Android return the exif and gps differently and I am not converting or accounting for the Lat/Lon reference.
              // This is simply the raw data being returned.

                //navigator.notification.alert('Lat: '+metadata.GPS.Latitude+' Lon: '+metadata.GPS.Longitude);
                //alert('Lat: '+deg2dec(metadata.GPS.Latitude)+' Lon: '+deg2dec(metadata.GPS.Longitude));
                
                var imgLat = null; 
                var imgLng = null; 
                try {
                    
                    imgLat = deg2dec(metadata.GPS.Latitude); 
                    imgLng = deg2dec(metadata.GPS.Longitude);
                    map.setCenter({
                        lat: imgLat, 
                        lng: imgLng
                    });
                    
                } catch(e) {
                    //alert('no lng lat');
                }
                
            } else {
                //navigator.notification.alert('Lat: '+metadata.gpsLatitude+' Lon: '+metadata.gpsLongitude);
                //alert('Lat: '+deg2dec(metadata.gpsLatitude)+' Lon: '+deg2dec(metadata.gpsLongitude));
                
                var imgLat = null; 
                var imgLng = null; 
                try {
                    
                    imgLat = deg2dec(metadata.gpsLatitude); 
                    imgLng = deg2dec(metadata.gpsLongitude);
                    map.setCenter({
                        lat: imgLat, 
                        lng: imgLng
                    });
                    
                } catch(e) {
                    //alert('no lng lat');
                }
                
            }

        }
    }

    function onFail(message) {
        //alert('Failed because: ' + message);
        myApp.alert('Failed because: ' + message, 'System Message');
        //probably cancelled
    }
}


function fnBlob() {
	
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
			
		};
		
	} catch(e) {
		alert('error fnBlob ' + e);
	}
	
}


function deg2dec(str) {
    
    try {
        var arr = str.split(',');
        var deg = parseInt(arr[0]); 
        var min = parseInt(arr[1]); 
        var sec = parseInt(arr[2]); 
        var dec = deg/1.00 + min/60.00 + sec/3600.00;
        return dec;
    } catch(e) {
        return null;
    }
}


function setLngLat(lng, lat) {
    $$('#sLngLat').text(lng + ', ' + lat);
    $$('#fLng').val(lng);
    $$('#fLat').val(lat);
}

function resetLngLat() {
    $$('#sLngLat').text('(No Location)');
    $$('#fLng').val('');
    $$('#fLat').val('');
}

function resetForm() {
    
    //reset photo
    jphoto = null;
    document.getElementById('myImage').src="img/icon-camera.png";
    $$('#sLngLat').text('(No Location)');
    $$('#fLng').val('');
    $$('#fLat').val('');
    $$('#btnLocateOnMap').attr('disabled', 'disabled');
    
    switchType('Issue');
    
    document.getElementById('fIssue').options[0].selected = true;
    $$('#fIssueAfter').html('(none)');
    
    for (var i=0; i<document.getElementById('fSource').options.length; i++) {
        document.getElementById('fSource').options[i].selected = false;
    }
    
    for (var i=0; i<document.getElementById('fObservation').options.length; i++) {
        document.getElementById('fObservation').options[i].selected = false;
    }
    
    for (var i=0; i<document.getElementById('fConcerns').options.length; i++) {
        document.getElementById('fConcerns').options[i].selected = false;
    }
    
    $$('.smart-select .item-after2').html('');
    
    $$('#fComment').val('');
    
    $$('#btnSubmit').removeAttr('disabled');
    
}

function fnSubmit() {
    
    var storedLang = myApp.formGetData('formLang');
    var useArr = arrErrMsgEN;
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    if (formCheck()==true) {
        
        if (jphoto!=null) {
            
            //diable submit button to prevent double submit
            $$('#btnSubmit').attr('disabled', 'disabled');
            
            try {

                var fileURL = jphoto;
				var uri = encodeURI("http://www.klriver.org/MyROL_app_listener.cfm");
				var jFileName = new Date().getTime() + '.jpg';  //force filename to get around unicode and other illegal characters issue
				
				var formData = new FormData();
				formData.append('fphoto1', newBlob, jFileName);
				
				formData.append('fLng', 		$$('#fLng').val());
				formData.append('fLat', 		$$('#fLat').val());
				formData.append('fType', 		$$('#fType').val());
				formData.append('fIssue', 		$$('#fIssue').val());
				formData.append('fSource', 		JSON.stringify($$('#fSource').val()));
				formData.append('fObservation', JSON.stringify($$('#fObservation').val()));
				formData.append('fConcerns', 	JSON.stringify($$('#fConcerns').val()));
				formData.append('fComment', 	$$('#fComment').val());
				formData.append('fUserID', 		window.localStorage.getItem("userid"));
				
				var xhr = new XMLHttpRequest();
				
				xhr.upload.addEventListener('loadstart', onloadstartHandler, false);
				xhr.upload.addEventListener('progress', onprogressHandler, false);
				xhr.upload.addEventListener('load', onloadHandler, false);
				xhr.addEventListener('readystatechange', onreadystatechangeHandler, false);
				
				xhr.open('POST', uri);
			
				xhr.send(formData);
				
				
				// Handle the start of the transmission
				function onloadstartHandler(evt) {
					//var div = document.getElementById('upload-status');
					//div.innerHTML = 'Upload started.';
				}
				// Handle the end of the transmission
				function onloadHandler(evt) {
					//var div = document.getElementById('upload-status');
					//div.innerHTML += '<' + 'br>File uploaded. Waiting for response.';
				}
				// Handle the progress
				function onprogressHandler(evt) {
					//var div = document.getElementById('progress');
					//var percent = evt.loaded/evt.total*100;
					//div.innerHTML = 'Progress: ' + percent + '%';
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
					if (readyState == 4 && status == '200') {	//&& evt.target.responseText NO RESPONSE TEXT FROM SERVER
						//var status = document.getElementById('upload-status');
						//status.innerHTML += '<' + 'br>Success!';
						//var result = document.getElementById('result');
						//result.innerHTML = '<p>The server saw it as:</p><pre>' + evt.target.responseText + '</pre>';
						myApp.alert(useArr['SubmitSuccess'], 'ROL Citizen\'s Eye');
						resetForm();
					} else if (readyState == 4 && status != '200') {
						myApp.alert(useArr['SubmitFail'], 'ROL Citizen\'s Eye');
						$$('#btnSubmit').removeAttr('disabled');
					}
				}
				
            } catch(e) {
                $$('#btnSubmit').removeAttr('disabled');
                alert(e);
            }

        }
    }
}


function formCheck() {
    
    var storedLang = myApp.formGetData('formLang');
    
    var useArr = arrErrMsgEN;
    
    //alert(storedLang);
    //alert(storedLang.Lang);
    
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    if (jphoto==null) {
        myApp.alert(useArr['Photo'], 'ROL Citizen\'s Eye');
        return false;
    }
    
    if ($$('#fLng').val()=='') {
        myApp.alert(useArr['LngLat'], 'ROL Citizen\'s Eye');
        return false;
    }
    
    if ($$('#fType').val()=='Issue') {
        
        if ($$('#fIssue').val()=='') {
            myApp.alert(useArr['Issue'], 'ROL Citizen\'s Eye');
            return false;
        }
        
    }
    
    return true;
}



//register

function fnRegister() {
    
    //get error msg array
    var storedLang = myApp.formGetData('formLang');
    var useArr = arrErrMsgEN;
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    var chk = true;
    var email = $$('#fRegEmail').val();
    var password = $$('#fRegPassword').val();
    var password2 = $$('#fRegPassword2').val();
    
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    
    if (email=='') {
        myApp.alert(useArr['RegEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fRegEmail').focus();
        return false;
    } else if (regex.test(email)==false) {
        myApp.alert(useArr['RegEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fRegEmail').focus();
        return false;
    }
    
    if (password=='' || password.length<8) {
        myApp.alert(useArr['RegPassword'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fRegPassword').focus();
        return false;
    }
    
    if (password!=password2) {
        myApp.alert(useArr['RegPassword2'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fRegPassword2').focus();
        return false;
    }
    
    if (chk==true) {
        
        //do register: 1. query duplicate and server side validation 2. register
        $$.ajax({
            url: "http://www.klriver.org/MyROL_app_register_json.cfm",
            method: "POST",
            dataType: "json",
            data: {
                "fRegEmail": $$('#fRegEmail').val(), 
                "fRegPassword": $$('#fRegPassword').val()
            },
            success: function(obj, status, xhr) {

                if (obj.RegStatus=="Success") {

                    //clear form field
                    $$('#fRegEmail').val('');
                    $$('#fRegPassword').val('');
                    $$('#fRegPassword2').val('');
                    $$('#regSuc').text(useArr['RegSuc']);
                    $$('#regErr').text('');

                } else if (obj.RegStatus=="Duplicate") {

                    $$('#regSuc').text('');
                    $$('#regErr').text(useArr['RegEmailErr']);
                    
                } else {

                    $$('#regSuc').text('');
                    $$('#regErr').text(useArr['RegErr']);
                    
                }

            }, 
            error: function(xhr, status) {

                $$('#regSuc').text('');
                $$('#regErr').text(useArr['RegConnectionErr']);

            }
        });
        
    }
    
}


//login
function fnLogin() {
	
    //get error msg array
    var storedLang = myApp.formGetData('formLang');
    var useArr = arrErrMsgEN;
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    var uuid = window.localStorage.getItem('didAddPushUser');
	
	var chk = true;
    var email = $$('#fLoginEmail').val();
    var password = $$('#fLoginPassword').val();
    
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    
    if (email=='') {
        myApp.alert(useArr['LoginEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fLoginEmail').focus();
        return false;
    } else if (regex.test(email)==false) {
        myApp.alert(useArr['LoginEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fLoginEmail').focus();
        return false;
    }
    
    if (password=='' || password.length<8) {
        myApp.alert(useArr['LoginPassword'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#fLoginPassword').focus();
        return false;
    }
    
    if (chk==true) {
        
        //do login
        $$.ajax({
            url: "http://www.klriver.org/MyROL_app_login_json.cfm",
            method: "POST",
            dataType: "json",
            data: {
                "fLoginEmail": $$('#fLoginEmail').val(), 
                "fLoginPassword": $$('#fLoginPassword').val()
            },
            success: function(obj, status, xhr) {

                if (obj.LoginStatus=="Success") {
                    
                    //clear form field
                    $$('#fLoginEmail').val('');
                    $$('#fLoginPassword').val('');
                    $$('#loginSuc').text('');
                    $$('#loginErr').text('');
                    window.localStorage.setItem("userid", obj.MyROLID);
                    window.localStorage.setItem("userEmail", obj.Email);
                    
                    document.getElementById('lbl_loginEmail').innerHTML = window.localStorage.getItem("userEmail");
                    myApp.showTab('#view-6');
                    

                } else if (obj.LoginStatus=="Failed") {

                    $$('#loginSuc').text('');
                    $$('#loginErr').text(useArr['LoginInvalid']);
                    
                } else {

                    $$('#loginSuc').text('');
                    $$('#loginErr').text(useArr['LoginErr']);
                    
                }

            }, 
            error: function(xhr, status) {

                $$('#loginSuc').text('');
                $$('#loginErr').text(useArr['LoginConnectionErr']);

            }
        });
        
    }
    
}



function fnLogout() {
	window.localStorage.setItem('userid', '-1');
	myApp.showTab('#view-1');
}


//retrieve password
function fnRetrievePassword() {
    
    //get error msg array
    var storedLang = myApp.formGetData('formLang');
    var useArr = arrErrMsgEN;
    if (storedLang) {
        useArr = eval('arrErrMsg'+storedLang.Lang);
    }
    
    var chk = true;
    var email = $$('#fRetPwdEmail').val();
    
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    
    if (email=='') {
        myApp.alert(useArr['RetPwdEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#RetPwdEmail').focus();
        return false;
    } else if (regex.test(email)==false) {
        myApp.alert(useArr['RetPwdEmail'], 'ROL Citizen\'s Eye');
        chk = false;
        $$('#RetPwdEmail').focus();
        return false;
    }
    
    if (chk==true) {
        
        //do retrieve
        $$.ajax({
            url: "http://www.klriver.org/MyROL_app_retrieve_password_json.cfm",
            method: "POST",
            dataType: "json",
            data: {
                "fRetPwdEmail": $$('#fRetPwdEmail').val()
            },
            success: function(obj, status, xhr) {

                if (obj.RetStatus=="Success") {

                    //clear form field
                    $$('#fRetPwdEmail').val('');
                    $$('#retSuc').text(useArr['RetSuc']);
                    $$('#retErr').text('');

                } else if (obj.RetStatus=="Invalid") {

                    $$('#retSuc').text('');
                    $$('#retErr').text(useArr['RetInvalid']);
                    
                } else {

                    $$('#retSuc').text('');
                    $$('#retErr').text(useArr['RetErr']);
                    
                }

            }, 
            error: function(xhr, status) {

                $$('#retSuc').text('');
                $$('#retErr').text(useArr['RetConnectionErr']);

            }
        });
        
    }
    
}


//list top N myrol entries
function fnListing() {
    
    var uid = window.localStorage.getItem('userid');
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://www.klriver.org/MyROL_app_listing_JSON.cfm?fUserID="+uid);
    xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {

                var data = this.responseText;
                
                if (data!='[]') {
                    
                    var strHTML = ''; 
                    
                    var jMyROLID; 
                    var jfUserID; 
                    var jReportType; 
                    var jCoordinatesGMap; 
                    var jImageFile; 
                    var jComment; 
                    var jStatus; 
                    var jDateCreatedPart1; 
                    var jDateCreatedPart2; 
                    var jDateCreatedPart3; 
                    var jDateCreatedPart4; 
                    var jIssue; 
                    var jSource; 
                    var jObservation; 
                    var jConcern; 
                    var jStatus; 
                    
                    var jsonData = JSON.parse(data);
                    
                    for (var i=0; i<jsonData.length; i++) {
                        
                        jMyROLID = jsonData[i]['MyROLID']; 
                        jfUserID = jsonData[i]['fUserID']; 
                        jReportType = jsonData[i]['ReportType']; 
                        jCoordinatesGMap = jsonData[i]['CoordinatesGMap']; 
                        jImageFile = jsonData[i]['ImageFile']; 
                        jComment = '' + jsonData[i]['Comment']; 
                        jStatus = jsonData[i]['Status']; 
                        jDateCreatedPart1 = jsonData[i]['DateCreatedPart1']; 
                        jDateCreatedPart2 = jsonData[i]['DateCreatedPart2']; 
                        jDateCreatedPart3 = jsonData[i]['DateCreatedPart3']; 
                        jDateCreatedPart4 = jsonData[i]['DateCreatedPart4']; 
                        jIssue = jsonData[i]['Issue']; 
                        jSource = jsonData[i]['Source']; 
                        jObservation = jsonData[i]['Observation']; 
                        jConcern = jsonData[i]['Concern']; 
                        jStatus = jsonData[i]['Status']; 
                        
                        strHTML += '<div class="row" style="line-height:1.6;">'; 
                        
                        strHTML += '<div class="leftCol"><img class="thumb" src="'+jImageFile+'" /></div>';
                        strHTML += '<div class="rightCol">';
                          strHTML += '<div class="rightColContainer">';
                            strHTML += '<div class="caseTitle">';
                            if (jReportType=='BestPractice') {
                                strHTML += '<img src="img/icon-thumbsup-green.svg" style="vertical-align:text-bottom;" />';
                            }
                            strHTML += '<span class="val_ReportType_'+jReportType+'"></span>';
                            if (jStatus=='Pending') {
                                strHTML += '<br /><span class="val_Unmoderated">UNMODERATED</span>';
                            }
                            strHTML += '</div>';
                            strHTML += '<div class="caseDate">'+jDateCreatedPart1+' ';
                            strHTML += '<span class="val_Date_'+jDateCreatedPart2+'"></span>, ';
                            strHTML += jDateCreatedPart3;
                            strHTML += '<span class="val_Date_'+jDateCreatedPart4+'"></span>';
                            strHTML += '</div>';
                            
                            strHTML += '<div style="display: table;">';
                              if (jIssue.length) {
                                strHTML += '<div style="display: table-row;">';
                                  strHTML += '<div style="display: table-cell;" class="caseTableLeft"><img src="img/icon-issue.svg" style="vertical-align:middle; margin-bottom:1px;" /></div>';
                                  strHTML += '<div style="display: table-cell;" class="caseTableRight">';
                                  for (var x=0; x<jIssue.length; x++) {
                                    strHTML += '<span class="val_Issue_'+jIssue[x]+'"></span>';
                                    if (x<jIssue.length-1) { strHTML += ', '; }
                                  }
                                  strHTML += '</div>';
                                strHTML += '</div>';
                              }
                              if (jSource.length) {
                                strHTML += '<div style="display: table-row;">';
                                  strHTML += '<div style="display: table-cell;" class="caseTableLeft"><img src="img/icon-source.svg" style="vertical-align:middle; margin-bottom:1px;" /></div>';
                                  strHTML += '<div style="display: table-cell;" class="caseTableRight">';
                                  for (var x=0; x<jSource.length; x++) {
                                    strHTML += '<span class="val_Source_'+jSource[x]+'"></span>';
                                    if (x<jSource.length-1) { strHTML += ', '; }
                                  }
                                  strHTML += '</div>';
                                strHTML += '</div>';
                              }
                              if (jObservation.length) {
                                strHTML += '<div style="display: table-row;">';
                                  strHTML += '<div style="display: table-cell;" class="caseTableLeft"><img src="img/icon-observation.svg" style="vertical-align:middle; margin-bottom:1px;" /></div>';
                                  strHTML += '<div style="display: table-cell;" class="caseTableRight">';
                                  for (var x=0; x<jObservation.length; x++) {
                                    strHTML += '<span class="val_Observation_'+jObservation[x]+'"></span>';
                                    if (x<jObservation.length-1) { strHTML += ', '; }
                                  }
                                  strHTML += '</div>';
                                strHTML += '</div>';
                              }
                              if (jConcern.length) {
                                strHTML += '<div style="display: table-row;">';
                                  strHTML += '<div style="display: table-cell;" class="caseTableLeft"><img src="img/icon-concern.svg" style="vertical-align:middle; margin-bottom:1px;" /></div>';
                                  strHTML += '<div style="display: table-cell;" class="caseTableRight">';
                                  for (var x=0; x<jConcern.length; x++) {
                                    strHTML += '<span class="val_Concern_'+jConcern[x]+'"></span>';
                                    if (x<jConcern.length-1) { strHTML += ', '; }
                                  }
                                  strHTML += '</div>';
                                strHTML += '</div>';
                              }
                              if (jComment.trim()!='') {
                                strHTML += '<div style="display: table-row;">';
                                  strHTML += '<div style="display: table-cell;" class="caseTableLeft"><img src="img/icon-comment.svg" style="vertical-align:middle; margin-bottom:1px;" /></div>';
                                  strHTML += '<div style="display: table-cell;" class="caseTableRight">'+jComment.trim()+'</div>';
                                strHTML += '</div>';
                              }
                              
                              strHTML += '<div style="display: table-row;">';
                                strHTML += '<div style="display: table-cell;" class="caseTableLeft"></div>';
                                strHTML += '<div style="display: table-cell;" class="caseTableRight"><div class="caseLink">&laquo; <a href="javascript:void(0);" onclick="openIAB(\'http://www.klriver.org/index.cfm?menuid=6&rid='+jMyROLID+'\');"><span class="val_View_Details">View Details</span></a> &raquo;</div></div>';
                              strHTML += '</div>';
                              
                            strHTML += '</div>';
                            
                          strHTML += '</div>';
                        strHTML += '</div>';
                        
                        strHTML += '</div>'; //close row
                        
                    }
                    
                    document.getElementById('caseListing').innerHTML = strHTML;
                    
                    var storedLang = myApp.formGetData('formLang');
                    if (storedLang) {
                        switchLang(storedLang.Lang);
                    } else {
                        switchLang('EN');
                    }
                    
                }
                else {
                    
                    var strHTML = ''; 
                    document.getElementById('caseListing').innerHTML = strHTML;
                    
                }
                
        } else if (this.readyState==4 && this.status>=400) {
            
            //4xx (Request error) 403
            //5xx (Server error) 503
            document.getElementById('caseListing').innerHTML = '<div style="min-height:400px; padding:8px;"><em>Request Error: Please Click the Reload Button</em></div>';
            
        }
        
    };

    xmlhttp.send();
    
}


function fnCaseMap() {
    
    var uid = window.localStorage.getItem('userid');
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://www.klriver.org/MyROL_app_map_JSON.cfm?fUserID="+uid);
    xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {

            var data = this.responseText;
            
            if (markerTab3.length>0) {
                for (var z=0; z<markerTab3.length; z++) {
                    try { markerTab3[z].setMap(null); } catch(e) {  }
                }
                markerTab3 = [];
            }
            
            if (data!='[]') {
                
                var boundsTab3 = new google.maps.LatLngBounds();
                
                var jsonData = JSON.parse(data);
                
                var jMyROLID; 
                var jReportType; 
                var jMarkerlat; 
                var jMarkerlng; 
                
                for (var i=0; i<jsonData.length; i++) {
                    
                    jMyROLID = jsonData[i]['MyROLID']; 
                    jReportType = jsonData[i]['ReportType']; 
                    jMarkerlat = jsonData[i]['lat']; 
                    jMarkerlng = jsonData[i]['lng']; 
                    
                    //only if both lat and lng are numeric
                    if (!isNaN(jMarkerlat) && !isNaN(jMarkerlng)) {
                        markerTab3[jMyROLID] = new google.maps.Marker({
                            position: { lat: jMarkerlat, lng: jMarkerlng },
                            map: mapTab3,
                            title: jReportType
                        });
                        boundsTab3.extend(markerTab3[jMyROLID].position);
                    }
                    
                }
                
                if (markerTab3.length>0) {
                    mapTab3.fitBounds(boundsTab3);
                }
                
            }
            
        } else if (this.readyState==4 && this.status>=400) {
            
            //4xx (Request error) 403
            //5xx (Server error) 503
            //document.getElementById('caseMap').innerHTML = '<div style="min-height:400px; padding:8px;"><em>Request Error: Please Click the Reload Button</em></div>';
            
        }
    };
    
    xmlhttp.send();
    
}


function fnInfoPage() {
    
    //get language preference
    var menuid = aboutPageID['EN'];
    var prefPageLang = 'aboutPageEN';
    
    var storedLang = myApp.formGetData('formLang');
    if (storedLang) {
        menuid = aboutPageID[storedLang.Lang];
        prefPageLang = 'aboutPage'+storedLang.Lang;
    }
    
    //default read from storage
    document.getElementById('infoPage').innerHTML = window.localStorage.getItem(prefPageLang);
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://www.klriver.org/MyROL_app_longdescription.cfm?menuid="+menuid);
    xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {

            var data = this.responseText;
            
            if (data!='') {
                document.getElementById('infoPage').innerHTML = data;
                window.localStorage.setItem(prefPageLang, data);
            }
            
        } else if (this.readyState==4 && this.status>=400) {
            
            //4xx (Request error) 403
            //5xx (Server error) 503
            //document.getElementById('caseMap').innerHTML = '<div style="min-height:400px; padding:8px;"><em>Request Error: Please Click the Reload Button</em></div>';
            
        }
    };
    
    xmlhttp.send();
    
}

function fnProfile() {
    
    document.getElementById('lbl_loginEmail').innerHTML = window.localStorage.getItem("userEmail");
    
}





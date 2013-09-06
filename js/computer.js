if (!("requestAnimationFrame" in window)) {
	window.requestAnimationFrame = 
			window.msRequestAnimationFrame        ||
			window.webkitRequestAnimationFrame    ||
			window.oRequestAnimationFrame         ||
			window.mozCancelRequestAnimationFrame ;
}

var video;
var display;
var work;

var displayContext;
var workContext;

var videoWidth;
var videoHeight;

function onSuccess(stream){

	//var url = webkitURL.createObjectURL(stream);
    //document.getElementById("video").src = stream;//url;
    video.src =window.URL.createObjectURL(stream);
    video.play();

}

function onError(err){
	console.log(err);
}

window.requestAnimationFrame = (function() {
    //Check for each browser
    //@paul_irish function
    //Globalises this function to work on any browser as each browser has a different namespace for this
    return window.requestAnimationFrame || //Chromium 
    window.webkitRequestAnimationFrame || //Webkit
    window.mozRequestAnimationFrame || //Mozilla Geko
    window.oRequestAnimationFrame || //Opera Presto
    window.msRequestAnimationFrame || //IE Trident?


    function(callback, element) { //Fallback function
        window.setTimeout(callback, 1000 / 60);
    }

})();
function draw() {

	workContext.drawImage(video, 0, 0);

	var imageData = workContext.getImageData(0, 0, videoWidth, videoHeight);

	var grayscale = ccv.grayscale(work);

	var start = new Date();
	var result = ccv.detect(
		{
			"canvas"        : grayscale,
			"cascade"       : cascade,
			"interval"      : 5,
			"min_neighbors" : 1
		}
	);
	var end = new Date();

	document.getElementById("speed").textContent = ((end.getTime() - start.getTime()) / 1000) + "s";

	displayContext.putImageData(imageData,0,0);
	displayContext.strokeStyle = "red";
	for(var i = 0, l = result.length; i < l; i++) {
		displayContext.strokeRect(
			result[i].x,
			result[i].y,
			result[i].width,
			result[i].height
		);
	}

	requestAnimationFrame(draw);

}

function initialize() {

	work             = document.createElement("canvas");
	workContext      = work.getContext("2d");

	video            = document.getElementById("video");
	display          = document.getElementById("display");
	displayContext   = display.getContext("2d");

	video.addEventListener(
		"playing",
		function(e){
			var style       = window.getComputedStyle(video, null);
			videoWidth      = parseInt(style.width, 10);
			videoHeight     = parseInt(style.height, 10);
			display.width   = videoWidth;
			display.height  = videoHeight;
			work.width      = videoWidth;
			work.height     = videoHeight;
			draw();
		},
		false
	);

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if(navigator.getUserMedia) {
	    var constraints = {video: true};
	    navigator.getUserMedia(constraints, onSuccess, onError);
	    /*
		navigator.getUserMedia(
		{audio : true, video : true, toString : function(){return "video,audio";}},
		onSuccess,
		onError
		);
	    */
	} else {
		document.getElementById("errormsg").innerHTML = "Native web camera streaming is not supported in this browser! Try one of these: <a href='http://snapshot.opera.com/labs/camera/'>Opera 12</a> or <a href='http://tools.google.com/dlpage/chromesxs'>Chrome Canary</a> (with MediaStream enabled) ";
}

}

window.addEventListener("load", initialize, false);

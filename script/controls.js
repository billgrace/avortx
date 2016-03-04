/* controls.js
 *
 * @author billgrace / http://billgrace.com
 *
 */

/*
 * general purpose, responsive controls.
 *
 * 2/2/16 - normalize controls:
 *		calling parameters are grouped into a single object so they're clearly named at the calling statement, have specific defaults and may be freelyi specified or omitted
 *		all current position variables range from 0.0 to 1.0
 *		the vertical coordinates of pixels being 0 at the top of the screen is kept to as low a level as possible so that 'Y' axis values grow from the bottom up
 */

function textBox( parameters ) {
	// textBox places a rectangle into a named HTML element.
	// Text can be placed into the rectangle's "innerHTML".
	// The color of the text and the background can be set.
	// A border width and color can be set.

	var inst = this;
	// make a variable to allow the text box to become dormant
	this.dormant = true;

	// sort the arguments
	parameters = parameters || {};
	this.startingText = (parameters.startingText != undefined)?parameters.startingText:'textbox';
	this.leftPercent = (parameters.leftPercent != undefined)?parameters.leftPercent:0.1;
	this.topPercent = (parameters.topPercent != undefined)?parameters.topPercent:0.1;
	this.widthPercent = (parameters.widthPercent != undefined)?parameters.widthPercent:0.1;
	this.heightPercent = (parameters.heightPercent != undefined)?parameters.heightPercent:0.1;
	this.textcolor = (parameters.textcolor != undefined)?parameters.textcolor:'black';
	this.textsize = (parameters.textsize != undefined)?parameters.textsize:2;
	this.backgroundcolor = (parameters.backgroundcolor != undefined)?parameters.backgroundcolor:'lightgray';
	this.borderwidth = (parameters.borderwidth != undefined)?parameters.borderwidth:5;
	this.bordercolor = (parameters.bordercolor != undefined)?parameters.bordercolor:'gray';
	// create the text box's positioning element
	this.visible = document.createElement( "div" );
	this.visible.style.cssText = "position:absolute;text-align:center;overflow:hidden;font-size:" + this.textsize + "vmin;border-style:solid";
	this.visible.style.color = this.textcolor;
	this.visible.style.backgroundColor = this.backgroundcolor;
	this.visible.style.borderWidth = "0" + this.borderwidth + "px";
	this.visible.style.borderColor = this.bordercolor;
	this.visible.innerHTML = this.startingText;
	document.body.appendChild( this.visible );

	// a routine to figure the geometry of this text box
	this.resize = function( leftPercent, topPercent, widthPercent, heightPercent ) {
		// readjust the text box geometry
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		inst.visible.style.left = "0" + ( ( leftPercent * windowWidth ) | 0 ) + "px";
		inst.visible.style.top = "0" + ( ( topPercent * windowHeight ) | 0 ) + "px";
		inst.visible.style.width = "0" + ( ( widthPercent * windowWidth ) | 0 ) + "px";
		inst.visible.style.height = "0" + ( ( heightPercent * windowHeight ) | 0 ) + "px";
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.resize( inst.leftPercent, inst.topPercent, inst.widthPercent, inst.heightPercent );
	}

	// a routine to update the text in the text box
	this.updateText = function( newText ) {
		if( inst.dormant ) return;
		inst.visible.innerHTML = newText;
	}

	// a routine to make the text box visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.visible.style.display = "block";
		inst.windowResizeHandler();
	}
	// a routine to make the text box invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.visible.style.display = "none";
	}

	// at time of instantiation/creation, be dormant until activation is invoked
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );
};

function imageLabel ( parameters ) {
	// imageLabel places an image file into a named HTML element.
	// The image is placed at a location and size/shape determined by percentage proportions of the dimensions of the browser window.
	// When the window is resized, the image will distort as needed to retain the proportions.
	// make a persistent variable of this instance for later reference during event handling
	var inst = this;
	// make a variable allowing the label to become dormant
	this.dormant = true;

	// sort the arguments
	parameters = parameters || {};
	this.imageFileName = (parameters.imageFileName != undefined)?parameters.imageFileName:'image/controls/defaultImageLabelImage.jpg';
	this.leftPercent = (parameters.leftPercent != undefined)?parameters.leftPercent:0.1;
	this.topPercent = (parameters.topPercent != undefined)?parameters.topPercent:0.1;
	this.widthPercent = (parameters.widthPercent != undefined)?parameters.widthPercent:0.1;
	this.heightPercent = (parameters.heightPercent != undefined)?parameters.heightPercent:0.1;
	// create the label's positioning element
	this.visible = document.createElement( "div" );
	this.visible.style.cssText = "position:absolute";
	document.body.appendChild( this.visible );
	// create the image element
	this.image = document.createElement( "img" );
	this.visible.appendChild( this.image );
	this.image.src = this.imageFileName;

	// figure the geometry of this label
	this.resize = function( leftPercent, topPercent, widthPercent, heightPercent ) {
		// readjust the label's geometry
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		inst.image.style.left = inst.visible.style.left = "0" + ( ( inst.leftPercent * windowWidth ) | 0 ) + "px";
		inst.image.style.top = inst.visible.style.top = "0" + ( ( inst.topPercent * windowHeight ) | 0 ) + "px";
		inst.image.style.width = inst.visible.style.width = "0" + ( ( inst.widthPercent * windowWidth ) | 0 ) + "px";
		inst.image.style.height = inst.visible.style.height = "0" + ( ( inst.heightPercent * windowHeight ) | 0 ) + "px";
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.resize( inst.leftPercent, inst.topPercent, inst.widthPercent, inst.heightPercent );
	}

	// a routine to make the label visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.visible.style.display = "block";
		inst.windowResizeHandler();
	}
	// a routine to make the label invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.visible.style.display = "none";
	}

	// at time of instantiation/creation, be dormant until activation is invoked
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );
};

function horizontalSlider( parameters ) {
	// horizontalSlider creates a left-right slide control within a named HTML element.
	// The control is meant to visually resemble a slider-type level control on a typical sound board in appearance and use.
	// The control's track location and size are determined by percentage proportions of the browser window.
	// The control's sliding "knob" is rendered from a graphic image file. The height of the slider is determined by a percentage of the
	//   height of the browser window and the width of the slider is determined by maintaining the original aspect ratio of the graphic image.

	// make a persistent variable of this instance for later reference during event handling
	var inst = this;
	// make a variable allowing the label to become dormant
	this.dormant = true;

	// sort the arguments
	parameters = parameters || {};
	this.sliderImageFileName = (parameters.sliderImageFileName != undefined)?parameters.sliderImageFileName:'image/controls/defaultSliderImage.png';
	this.leftLimitPercent = (parameters.leftLimitPercent != undefined)?parameters.leftLimitPercent:0.1;
	this.verticalCenterPercent = (parameters.verticalCenterPercent != undefined)?parameters.verticalCenterPercent:0.1;
	this.limitToLimitPercent = (parameters.limitToLimitPercent != undefined)?parameters.limitToLimitPercent:0.4;
	this.sliderHeightPercent = (parameters.sliderHeightPercent != undefined)?parameters.sliderHeightPercent:0.1;
	this.trackHeightPercent = (parameters.trackHeightPercent != undefined)?parameters.trackHeightPercent:0.03;
	this.trackColor = (parameters.trackColor != undefined)?parameters.trackColor:'brown';
	this.leftLimitValue = (parameters.leftLimitValue != undefined)?parameters.leftLimitValue:0;
	this.rightLimitValue = (parameters.rightLimitValue != undefined)?parameters.rightLimitValue:100;
	this.currentValue = (parameters.startingValue != undefined)?parameters.currentValue:50;
	this.hostElementId = (parameters.hostElementId != undefined)?parameters.hostElementId:'document';
	// establish some other handy values
	this.homeValue = this.currentValue;
	this.valueRange = this.rightLimitValue - this.leftLimitValue;
	this.leftLimitPixel = 0;
	this.rightLimitPixel = 0;
	this.motionPixelRange = 0;
	this.nowTracking = false;
	// create the control's visible elements
	this.track = document.createElement( "div" );
	this.track.style.cssText = "position:absolute;background-color:" + this.trackColor;
	document.body.appendChild( this.track );
	this.slider = document.createElement( "div" );
	this.slider.style.cssText = "position:absolute";
	document.body.appendChild( this.slider );
	this.imageElement = new Image();
	this.imageElement.onload = function() { inst.windowResizeHandler(); };
	this.imageElement.src = this.sliderImageFileName;
	this.slider.appendChild( this.imageElement );

	// a routine to figure the geometry of this control
	this.resize = function( leftLimitPercent, verticalCenterPercent, limitToLimitPercent, trackHeightPercent, hostElementId ) {
		if( inst.hostElementId == 'document' ) {
			var windowLeft = 0;
			var windowTop = 0;
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
		} else {
			var hostElement = document.getElementById( inst.hostElementId );
			var windowLeft = hostElement.offsetLeft;
			var windowTop = hostElement.offsetTop;
			var windowWidth = hostElement.offsetWidth;
			var windowHeight = hostElement.offsetHeight;
		}
		// calculate the control's pixel geometry according to the specified proportions
		var trackLeft = ( windowLeft + ( ( inst.leftLimitPercent - ( inst.trackHeightPercent / 2 ) ) * windowWidth ) ) | 0;
		var trackTop = ( windowTop + ( ( inst.verticalCenterPercent - ( inst.trackHeightPercent / 2 ) ) * windowHeight ) ) | 0;
		var trackWidth = ( ( inst.limitToLimitPercent + inst.trackHeightPercent ) * windowWidth ) | 0;
		var trackHeight = ( inst.trackHeightPercent * windowHeight ) | 0;
		// calculate the slider image's natural aspect ratio
		var imageAspectRatio = inst.imageElement.naturalWidth / inst.imageElement.naturalHeight;
		// calculate the pixel positions of the end points of the slider's motion
		inst.leftLimitPixel = ( trackLeft + trackHeight / 2 ) | 0;
		inst.rightLimitPixel = (trackLeft + trackWidth - trackHeight / 2 ) | 0;
		// calculate the slider range in terms of equivalent pixels
		inst.motionPixelRange = inst.rightLimitPixel - inst.leftLimitPixel;
		// calculate the proportional height of the slider image and the necessary width to retain the image's aspect ratio
		var sliderHeight = ( inst.sliderHeightPercent * windowHeight ) | 0;
		var sliderWidth = ( sliderHeight * imageAspectRatio ) | 0;
		// calculate the pixel location of the slider image according to present value
		var sliderLeft = ( inst.leftLimitPixel + ( inst.motionPixelRange * ( inst.currentValue / ( inst.rightLimitValue - inst.leftLimitValue ) ) ) - ( sliderWidth / 2 ) ) | 0;
		var sliderTop = ( ( inst.verticalCenterPercent - ( inst.sliderHeightPercent / 2 ) ) * windowHeight ) | 0;
		// set the calculated geometry into the control's elements
		inst.track.style.left = "0" + trackLeft + "px";
		inst.track.style.top = "0" + trackTop + "px";
		inst.track.style.width = "0" + trackWidth + "px";
		inst.track.style.height = "0" + trackHeight + "px";
		inst.track.style.borderRadius = "0" + ( ( trackHeight / 2 ) | 0 ) + "px";
		inst.imageElement.style.left = inst.slider.style.left = "0" + sliderLeft + "px";
		inst.imageElement.style.top = inst.slider.style.top = "0" + sliderTop + "px";
		inst.imageElement.style.width = inst.slider.style.width = "0" + sliderWidth + "px";
		inst.imageElement.style.height = inst.slider.style.height = "0" + sliderHeight + "px";
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.resize( inst.leftLimitPercent, inst.verticalCenterPercent, inst.limitToLimitPercent, inst.trackHeightPercent, inst.hostElementId );
	}

	// a routine to make the control visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.track.style.display = "block";
		inst.slider.style.display = "block";
		inst.windowResizeHandler();
	}
	// a routine to make the control invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.track.style.display = "none";
		inst.slider.style.display = "none";
	}

	this.disableOrbitControls = function() {
		orbitControls.enabled = false;
	}

	this.enableOrbitControls = function() {
		orbitControls.enabled = true;
	}

	// a routine to programatically set the slider to a given position
	this.setSlider = function( givenValue ) {
		inst.currentValue = givenValue;
		inst.windowResizeHandler();
	}

	// a routine to convert click/touch screen geometry into the equivalent slider value
	this.updateControlValue = function( pixelX ) {
		if( pixelX < inst.leftLimitPixel ) pixelX = inst.leftLimitPixel;
		if( pixelX > inst.rightLimitPixel ) pixelX = inst.rightLimitPixel;
		inst.currentValue = inst.leftLimitValue + inst.valueRange * ( pixelX - inst.leftLimitPixel ) / inst.motionPixelRange;
		inst.windowResizeHandler();
	}

	// handlers for mouse and touch events
	this.mouseDownEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		orbitControls.enabled = false;
		// a click on the slider "grabs" the slider...
		inst.nowTracking = true;
		// and sets the slider's horizontal position to that of the point clicked
		inst.updateControlValue( e.clientX );
	}
	this.mouseMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		if( !inst.nowTracking ) return;
		// dragging with the mouse varies the slider's horizontal position
		inst.updateControlValue( e.clientX );
	}
	this.mouseUpEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		// releasing the mouse button stops any further moving of the slider
		inst.nowTracking = false;
	}
	this.touchStartEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		orbitControls.enabled = false;
		// touching the slider "grabs" it...
		inst.nowTracking = true;
		// and sets the slider's horizontal position to that of the point touched
		inst.updateControlValue( e.touches[ 0 ].clientX );
	}
	this.touchMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		if( !inst.nowTracking ) return;
		// dragging the slider varies its horizontal position
		inst.updateControlValue( e.touches[ 0 ].clientX );
	}
	this.touchEndEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		// lifting the touch finger stops any further moving of the slider
		inst.nowTracking = false;
	}

	// at time of instantiation/creation, be dormant until activation is invoked
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );
	// add event listeners to invoke the mouse/touch handlers
	this.track.addEventListener( "mousedown", this.mouseDownEventHandler, false );
	this.slider.addEventListener( "mousedown", this.mouseDownEventHandler, false );
	this.track.addEventListener( "mousemove", this.mouseMoveEventHandler, false );
	this.slider.addEventListener( "mousemove", this.mouseMoveEventHandler, false );
	window.addEventListener( "mouseup", this.mouseUpEventHandler, false );
	this.track.addEventListener( "touchstart", this.touchStartEventHandler, false );
	this.slider.addEventListener( "touchstart", this.touchStartEventHandler, false );
	this.track.addEventListener( "touchmove", this.touchMoveEventHandler, false );
	this.slider.addEventListener( "touchmove", this.touchMoveEventHandler, false );
	this.slider.addEventListener( 'mouseover', function() { inst.disableOrbitControls() }, false );
	this.slider.addEventListener( 'mouseout', function() { inst.enableOrbitControls() }, false );
	this.slider.addEventListener( 'touchenter', function() { inst.disableOrbitControls() }, false );
	this.slider.addEventListener( 'touchleave', function() { inst.enableOrbitControls() }, false );
	this.slider.addEventListener( 'touchend', function() { inst.enableOrbitControls() }, false );
	document.addEventListener( "touchend", this.touchEndEventHandler, false );
}

function verticalSlider( parameters ) {
	// Similar to horizontalSlider but oriented vertically

	// make a persistent variable of this instance for later reference during event handling
	var inst = this;
	// make a variable allowing the label to become dormant
	this.dormant = true;

	// sort the arguments
	parameters = parameters || {};
	this.sliderImageFileName = (parameters.sliderImageFileName != undefined)?parameters.sliderImageFileName:'image/controls/defaultSliderImage.png';
	this.horizontalCenterPercent = (parameters.horizontalCenterPercent != undefined)?parameters.horizontalCenterPercent:0.2;
	this.topLimitPercent = (parameters.topLimitPercent != undefined)?parameters.topLimitPercent:0.1;
	this.sliderWidthPercent = (parameters.sliderWidthPercent != undefined)?parameters.sliderWidthPercent:0.1;
	this.trackWidthPercent = (parameters.trackWidthPercent != undefined)?parameters.trackWidthPercent:0.03;
	this.limitToLimitPercent = (parameters.limitToLimitPercent != undefined)?parameters.limitToLimitPercent:0.4;
	this.trackColor = (parameters.trackColor != undefined)?parameters.trackColor:'brown';
	this.bottomLimitValue = (parameters.bottomLimitValue != undefined)?parameters.bottomLimitValue:0;
	this.topLimitValue = (parameters.topLimitValue != undefined)?parameters.topLimitValue:100;
	this.currentValue = (parameters.startingValue != undefined)?parameters.currentValue:50;
	this.hostElementId = (parameters.hostElementId != undefined)?parameters.hostElementId:'document';
	// establish some other handy values
	this.homeValue = this.currentValue;
	this.valueRange = this.topLimitValue - this.bottomLimitValue;
	this.bottomLimitPixel = 0;
	this.topLimitPixel = 0;
	this.motionPixelRange = 0;
	this.nowTracking = false;
	// create the control's visible elements
	this.track = document.createElement( "div" );
	this.track.style.cssText = "position:absolute;background-color:" + this.trackColor;
	document.body.appendChild( this.track );
	this.slider = document.createElement( "div" );
	this.slider.style.cssText = "position:absolute";
	document.body.appendChild( this.slider );
	this.imageElement = new Image();
	this.imageElement.onload = function() { inst.windowResizeHandler(); };
	this.imageElement.src = this.sliderImageFileName;
	this.slider.appendChild( this.imageElement );

	// a routine to figure the geometry of this control
	this.resize = function( bottomLimitPercent, horizontalCenterPercent, limitToLimitPercent, sliderWidthPercent, trackWidthPercent, hostElementId ) {
		if( inst.hostElementId == 'document' ) {
			var windowLeft = 0;
			var windowTop = 0;
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
		} else {
			var hostElement = document.getElementById( inst.hostElementId );
			var windowLeft = hostElement.offsetLeft;
			var windowTop = hostElement.offsetTop;
			var windowWidth = hostElement.offsetWidth;
			var windowHeight = hostElement.offsetHeight;
		}
		// calculate the control's pixel geometry according to the specified proportions
		var trackLeft = ( windowLeft + ( ( inst.horizontalCenterPercent - ( inst.trackWidthPercent / 2 ) ) * windowWidth ) ) | 0;
		var trackTop = ( windowTop + ( ( inst.topLimitPercent - ( inst.trackWidthPercent / 2 ) ) * windowHeight ) ) | 0;
		var trackWidth = ( inst.trackWidthPercent * windowWidth ) | 0;
		var trackHeight = ( ( inst.limitToLimitPercent + inst.trackWidthPercent ) * windowHeight ) | 0;
		// calculate the slider image's natural aspect ratio
		var imageAspectRatio = inst.imageElement.naturalWidth / inst.imageElement.naturalHeight;
		// calculate the pixel positions of the end points of the slider's motion
		inst.topLimitPixel = ( trackTop + ( trackWidth / 2 ) ) | 0;
		inst.bottomLimitPixel = (trackTop + trackHeight - ( trackWidth / 2 ) ) | 0;
		// calculate the slider range in terms of equivalent pixels
		inst.motionPixelRange = inst.bottomLimitPixel - inst.topLimitPixel;
		// calculate the proportional width of the slider image and the necessary height to retain the image's aspect ratio
		var sliderWidth = ( inst.sliderWidthPercent * windowWidth ) | 0;
		var sliderHeight = ( sliderWidth / imageAspectRatio ) | 0;
		// calculate the pixel location of the slider image according to present value
		var sliderLeft = ( windowLeft + ( ( inst.horizontalCenterPercent - ( inst.sliderWidthPercent / 2 ) ) * windowWidth ) ) | 0;
		// var sliderTop = ( inst.bottomLimitPixel - ( inst.motionPixelRange * ( inst.currentValue / ( inst.topLimitValue - inst.bottomLimitValue ) ) ) - ( sliderHeight / 2 ) ) | 0;
		var sliderTop = ( inst.bottomLimitPixel - ( inst.motionPixelRange * ( ( inst.currentValue - inst.bottomLimitValue ) / ( inst.topLimitValue - inst.bottomLimitValue ) ) ) - ( sliderHeight / 2 ) ) | 0;
		// set the calculated geometry into the control's elements
		inst.track.style.left = "0" + trackLeft + "px";
		inst.track.style.top = "0" + trackTop + "px";
		inst.track.style.width = "0" + trackWidth + "px";
		inst.track.style.height = "0" + trackHeight + "px";
		inst.track.style.borderRadius = "0" + ( ( trackWidth / 2 ) | 0 ) + "px";
		inst.imageElement.style.left = inst.slider.style.left = "0" + sliderLeft + "px";
		inst.imageElement.style.top = inst.slider.style.top = "0" + sliderTop + "px";
		inst.imageElement.style.width = inst.slider.style.width = "0" + sliderWidth + "px";
		inst.imageElement.style.height = inst.slider.style.height = "0" + sliderHeight + "px";
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.resize( inst.bottomLimitPercent, inst.horizontalCenterPercent, inst.limitToLimitPercent, inst.sliderWidthPercent, inst.trackWidthPercent, inst.hostElementId );
	}

	// a routine to make the control visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.track.style.display = "block";
		inst.slider.style.display = "block";
		inst.windowResizeHandler();
	}
	// a routine to make the control invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.track.style.display = "none";
		inst.slider.style.display = "none";
	}

	this.disableOrbitControls = function() {
		orbitControls.enabled = false;
	}

	this.enableOrbitControls = function() {
		orbitControls.enabled = true;
	}

	// a routine to programatically set the slider to a given position
	this.setSlider = function( givenValue ) {
		inst.currentValue = givenValue;
		inst.windowResizeHandler();
	}

	// a routine to convert click/touch screen geometry into the equivalent slider value
	this.updateControlValue = function( pixelY ) {
		if( pixelY > inst.bottomLimitPixel ) pixelY = inst.bottomLimitPixel;
		if( pixelY < inst.topLimitPixel ) pixelY = inst.topLimitPixel;
		inst.currentValue = inst.bottomLimitValue + inst.valueRange * ( inst.bottomLimitPixel - pixelY ) / inst.motionPixelRange;
		inst.windowResizeHandler();
	}

	// handlers for mouse and touch events
	this.mouseDownEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		orbitControls.enabled = false;
		// a click on the slider "grabs" the slider...
		inst.nowTracking = true;
		// and sets the slider's vertical position to that of the point clicked
		inst.updateControlValue( e.clientY );
	}
	this.mouseMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		if( !inst.nowTracking ) return;
		// dragging the slider with the mouse varies the slider's vertical position
		inst.updateControlValue( e.clientY );
	}
	this.mouseUpEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		// releasing the mouse button stops any further moving of the slider
		inst.nowTracking = false;
	}
	this.touchStartEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		orbitControls.enabled = false;
		// touching the slider "grabs" it...
		inst.nowTracking = true;
		// and sets the slider's vertical position to that of the point touched
		inst.updateControlValue( e.touches[ 0 ].clientY );
	}
	this.touchMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		if( !inst.nowTracking ) return;
		// dragging the slider varies its vertical position
		inst.updateControlValue( e.touches[ 0 ].clientY );
	}
	this.touchEndEventHandler = function( e ) {
		if( inst.dormant ) return;
		e.preventDefault();
		// lifting the touch finger stops any further moving of the slider
		inst.nowTracking = false;
	}

	// at time of instantiation/creation, be dormant until activation is invoked
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );
	// add event listeners to invoke the mouse/touch handlers
	this.track.addEventListener( "mousedown", this.mouseDownEventHandler, false );
	this.slider.addEventListener( "mousedown", this.mouseDownEventHandler, false );
	this.track.addEventListener( "mousemove", this.mouseMoveEventHandler, false );
	this.slider.addEventListener( "mousemove", this.mouseMoveEventHandler, false );
	window.addEventListener( "mouseup", this.mouseUpEventHandler, false );
	this.track.addEventListener( "touchstart", this.touchStartEventHandler, false );
	this.slider.addEventListener( "touchstart", this.touchStartEventHandler, false );
	this.track.addEventListener( "touchmove", this.touchMoveEventHandler, false );
	this.slider.addEventListener( "touchmove", this.touchMoveEventHandler, false );
	this.slider.addEventListener( 'mouseover', function() { inst.disableOrbitControls() }, false );
	this.slider.addEventListener( 'mouseout', function() { inst.enableOrbitControls() }, false );
	this.slider.addEventListener( 'touchenter', function() { inst.disableOrbitControls() }, false );
	this.slider.addEventListener( 'touchleave', function() { inst.enableOrbitControls() }, false );
	this.slider.addEventListener( 'touchend', function() { inst.enableOrbitControls() }, false );
	document.addEventListener( "touchend", this.touchEndEventHandler, false );
}

function imageButton( parameters ) {
	// imageButton places the image from an image file into a named HTML element.
	// The image can be clicked/touched to invoke an event handler routine.
	// The "preserveAspect" argument can be supplied as "W", "H" or anything else and indicates that during resizing, the image's
	//  original aspect ratio is to be preserved with size tracking:
	//   - the width of the browser window ("W")
	//   - the height of the browser window ("H")
	//   - neither of the above and simply stretch along with any resizing
	// Internal variable "buttonDown" can be polled to see if the button is presently being held down
	// Internal variables "currentXValue" and "currentYValue" can be polled to see where the touch is currently hitting the button ( 0.0 = left/top, 100.0 = right/bottom)
	// make a persistent variable of this instance for later reference during event handling
	var inst = this;
	// make a variable allowing the label to become dormant
	this.dormant = true;

	// sort the arguments
	parameters = parameters || {};
	this.imageFileName = (parameters.imageFileName != undefined )?parameters.imageFileName:'image/controls/defaultImageButtonImage.jpg';
	this.leftPercent = (parameters.leftPercent != undefined )?parameters.leftPercent:0.1;
	this.topPercent = (parameters.topPercent != undefined )?parameters.topPercent:0.1;
	this.widthPercent = (parameters.widthPercent != undefined )?parameters.widthPercent:0.3;
	this.heightPercent = (parameters.heightPercent != undefined )?parameters.heightPercent:0.2;
	this.preserveAspect = (parameters.preserveAspect != undefined )?parameters.preserveAspect:'';
	this.allowSlidingOn = (parameters.allowSlidingOn != undefined )?parameters.allowSlidingOn:false;
	this.clickedCallback = (parameters.clickedCallback != undefined)?parameters.clickedCallback:controlsNullCallback;
	this.hostElementId = (parameters.hostElementId != undefined )?parameters.hostElementId:'document';
	this.leftPixel = 0;
	this.topPixel = 0;
	this.widthPixel = 0;
	this.heightPixel = 0;
	this.visible = document.createElement( "div" );
	this.visible.style.cssText = "position:absolute";
	document.body.appendChild( this.visible );
	this.imageElement = new Image();
	this.imageElement.onload = function() { inst.windowResizeHandler(); };
	this.imageElement.src = this.imageFileName;
	this.visible.appendChild( this.imageElement );
	this.buttonDown = false;
	this.currentXValue = 0;
	this.currentYValue = 0;
	this.resize = function( leftPercent, topPercent, widthPercent, heightPercent, hostElementId ) {
		if( hostElementId == 'document' ) {
			var windowLeft = 0;
			var windowTop = 0;
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
		} else {
			var hostElement = document.getElementById( hostElementId );
			var windowLeft = hostElement.offsetLeft;
			var windowTop = hostElement.offsetTop;
			var windowWidth = hostElement.offsetWidth;
			var windowHeight = hostElement.offsetHeight;
		}
		// calculate the button image's natural aspect ratio
		var imageAspectRatio = inst.imageElement.naturalWidth / inst.imageElement.naturalHeight;
		// set the button's location geometry
		inst.leftPixel = ( ( windowLeft + ( inst.leftPercent * windowWidth ) ) | 0 );
		inst.topPixel = ( ( windowTop + ( inst.topPercent * windowHeight ) ) | 0 );
		inst.imageElement.style.left = inst.visible.style.left = "0" + inst.leftPixel + "px";
		inst.imageElement.style.top = inst.visible.style.top = "0" + inst.topPixel + "px";
		// calculate the button's size geometry
		var rulingWidth = widthPercent * windowWidth;
		var rulingHeight = heightPercent * windowHeight;
		// set the button's size geometry
		switch( inst.preserveAspect ) {
			case "W":
				// set the button's size according to the width of the browser window and maintain the image's original aspect ratio
				inst.widthPixel = ( ( rulingWidth ) | 0 );
				inst.heightPixel = ( ( rulingWidth / imageAspectRatio ) | 0 );
				break;
			case "H":
				// set the button's size according to the height of the browser window and maintain the image's original aspect ratio
				inst.widthPixel = ( ( rulingHeight * imageAspectRatio ) | 0 );
				inst.heightPixel = ( ( rulingHeight ) | 0 );
				break;
			default:
				// set the button's size according to the geometry of the browser window and ignore the original image's aspect ratio
				inst.widthPixel = ( ( rulingWidth ) | 0 );
				inst.heightPixel = ( ( rulingHeight ) | 0 );
				break;
		}
		inst.imageElement.style.width = inst.visible.style.width = "0" + inst.widthPixel + "px";
		inst.imageElement.style.height = inst.visible.style.height = "0" + inst.heightPixel + "px";
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.resize( inst.leftPercent, inst.topPercent, inst.widthPercent, inst.heightPercent, inst.hostElementId );
	}

	// a routine to make the button visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.visible.style.display = "block";
		inst.visible.style.zIndex = "10";
		inst.windowResizeHandler();
	}

	// a routine to make the button invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.visible.style.display = "none";
		inst.visible.style.zIndex = "0";
	}
	// convert touchpoint screen coordinates into button-relative horizontal position
	this.horizontalTouchPoint = function( touchScreenX ) {
		var leftBorderPixel = inst.leftPixel;
		var rightBorderPixel = inst.leftPixel + inst.widthPixel;
		var touchX = touchScreenX;
		if( touchX > rightBorderPixel ) touchX = rightBorderPixel;
		if( touchX < leftBorderPixel ) touchX = leftBorderPixel;
		return ( ( touchX - leftBorderPixel ) / ( rightBorderPixel - leftBorderPixel ) );
	}
	// convert touchpoint screen coordinates into button-relative vertical position
	this.verticalTouchPoint = function( touchScreenY ) {
		var topBorderPixel = inst.topPixel;
		var bottomBorderPixel = inst.topPixel + inst.heightPixel;
		var touchY = touchScreenY;
		if( touchY > bottomBorderPixel ) touchY = bottomBorderPixel;
		if( touchY < topBorderPixel ) touchY = topBorderPixel;
		return ( ( touchY - topBorderPixel ) / ( bottomBorderPixel - topBorderPixel ) );
	}
	// handlers for mouse and touch events
	this.mouseDownEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		orbitControls.enabled = false;
		// a mouse click on the button sets the button's "Down" flag to true...
		inst.buttonDown = true;
		// initializes the touch location variables...
		inst.currentXValue = 100.0 * inst.horizontalTouchPoint( e.clientX );
		inst.currentYValue = 100.0 * inst.verticalTouchPoint( e.clientY );
		// and invokes the button's handler routine
		inst.clickedCallback( e );
	}
	this.mouseMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		if( !inst.buttonDown ) return;
		event.preventDefault();
		// update the touch location variables
		inst.currentXValue = 100.0 * inst.horizontalTouchPoint( e.clientX );
		inst.currentYValue = 100.0 * inst.verticalTouchPoint( e.clientY );
	}
	this.mouseUpEventHandler = function( e ) {
		if( inst.dormant ) return;
		// the mouse button being released resets the button's "Down" flag to false
		inst.buttonDown = false;
		orbitControls.enabled = true;
	}
	this.mouseOutEventHandler = function( e ) {
		if( inst.dormant ) return;
		// dragging the mouse pointer outside the button's extent also resets the button's "Down" flag to false
		inst.buttonDown = false;
		orbitControls.enabled = true;
	}
	this.touchStartEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		orbitControls.enabled = false;
		// touching the button sets the button's "Down" flag to true...
		inst.buttonDown = true;
		// initializes the touch location variables...
		inst.currentXValue = 100.0 * inst.horizontalTouchPoint( e.touches[ 0 ].clientX );
		inst.currentYValue = 100.0 * inst.verticalTouchPoint( e.touches[ 0 ].clientY );
		// and invokes the button's handler routine
		inst.clickedCallback( e );
	}
	this.touchMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		if( !inst.buttonDown ) {
			if( inst.allowSlidingOn )
				inst.buttonDown = true;
			else
				return;
		}
		event.preventDefault();
		// update the touch location variables
		inst.currentXValue = 100.0 * inst.horizontalTouchPoint( e.touches[ 0 ].clientX );
		inst.currentYValue = 100.0 * inst.verticalTouchPoint( e.touches[ 0 ].clientY );
	}
	this.touchEndEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		// lifting the touching finger resets the button's "Down" flag to false
		inst.buttonDown = false;
		orbitControls.enabled = true;
	}
	this.touchLeaveEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		// dragging the touching finger outside the button's extent also reset the button's "Down" flag to false
		inst.buttonDown = false;
		orbitControls.enabled = true;
	}

	// at time of instantiation/creation, be dormant until activation is invoked
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );
	// add event listeners to invoke the mouse/touch handlers
	this.visible.addEventListener( "mousedown", inst.mouseDownEventHandler, false );
	this.visible.addEventListener( "mousemove", inst.mouseMoveEventHandler, false );
	this.visible.addEventListener( "mouseup", inst.mouseUpEventHandler, false );
	this.visible.addEventListener( "mouseout", inst.mouseUpEventHandler, false );
	this.visible.addEventListener( "touchstart", inst.touchStartEventHandler, false );
	this.visible.addEventListener( "touchmove", inst.touchMoveEventHandler, false );
	this.visible.addEventListener( "touchend", inst.touchEndEventHandler, false );
	this.visible.addEventListener( "touchleave", inst.touchLeaveEventHandler, false );
}

// function joyStick( controlImageFileName, knobImageFileName, controlLeftPercent, controlTopPercent, controlWidthPercent, controlHeightPercent, knobWidthPercent, knobHeightPercent, preserveAspect, allowSlidingOn, initialHorizontalPosition, initialVerticalPosition, hostElementId ) {
function joyStick( parameters ) {

	// make a persistent variable of this instance for later reference during event handling
	var inst = this;
	// make a variable allowing the label to become dormant
	this.dormant = true;

	// sort the parameters
	parameters = parameters || {};
	// - imageFileNames
	this.controlImageFileName = (parameters.controlImageFileName != undefined)?parameters.controlImageFileName:'image/controls/defaultJoystickControlImage.png';
	this.shaftImageFileName = (parameters.shaftImageFileName != undefined)?parameters.shaftImageFileName:'image/controls/defaultJoystickShaftImage.png';
	this.knobImageFileName = (parameters.knobImageFileName != undefined)?parameters.knobImageFileName:'image/controls/defaultJoystickKnobImage.png';
	// - geometry
	this.hostElementId = (parameters.hostElementId != undefined)?parameters.hostElementId:'document';
	this.controlLeftPercent = (parameters.controlLeftPercent != undefined)?parameters.controlLeftPercent:0.1;
	this.controlTopPercent = (parameters.controlTopPercent != undefined)?parameters.controlTopPercent:0.1;
	this.controlWidthPercent = (parameters.controlWidthPercent != undefined)?parameters.controlWidthPercent:0.5;
	this.controlHeightPercent = (parameters.controlHeightPercent != undefined)?parameters.controlHeightPercent:0.5;
	this.shaftHeightPercent = (parameters.shaftHeightPercent != undefined)?parameters.shaftHeightPercent:0.05;
	this.knobWidthPercent = (parameters.knobWidthPercent != undefined)?parameters.knobWidthPercent:0.25;
	this.knobHeightPercent = (parameters.knobHeightPercent != undefined)?parameters.knobHeightPercent:0.25;
	this.preserveAspect = (parameters.preserveAspect != undefined)?parameters.preserveAspect:'x';
	// - behavior
	this.allowSlidingOn = (parameters.allowSlidingOn != undefined)?parameters.allowSlidingOn:true;
	this.currentXValue = (parameters.initialHorizontalPosition != undefined)?parameters.initialHorizontalPosition:0.5;
	this.currentYValue = (parameters.initialVerticalPosition != undefined)?parameters.initialVerticalPosition:0.5;
	this.springReturnHorizontal = (parameters.springReturnHorizontal != undefined)?parameters.springReturnHorizontal:true;
	this.springReturnVertical = (parameters.springReturnVertical != undefined)?parameters.springReturnVertical:true;

	// establish some other handy values
	this.homeHorizontalPosition = this.currentXValue;
	this.homeVerticalPosition = this.currentYValue;
	this.controlLeftPixel = 0;
	this.controlTopPixel = 0;
	this.controlWidthPixel = 0;
	this.controlHeightPixel = 0;
	this.shaftLeftPixel = 0;
	this.shaftTopPixel = 0;
	this.shaftWidthPixel = 0;
	this.shaftHeightPixel = 0;
	this.knobLeftPixel = 0;
	this.knobTopPixel = 0;
	this.knobWidthPixel = 0;
	this.knobHeightPixel = 0;
	this.buttonDown = false;

	// make the HTML elements
	this.controlVisible = document.createElement( "div" );
	this.controlVisible.style.cssText = "position:absolute";
	document.body.appendChild( this.controlVisible );
	this.shaftVisible = document.createElement( "div" );
	this.shaftVisible.style.cssText = "position:absolute";
	document.body.appendChild( this.shaftVisible );
	this.knobVisible = document.createElement( "div" );
	this.knobVisible.style.cssText = "position:absolute";
	document.body.appendChild( this.knobVisible );
	this.controlImageElement = new Image();
	this.controlImageElement.onload = function() { inst.windowResizeHandler(); };
	this.controlImageElement.src = this.controlImageFileName;
	this.controlVisible.appendChild( this.controlImageElement );
	this.shaftImageElement = new Image();
	this.shaftImageElement.onload = function() { inst.windowResizeHandler(); };
	this.shaftImageElement.src = this.shaftImageFileName;
	this.shaftVisible.appendChild( this.shaftImageElement );
	this.knobImageElement = new Image();
	this.knobImageElement.onload = function() { inst.windowResizeHandler(); };
	this.knobImageElement.src = this.knobImageFileName;
	this.knobVisible.appendChild( this.knobImageElement );

	// this.resize = function( leftPercent, topPercent, widthPercent, heightPercent, hostElementId ) {
	this.resize = function() {
		if( inst.hostElementId == 'document' ) {
			var windowLeft = 0;
			var windowTop = 0;
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
		} else {
			var hostElement = document.getElementById( inst.hostElementId );
			var windowLeft = hostElement.offsetLeft;
			var windowTop = hostElement.offsetTop;
			var windowWidth = hostElement.offsetWidth;
			var windowHeight = hostElement.offsetHeight;
		}
		// calculate the natural aspect ratio for the control image
		var controlImageAspectRatio = inst.controlImageElement.naturalWidth / inst.controlImageElement.naturalHeight;
		// set the control's location geometry
		inst.controlLeftPixel = ( ( windowLeft + ( inst.controlLeftPercent * windowWidth ) ) | 0 );
		inst.controlTopPixel = ( ( windowTop + ( inst.controlTopPercent * windowHeight ) ) | 0 );
		inst.controlImageElement.style.left = inst.controlVisible.style.left = "0" + inst.controlLeftPixel + "px";
		inst.controlImageElement.style.top = inst.controlVisible.style.top = "0" + inst.controlTopPixel + "px";
		// calculate the control's size geometry
		var rulingWidth = inst.controlWidthPercent * windowWidth;
		var rulingHeight = inst.controlHeightPercent * windowHeight;
		// set the control's size geometry
		switch( inst.preserveAspect ) {
			case "W":
				// set the control's size according to the width of the host element and maintain the image's original aspect ratio
				inst.controlWidthPixel = ( ( rulingWidth ) | 0 );
				inst.controlHeightPixel = ( ( rulingWidth / controlImageAspectRatio ) | 0 );
				break;
			case "H":
				// set the control's size according to the height of the host element and maintain the image's original aspect ratio
				inst.controlWidthPixel = ( ( rulingHeight * controlImageAspectRatio ) | 0 );
				inst.controlHeightPixel = ( ( rulingHeight ) | 0 );
				break;
			default:
				// set the control's size according to the geometry of the host element and ignore the original image's aspect ratio
				inst.controlWidthPixel = ( ( rulingWidth ) | 0 );
				inst.controlHeightPixel = ( ( rulingHeight ) | 0 );
				break;
		}
		inst.controlImageElement.style.width = inst.controlVisible.style.width = "0" + inst.controlWidthPixel + "px";
		inst.controlImageElement.style.height = inst.controlVisible.style.height = "0" + inst.controlHeightPixel + "px";
		// pick up the control image center point for later use with the shaft image
		var controlImageCenterPixelX = inst.controlLeftPixel + ( inst.controlWidthPixel / 2 );
		var controlImageCenterPixelY = inst.controlTopPixel + ( inst.controlHeightPixel / 2 );
		// now do the same for the knob image
		// calculate the natural aspect ratio for the knob image
		var knobImageAspectRatio = inst.knobImageElement.naturalWidth / inst.knobImageElement.naturalHeight;
		rulingWidth = inst.controlWidthPixel * inst.knobWidthPercent;
		rulingHeight = inst.controlHeightPixel * inst.knobHeightPercent;
		// figure the knob's shape geometry
		switch( inst.preserveAspect ) {
			case "W":
				// set the knob's size according to the width of the control element and maintain the image's original aspect ratio
				inst.knobWidthPixel = ( ( rulingWidth ) | 0 );
				inst.knobHeightPixel = ( ( rulingWidth / knobImageAspectRatio ) | 0 );
				break;
			case "H":
				// set the knob's size according to the height of the control element and maintain the image's original aspect ratio
				inst.knobWidthPixel = ( ( rulingHeight * knobImageAspectRatio ) | 0 );
				inst.knobHeightPixel = ( ( rulingHeight ) | 0 );
				break;
			default:
				// set the knob's size according to the geometry of the control element and ignore the original image's aspect ratio
				inst.knobWidthPixel = ( ( rulingWidth ) | 0 );
				inst.knobHeightPixel = ( ( rulingHeight ) | 0 );
				break;
		}
		inst.knobImageElement.style.width = inst.knobVisible.style.width = "0" + inst.knobWidthPixel + "px";
		inst.knobImageElement.style.height = inst.knobVisible.style.height = "0" + inst.knobHeightPixel + "px";
		// set the knob's location geometry
		var knobCenterLeftPixel = ( ( inst.controlLeftPixel + ( inst.controlWidthPixel * inst.currentXValue ) ) | 0 );
		var knobCenterTopPixel = ( ( inst.controlTopPixel + ( inst.controlHeightPixel * ( 1 - inst.currentYValue ) ) ) | 0 );
		inst.knobLeftPixel = ( ( knobCenterLeftPixel - ( inst.knobWidthPixel / 2 ) ) | 0 );
		inst.knobTopPixel = ( ( knobCenterTopPixel - ( inst.knobHeightPixel / 2 ) ) | 0 );
		inst.knobImageElement.style.left = inst.knobVisible.style.left = "0" + inst.knobLeftPixel + "px";
		inst.knobImageElement.style.top = inst.knobVisible.style.top = "0" + inst.knobTopPixel + "px";
		// now get the knob image center point
		var knobImageCenterPixelX = inst.knobLeftPixel + ( inst.knobWidthPixel / 2 );
		var knobImageCenterPixelY = inst.knobTopPixel + ( inst.knobHeightPixel / 2 );
		// For the shaft image element, we start with the image of a horizontal shaft that has round ends.
		// We set the image height to the shaft "height" parameter (diameter of the shaft, really) and
		//  the image width equal to the distance between the center of the control and the center of the knob plus the height value.
		// (adding the height value here alllows us to place the center of the circle at one end of the shaft at the center of the
		//   the control and the center of the circle at the other end of the shaft at the center of the knob)
		// Then we rotate the shaft image to be parallel to a line between the control and knob centers.
		// Then we locate the shaft image by...
		// ... first we size the shaft image
		inst.shaftHeightPixel = ( ( inst.controlHeightPixel * inst.shaftHeightPercent ) | 0 );
		var centerToCenterDistance = Math.sqrt(((controlImageCenterPixelX-knobImageCenterPixelX)*(controlImageCenterPixelX-knobImageCenterPixelX))+
												((controlImageCenterPixelY-knobImageCenterPixelY)*(controlImageCenterPixelY-knobImageCenterPixelY)));
		inst.shaftWidthPixel = ( ( centerToCenterDistance + inst.shaftHeightPixel ) | 0 );
		inst.shaftImageElement.style.width = inst.shaftVisible.style.width = '0' + inst.shaftWidthPixel + 'px';
		inst.shaftImageElement.style.height = inst.shaftVisible.style.height = '0' + inst.shaftHeightPixel + 'px';
		// ... then we rotate the shaft image
		// !!!! remember that style.transform.rotate measures angles CLOCKWISE from right-pointing horizontal....
		// !!!! remember that 'Y' coordinates grow larger as we go DOWN the screen....
		if(knobImageCenterPixelX >= controlImageCenterPixelX){
			// Quadrant I or IV
			if(knobImageCenterPixelY >= controlImageCenterPixelY){
				// Quadrant IV
				var quadrant = 4;
				var xDistance = knobImageCenterPixelX - controlImageCenterPixelX;
				var yDistance = knobImageCenterPixelY - controlImageCenterPixelY;
				if(xDistance > 0){
					// not straight down
					var rotationAngleInRadians = Math.atan(yDistance/xDistance);
				} else{
					// straight down
					var rotationAngleInRadians = Math.PI/2;
				}
			} else {
				// Quadrant I
				var quadrant = 1;
				var xDistance = knobImageCenterPixelX - controlImageCenterPixelX;
				var yDistance = controlImageCenterPixelY - knobImageCenterPixelY;
				if(yDistance > 0){
					// not straight right
					var rotationAngleInRadians = Math.atan(xDistance/yDistance) + 3*Math.PI/2;
				} else{
					// straight right
					var rotationAngleInRadians = 0;
				}
			}
		} else {
			// Quadrant II or III
			if(knobImageCenterPixelY >= controlImageCenterPixelY){
				// Quadrant III
				var quadrant = 3;
				var xDistance = controlImageCenterPixelX - knobImageCenterPixelX;
				var yDistance = knobImageCenterPixelY - controlImageCenterPixelY;
				if(yDistance > 0){
					// not straight left
					var rotationAngleInRadians = Math.atan(xDistance/yDistance) + Math.PI/2;
				} else{
					// straight left
					var rotationAngleInRadians = Math.PI;
				}
			} else {
				// Quadrant II
				var quadrant = 2;
				var xDistance = controlImageCenterPixelX - knobImageCenterPixelX;
				var yDistance = controlImageCenterPixelY - knobImageCenterPixelY;
				if(xDistance > 0){
					// not straight up
					var rotationAngleInRadians = Math.atan(yDistance/xDistance) + Math.PI;
				} else{
					// straight up
					var rotationAngleInRadians = Math.PI;
				}
			}
		}
		inst.shaftVisible.style.transform = 'rotate(' + rotationAngleInRadians + 'rad)';
		// ... finally we place the rotated shaft image
		switch( quadrant ) {
			case 1:
				var shaftImageCenterX = controlImageCenterPixelX + ( ( knobImageCenterPixelX - controlImageCenterPixelX ) / 2 );
				var shaftImageCenterY = controlImageCenterPixelY - ( ( controlImageCenterPixelY - knobImageCenterPixelY ) / 2 );
				break;
			case 2:
				var shaftImageCenterX = controlImageCenterPixelX - ( ( controlImageCenterPixelX - knobImageCenterPixelX ) / 2 );
				var shaftImageCenterY = controlImageCenterPixelY - ( ( controlImageCenterPixelY - knobImageCenterPixelY ) / 2 );
				break;
			case 3:
				var shaftImageCenterX = controlImageCenterPixelX - ( ( controlImageCenterPixelX - knobImageCenterPixelX ) / 2 );
				var shaftImageCenterY = controlImageCenterPixelY + ( ( knobImageCenterPixelY - controlImageCenterPixelY ) / 2 );
				break;
			case 4:
				var shaftImageCenterX = controlImageCenterPixelX + ( ( knobImageCenterPixelX - controlImageCenterPixelX ) / 2 );
				var shaftImageCenterY = controlImageCenterPixelY + ( ( knobImageCenterPixelY - controlImageCenterPixelY ) / 2 );
				break;
			default:
				break;
		}
		// var shaftImageLeftX = shaftImageCenterX - ( inst.shaftWidthPixel / 2 ) + ( inst.shaftHeightPixel / 2 );
		var shaftImageLeftX = shaftImageCenterX - ( inst.shaftWidthPixel / 2 );
		var shaftImageTopY = shaftImageCenterY - ( inst.shaftHeightPixel / 2 );
		inst.shaftVisible.style.left = '0' + ( shaftImageLeftX | 0 ) + 'px';
		inst.shaftVisible.style.top = '0' + ( shaftImageTopY | 0 ) + 'px';
	}
	// an event handler to call the resizing routine whenever there's a change in browser geometry
	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		// inst.resize( inst.leftPercent, inst.topPercent, inst.widthPercent, inst.heightPercent, inst.hostElementId );
		inst.resize();
	}

	// a routine to make the button visible and responsive
	this.activate = function() {
		inst.dormant = false;
		inst.controlVisible.style.display = "block";
		// inst.controlVisible.style.zIndex = "10";
		inst.knobVisible.style.display = "block";
		// inst.knobVisible.style.zIndex = "11";
		inst.windowResizeHandler();
	}
	// a routine to make the button invisible and dormant
	this.deactivate = function() {
		inst.dormant = true;
		inst.controlVisible.style.display = "none";
		inst.controlVisible.style.zIndex = "0";
		inst.knobVisible.style.display = "none";
		inst.knobVisible.style.zIndex = "0";
	}

	// convert touchpoint screen coordinates into the corresponding button-relative horizontal position (0.0 left <-> 1.0 right)
	this.horizontalTouchPoint = function( touchScreenX ) {
		var leftBorderPixel = inst.controlLeftPixel;
		var rightBorderPixel = inst.controlLeftPixel + inst.controlWidthPixel;
		var touchX = touchScreenX;
		if( touchX > rightBorderPixel ) touchX = rightBorderPixel;
		if( touchX < leftBorderPixel ) touchX = leftBorderPixel;
		return ( ( touchX - leftBorderPixel ) / ( rightBorderPixel - leftBorderPixel ) );
	}
	// convert touchpoint screen coordinates into the corresponding button-relative vertical position (0.0 bottom <-> 1.0 top)
	this.verticalTouchPoint = function( touchScreenY ) {
		var topBorderPixel = inst.controlTopPixel;
		var bottomBorderPixel = inst.controlTopPixel + inst.controlHeightPixel;
		var touchY = touchScreenY;
		if( touchY > bottomBorderPixel ) touchY = bottomBorderPixel;
		if( touchY < topBorderPixel ) touchY = topBorderPixel;
		return ( ( bottomBorderPixel - touchY ) / ( bottomBorderPixel - topBorderPixel ) );
	}

	// implement spring return action for joysticks
	this.springReturn = function(){
		if(inst.springReturnHorizontal){
			inst.currentXValue = 0.5;
		}
		if(inst.springReturnHorizontal){
			inst.currentYValue = 0.5;
		}
		inst.windowResizeHandler();
	}

	// handlers for mouse and touch events
	this.mouseDownEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		orbitControls.enabled = false;
		// a mouse click on the button sets the button's "Down" flag to true...
		inst.buttonDown = true;
		// initializes the touch location variables...
		inst.currentXValue = inst.horizontalTouchPoint( e.clientX );
		inst.currentYValue = inst.verticalTouchPoint( e.clientY );
		inst.windowResizeHandler();
	}
	this.mouseOverEventHandler = function( e ) {
		if( inst.dormant ) return;
		if( !inst.buttonDown ) return;
		event.preventDefault();
		// update the touch location variables
		inst.currentXValue = inst.horizontalTouchPoint( e.clientX );
		inst.currentYValue = inst.verticalTouchPoint( e.clientY );
		inst.windowResizeHandler();
	}
	this.mouseMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		if( !inst.buttonDown ) return;
		event.preventDefault();
		// update the touch location variables
		inst.currentXValue = inst.horizontalTouchPoint( e.clientX );
		inst.currentYValue = inst.verticalTouchPoint( e.clientY );
		inst.windowResizeHandler();
	}
	this.mouseUpEventHandler = function( e ) {
		if( inst.dormant ) return;
		// the mouse button being released resets the button's "Down" flag to false
		inst.buttonDown = false;
		inst.springReturn();
		orbitControls.enabled = true;
	}
	this.mouseOutEventHandler = function( e ) {
		if( inst.dormant ) return;
		// Reset the button's "Down" flag to false when mouse pointer is dragged outside the control's extent
		inst.buttonDown = false;
		inst.springReturn();
		orbitControls.enabled = true;
	}
	this.touchStartEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		orbitControls.enabled = false;
		// touching the button sets the button's "Down" flag to true...
		inst.buttonDown = true;
		// initializes the touch location variables...
		inst.currentXValue = inst.horizontalTouchPoint( e.touches[ 0 ].clientX );
		inst.currentYValue = inst.verticalTouchPoint( e.touches[ 0 ].clientY );
		inst.windowResizeHandler();
	}
	this.touchMoveEventHandler = function( e ) {
		if( inst.dormant ) return;
		if( !inst.buttonDown ) {
			if( inst.allowSlidingOn )
				inst.buttonDown = true;
			else
				return;
		}
		event.preventDefault();
		// update the touch location variables
		inst.currentXValue = inst.horizontalTouchPoint( e.touches[ 0 ].clientX );
		inst.currentYValue = inst.verticalTouchPoint( e.touches[ 0 ].clientY );
		inst.windowResizeHandler();
	}
	this.touchEndEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		// lifting the touching finger resets the button's "Down" flag to false
		inst.buttonDown = false;
		inst.springReturn();
		orbitControls.enabled = true;
	}
	this.touchLeaveEventHandler = function( e ) {
		if( inst.dormant ) return;
		event.preventDefault();
		// dragging the touching finger outside the button's extent also reset the button's "Down" flag to false
		inst.buttonDown = false;
		inst.springReturn();
		orbitControls.enabled = true;
	}

	// at time of instantiation/creation, be dormant by default
	this.deactivate();

	// add event listeners to invoke the resize handler
	window.addEventListener( "resize", this.windowResizeHandler, false );
	window.addEventListener( "orientationchange", this.windowResizeHandler, false );

	// add event listeners to invoke the mouse/touch handlers
	this.controlVisible.addEventListener( "mousedown", inst.mouseDownEventHandler, false );
	this.controlVisible.addEventListener( "mouseover", inst.mouseOverEventHandler, false );
	this.controlVisible.addEventListener( "mousemove", inst.mouseMoveEventHandler, false );
	this.controlVisible.addEventListener( "mouseup", inst.mouseUpEventHandler, false );
	// this.controlVisible.addEventListener( "mouseout", inst.mouseUpEventHandler, false );
	this.controlVisible.addEventListener( "touchstart", inst.touchStartEventHandler, false );
	this.controlVisible.addEventListener( "touchmove", inst.touchMoveEventHandler, false );
	this.controlVisible.addEventListener( "touchend", inst.touchEndEventHandler, false );
	this.controlVisible.addEventListener( "touchleave", inst.touchLeaveEventHandler, false );
	this.knobVisible.addEventListener( "mousedown", inst.mouseDownEventHandler, false );
	this.knobVisible.addEventListener( "mouseover", inst.mouseOverEventHandler, false );
	this.knobVisible.addEventListener( "mousemove", inst.mouseMoveEventHandler, false );
	this.knobVisible.addEventListener( "mouseup", inst.mouseUpEventHandler, false );
	// this.knobVisible.addEventListener( "mouseout", inst.mouseUpEventHandler, false );
	this.knobVisible.addEventListener( "touchstart", inst.touchStartEventHandler, false );
	this.knobVisible.addEventListener( "touchmove", inst.touchMoveEventHandler, false );
	this.knobVisible.addEventListener( "touchend", inst.touchEndEventHandler, false );
	this.knobVisible.addEventListener( "touchleave", inst.touchLeaveEventHandler, false );
}

var globalListBox = undefined;
function emptyGlobalListBox() {
	if( globalListBox != undefined ) {
		globalListBox.remove();
	}
}

function listBox( parameters ) {
	/* list box inspired by (but MUCH simpler than that of) Samir NIGAM in:
		http://www.codeproject.com/Articles/27265/JavaScript-ListBox-Control
	*/
	var inst = this;
	parameters = parameters || {};
	this.itemClickedCallback = (parameters.itemClickedCallback != undefined)?parameters.itemClickedCallback:controlsNullCallback;
	this.doneButtonText = (parameters.doneButtonText != undefined)?parameters.doneButtonText:'Click here to close';
	this.doneButtonTextColor = (parameters.doneButtonTextColor != undefined)?parameters.doneButtonTextColor:'black';
	this.doneButtonBackgroundColor = (parameters.doneButtonBackgroundColor != undefined)?parameters.doneButtonBackgroundColor:'lightblue';
	this.itemTextColor = (parameters.itemTextColor != undefined)?parameters.itemTextColor:'black';
	this.itemBackgroundColor = (parameters.itemBackgroundColor != undefined)?parameters.itemBackgroundColor:'lightyellow';
	this.hostElementId = (parameters.hostElementId != undefined)?parameters.hostElementId:'document';
	this.listLeftPercent = (parameters.listLeftPercent != undefined)?parameters.listLeftPercent:0.1;
	this.listTopPercent = (parameters.listTopPercent != undefined)?parameters.listTopPercent:0.1;
	this.listWidthPercent = (parameters.listWidthPercent != undefined)?parameters.listWidthPercent:0.2;
	this.listHeightPercent = (parameters.listHeightPercent != undefined)?parameters.listHeightPercent:0.3;
	this.itemHeightPercent = (parameters.itemHeightPercent != undefined)?parameters.itemHeightPercent:0.05;
	this.instantiatedInDocumentBody = false;
	this.listBoxObjectList = [];
	this.listWindowDiv = document.createElement( 'div' );
	this.listWindowDiv.style.cssText = 'position:absolute';

	// presently, the listbox is NOT a resizing entity....
	if( inst.hostElementId == 'document' ) {
		var windowLeft = 0;
		var windowTop = 0;
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
	} else {
		var hostElement = document.getElementById( inst.hostElementId );
		var windowLeft = hostElement.offsetLeft;
		var windowTop = hostElement.offsetTop;
		var windowWidth = hostElement.offsetWidth;
		var windowHeight = hostElement.offsetHeight;
	}
	this.listWindowLeftPixel = ( ( inst.listLeftPercent * windowWidth ) | 0 );
	this.listWindowTopPixel = ( ( inst.listTopPercent * windowHeight ) | 0 );
	this.listWindowWidthPixel = ( ( inst.listWidthPercent * windowWidth ) | 0 );
	this.listWindowHeightPixel = ( ( inst.listHeightPercent * windowHeight ) | 0 );
	this.itemHeightPixel = ( ( inst.itemHeightPercent * windowHeight ) | 0 );
	this.listWindowDiv.style.left = '0' + inst.listWindowLeftPixel + 'px';
	this.listWindowDiv.style.top = '0' + inst.listWindowTopPixel + 'px';
	this.listWindowDiv.style.width = '0' + inst.listWindowWidthPixel + 'px';
	this.listWindowDiv.style.height = '0' + inst.listWindowHeightPixel + 'px';
	this.listWindowDiv.style.overflow = 'auto';
	// this.listWindowDiv.style.backgroundColor = "#887733";
	this.listWindowDiv.style.cursor = 'default';
	document.body.appendChild( this.listWindowDiv );
	this.instantiatedInDocumentBody = true;
	this.doneButtonDiv = document.createElement( 'div' );
	this.doneButtonDiv.style.cssText = "position:absolute;left:0px;top:0px;width:300px;height:20px";
	// this.doneButtonDiv.style.left = '0' + inst.listWindowLeftPixel + 'px';
	// this.doneButtonDiv.style.top = '0' + inst.listWindowTopPixel + 'px';
	// this.doneButtonDiv.style.width = '0' + inst.listWindowWidthPixel + 'px';
	// this.doneButtonDiv.style.height = '0' + inst.itemHeightPixel + 'px';
	this.doneButtonDiv.style.color = this.doneButtonTextColor;
	this.doneButtonDiv.style.backgroundColor = this.doneButtonBackgroundColor;
	this.doneButtonDiv.innerHTML = inst.doneButtonText;
	var itemObject = new Object();
	itemObject.value = -1;
	this.doneButtonDiv.addEventListener( 'click', function() {inst.itemClickedCallback( itemObject ) }, false );
	this.doneButtonDiv.addEventListener( 'touchstart', function() {inst.itemClickedCallback( itemObject ) }, false );
	this.listWindowDiv.appendChild( this.doneButtonDiv );
	this.listPaneDiv = document.createElement( 'div' );
	this.listPaneDiv.style.cssText = "position:absolute;left:0px;top:20px;width:300px;height:110px";
	this
	this.listPaneDiv.style.overflow = 'auto';
	this.listPaneDiv.style.zIndex = 10;
	this.listWindowDiv.appendChild( this.listPaneDiv);

	this.listWindowDiv.addEventListener( "mousedown", function() {inst.mouseDownEventHandler()}, false );
	this.listWindowDiv.addEventListener( "mouseover", function() {inst.mouseOverEventHandler()}, false );
	this.listWindowDiv.addEventListener( "mouseup", function() {inst.mouseUpEventHandler()}, false );
	this.listWindowDiv.addEventListener( "mouseout", function() {inst.mouseOutEventHandler()}, false );
	this.listWindowDiv.addEventListener( "touchstart", function() {inst.touchStartEventHandler()}, false );
	this.listWindowDiv.addEventListener( "touchenter", function() {inst.touchEnterEventHandler()}, false );
	this.listWindowDiv.addEventListener( "touchend", function() {inst.touchEndEventHandler()}, false );
	this.listWindowDiv.addEventListener( "touchleave", function() {inst.touchLeaveEventHandler()}, false );

	this.addItem = function( text, number ) {
		var itemObject = new Object();
		var itemVisibleDiv = document.createElement( 'div' );
		itemVisibleDiv.style.cssText = "overflow:hidden";
		itemVisibleDiv.style.color = inst.itemTextColor;
		itemVisibleDiv.style.backgroundColor = inst.itemBackgroundColor;
		itemVisibleDiv.innerHTML = text;
		itemVisibleDiv.addEventListener( 'mousedown', function() { inst.itemClickedCallback( itemObject ) }, false );
		itemVisibleDiv.addEventListener( 'touchstart', function() { inst.itemClickedCallback( itemObject ) }, false );
		inst.listPaneDiv.appendChild( itemVisibleDiv );
		itemObject.visibleDiv = itemVisibleDiv;
		itemObject.value = number;
		inst.listBoxObjectList.push( itemObject );
	}

	// handlers for mouse and touch events
	this.mouseDownEventHandler = function( e ) {
		event.preventDefault();
		orbitControls.enabled = false;
	}
	this.mouseOverEventHandler = function( e ) {
		event.preventDefault();
		orbitControls.enabled = false;
	}
	this.mouseUpEventHandler = function( e ) {
		orbitControls.enabled = true;
	}
	this.mouseOutEventHandler = function( e ) {
		orbitControls.enabled = true;
	}
	this.touchStartEventHandler = function( e ) {
		// event.preventDefault();
		orbitControls.enabled = false;
	}
	this.touchEnterEventHandler = function( e ) {
		event.preventDefault();
		orbitControls.enabled = false;
	}
	this.touchEndEventHandler = function( e ) {
		orbitControls.enabled = true;
	}
	this.touchLeaveEventHandler = function( e ) {
		orbitControls.enabled = true;
	}

	this.remove = function() {
		inst.dispose();
	}
	this.dispose = function() {
		// for( var i = 0; i < this.listBoxObjectList.length; i++) {
		// 	inst.listBoxObjectList[ i ].visibleDiv.removeEventListener( onclick, inst.itemClickedCallback, false );
		// }
		inst.listBoxObjectList = [];
		if( inst.instantiatedInDocumentBody ) {
			document.body.removeChild( inst.listWindowDiv );
			inst.instantiatedInDocumentBody = false;
		}
	}
}

// a "nop" callback
function controlsNullCallback(){};

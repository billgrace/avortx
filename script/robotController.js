/* console.js
Make a robot control console
*/

var consoleControlList = [];

function robotControllerPanel( left, bottom, width, height ) {
	var inst = this;
	this.dormant = true;
	this.styleLeft = left;
	this.styleBottom = bottom;
	this.styleWidth = width;
	this.styleHeight = height;
	this.visible = document.createElement( 'div' );
	this.visible.id = 'robotControllerPanel';
	this.visible.style.cssText = "position:absolute;background-color:gray";
	document.body.appendChild( this.visible );
	window.addEventListener( "resize", this.consoleWindowResizeHandler, false );
	window.addEventListener( "orientationchange", this.consoleWindowResizeHandler, false );
	this.visible.addEventListener( 'mouseover', function() { inst.disableOrbitControls() }, false );
	this.visible.addEventListener( 'mouseout', function() { inst.enableOrbitControls() }, false );
	this.visible.addEventListener( 'touchstart', function() { inst.disableOrbitControls() }, false );
	this.visible.addEventListener( 'touchenter', function() { inst.disableOrbitControls() }, false );
	this.visible.addEventListener( 'touchleave', function() { inst.enableOrbitControls() }, false );
	this.visible.addEventListener( 'touchend', function() { inst.enableOrbitControls() }, false );

	this.windowResizeHandler = function() {
		if( inst.dormant ) return;
		inst.visible.style.left = inst.styleLeft;
		inst.visible.style.bottom = inst.styleBottom;
		inst.visible.style.width = inst.styleWidth;
		inst.visible.style.height = inst.styleHeight;
	}

	this.disableOrbitControls = function() {
		orbitControls.enabled = false;
	}

	this.enableOrbitControls = function() {
		orbitControls.enabled = true;
	}

	this.activate = function() {
		inst.dormant = false;
		inst.visible.style.display = "block";
		inst.windowResizeHandler();
	}

	this.deactivate = function() {
		inst.dormant = true;
		inst.visible.style.display = "none";
	}

	this.windowResizeHandler();
}

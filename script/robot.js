/* robot.js

Select and specify a variety of robots

*/

var needToshowRobotListWhenAvailable = false;

var pauseButton, playButton, restartAnimationButton;

var robotBody, robotMesh;
var visibleRobotBodyOrientationVector;

var robotControllerPanel;
var leftJoyStick, rightJoyStick;
var brakeButton;

var currentRobotMesh;

var robotBody;
var robotBodyMaterial;
var robotBodySphereShape;

var robotObjectList = [];
var currentRobotIndex;
var blueBalloonMesh;
var flyingCardboardMesh;
var simpleWheelMesh;

var currentDragPointBody;
var dragPointSpring;
var dragPointSpringIsInPlace = false;

var robotTrackMaterialContactEquation;

var currentRobotMotiveMode;

function initializeRobot() {
	animationStepCallbackList.push('robotAnimationStepCallback');
	animationRestartCallbackList.push('robotAnimationRestartCallback');
	initializeRobotControllerPanel();
	// create the one and only robot physics body: a small (1 mm radius) sphere which occupies the center of all robots.
	// this is an individual physics entity on which all forces act during animation.
	robotBodyMaterial = new CANNON.Material( 'robotBodyMaterial' );
	robotBodySphereShape = new CANNON.Sphere( 1 );
	robotBody = new CANNON.Body( { material: robotBodyMaterial, mass: 100, linearDamping: 0.9, angularDamping: 0 } );
	robotBody.addShape( robotBodySphereShape );
	world.addBody( robotBody );

	// create the one and only animated drag point which zips along the center of the track's top surface.
	currentDragPointBody = new CANNON.Body( { material: new CANNON.Material(), mass: 0 } );
	currentDragPointBody.addShape( new CANNON.Sphere( currentTrackType.dragPointRadius ) );
	world.addBody( currentDragPointBody );
	initializeDragPoint();

	// create spring connecting the robot body to the drag point
	dragPointSpring = new CANNON.Spring( currentDragPointBody, robotBody, {
			localAnchorA: new CANNON.Vec3( 0, 0, 0 ),
			localAnchorB: new CANNON.Vec3( 0, 0, 0 ),
			restLength: 0,
			stiffness: 2000,
			damping: 1
		} );
	enableDragPointSpring();

	// // create a contact material to allow the robot body material to respond to the track material
	// robotTrackMaterialContactEquation = new CANNON.ContactMaterial( robotBodyMaterial, trackBodyMaterial, { friction: 0, restitution: 0.0 } );
	// world.addContactMaterial( robotTrackMaterialContactEquation );

	// create array of robot definitions
	robotObjectList = [];
	// --- a caster
	var casterWheelRadius = 5;

	// narrower for LTMouseWheel.jpg
	// var casterWheelWidth = 4;
	var casterWheelWidth = 1;

	var casterWheelNumberOfCircumferenceSegments = 16;
	var casterPlatformLength = 25;
	var casterPlatformThickness = 2;
	var casterPlatformWidth = 10;
	var casterPaintColor = 0x907050;
	var casterBracketMaterial = new THREE.MeshLambertMaterial( { color:casterPaintColor } );
	var casterBracketThickness = 0.5;
	var casterBracketWidth = casterWheelWidth + 2;
	var casterBracketLength = 5;
	var casterBracketBendMargin = 1;
	var casterBracketHubRadius = 1.5;
	var casterBracketShaftElevation = 10;
	var casterShaftRadius = 0.5;
	var casterObject = new Object();
	casterObject.name = 'Caster';
	casterObject.motiveMode = 'trackDragPoint';
	// ---- the plain rectangular platform underneath which the caster is fixed
	var casterPlatformMesh = new THREE.Mesh( new THREE.BoxGeometry(casterPlatformLength, casterPlatformThickness, casterPlatformWidth),
												new THREE.MeshLambertMaterial( { color:0x50c050 } ) );
	// ---- a square "U" bracket to which the caster axle attaches
	// ----- the rectangular base piece of the U where the caster bracket is screwed into the bottom of the platform
	var casterBracketBaseMesh = new THREE.Mesh( new THREE.BoxGeometry( casterBracketLength, casterBracketThickness, casterBracketWidth ), casterBracketMaterial );
	casterPlatformMesh.add( casterBracketBaseMesh );
	casterBracketBaseMesh.position.set( 0, -( casterPlatformThickness / 2 ), 0 );
	// ----- the geometry for each of the two sides of the U (not including the cylinder "hub" where the axle passes through)
	var casterBracketSideShape = new THREE.Shape();
	casterBracketSideShape.moveTo( ( casterBracketLength / 2 ), 0 );
	casterBracketSideShape.lineTo( ( casterBracketLength / 2 ), -casterBracketBendMargin );
	// casterBracketSideShape.lineTo( ( ( casterBracketLength / 2 ) - casterBracketHubRadius ), -casterBracketShaftElevation );
	// casterBracketSideShape.lineTo( -( ( casterBracketLength / 2 ) - casterBracketHubRadius ), -casterBracketShaftElevation );
	casterBracketSideShape.lineTo( casterBracketHubRadius, -casterBracketShaftElevation );
	casterBracketSideShape.lineTo( -casterBracketHubRadius, -casterBracketShaftElevation );
	casterBracketSideShape.lineTo( -( casterBracketLength / 2 ), -casterBracketBendMargin );
	casterBracketSideShape.lineTo( -( casterBracketLength / 2 ), 0 );
	casterBracketSideShape.lineTo( ( casterBracketLength / 2 ), 0 );
	var casterBracketSideGeometry = new THREE.ExtrudeGeometry( casterBracketSideShape, { amount:casterBracketThickness, bevelEnabled:false } );
	// ------ the left side of the bracket
	var casterBracketLeftSideMesh = new THREE.Mesh( casterBracketSideGeometry, casterBracketMaterial );
	casterBracketBaseMesh.add( casterBracketLeftSideMesh );
	casterBracketLeftSideMesh.position.set( 0, 0, -( casterBracketWidth / 2 ) );
	// ------ the right side of the bracket
	var casterBracketRightSideMesh = new THREE.Mesh( casterBracketSideGeometry, casterBracketMaterial );
	casterBracketBaseMesh.add( casterBracketRightSideMesh );
	casterBracketRightSideMesh.position.set( 0, 0, ( ( casterBracketWidth / 2 ) - casterBracketThickness ) );
	// ------ the shaft hubs
	var casterBracketLeftHubMesh = new THREE.Mesh( new THREE.CylinderGeometry( casterBracketHubRadius, casterBracketHubRadius, casterBracketThickness, 16 ), casterBracketMaterial );
	casterBracketBaseMesh.add( casterBracketLeftHubMesh );
	casterBracketLeftHubMesh.rotation.x = Math.PI / 2;
	casterBracketLeftHubMesh.position.set( 0, -casterBracketShaftElevation, -( ( casterBracketWidth / 2 ) - ( casterBracketThickness / 2 ) ) );
	var casterBracketRightHubMesh = new THREE.Mesh( new THREE.CylinderGeometry( casterBracketHubRadius, casterBracketHubRadius, casterBracketThickness, 16 ), casterBracketMaterial );
	casterBracketBaseMesh.add( casterBracketRightHubMesh );
	casterBracketRightHubMesh.rotation.x = Math.PI / 2;
	casterBracketRightHubMesh.position.set( 0, -casterBracketShaftElevation, ( ( casterBracketWidth / 2 ) - ( casterBracketThickness / 2 ) ) );
	// ----- the caster axle shaft
	var casterShaftMesh = new THREE.Mesh( new THREE.CylinderGeometry( casterShaftRadius, casterShaftRadius, casterBracketWidth + 1, 16 ),
											new THREE.MeshPhongMaterial( { color:0x444444, specular:0xdddddd, metal:true } ) );
	casterShaftMesh.rotation.x = Math.PI / 2;
	casterBracketBaseMesh.add( casterShaftMesh );
	casterShaftMesh.position.set( 0, -casterBracketShaftElevation, 0 );
	// ---- the caster wheel
	// // - three images map to the 'tread' and 'sidewalls'
	// var casterWheelCircumferenceMaterial = new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/parts/makerbotFilamentReelSide.jpg' ) } );
	// var casterWheelRightSideMaterial = new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/parts/makerbotFilamentReelFront.jpg' ) } );
	// var casterWheelLeftSideMaterial = new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/parts/makerbotFilamentReelBack.jpg' ) } );
	// var casterWheelMaterialArray = [];
	// casterWheelMaterialArray.push( casterWheelCircumferenceMaterial );
	// casterWheelMaterialArray.push( casterWheelRightSideMaterial );
	// casterWheelMaterialArray.push( casterWheelLeftSideMaterial );
	// var casterWheelMaterial = new THREE.MeshFaceMaterial( casterWheelMaterialArray );
	// var casterWheelGeometry = new THREE.CylinderGeometry( casterWheelRadius, casterWheelRadius, casterWheelWidth, casterWheelNumberOfCircumferenceSegments );
	// var casterWheelMesh = new THREE.Mesh( casterWheelGeometry, casterWheelMaterial );
	// cylinderMeshUvForEndCapImages( casterWheelMesh, 3 );

	// - new version of wheel using picture of Elenco line tracking mouse wheel
	var casterWheelCircumferenceMaterial = new THREE.MeshLambertMaterial( { color:0x000000 } );
	var casterWheelSideMaterial = new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/parts/LTMouseWheel.jpg' ) } );
	var casterWheelMaterialArray = [];
	casterWheelMaterialArray.push( casterWheelCircumferenceMaterial );
	casterWheelMaterialArray.push( casterWheelSideMaterial );
	var casterWheelMaterial = new THREE.MeshFaceMaterial( casterWheelMaterialArray );
	var casterWheelGeometry = new THREE.CylinderGeometry( casterWheelRadius, casterWheelRadius, casterWheelWidth, casterWheelNumberOfCircumferenceSegments );
	var casterWheelMesh = new THREE.Mesh( casterWheelGeometry, casterWheelMaterial );
	cylinderMeshUvForEndCapImages( casterWheelMesh, 2 );


	casterWheelMesh.rollingRadius = casterWheelRadius;
	casterShaftMesh.add( casterWheelMesh );
	// Now add the above collection to the robot list
	casterObject.mesh = casterPlatformMesh;
	casterObject.meshBoundingRadius = 20;
	casterObject.centerHeight = casterWheelRadius + casterBracketShaftElevation + ( casterPlatformThickness / 2 );
	casterObject.stepAnimationCallback = casterMeshAnimate;
	robotObjectList.push( casterObject );
	// a blue ball spring-attached to the drag point
	var blueBalloonObject = new Object();
	blueBalloonObject.name = 'Blue balloon';
	blueBalloonObject.motiveMode = 'dragPointSpring';
	var blueBalloonMesh = new THREE.Mesh( new THREE.SphereGeometry( 10 ), new THREE.MeshLambertMaterial( { color: 0x6789ab } ) );
	blueBalloonObject.mesh = blueBalloonMesh;
	blueBalloonObject.meshBoundingRadius = 10;
	blueBalloonObject.centerHeight = 10;
	blueBalloonObject.stepAnimationCallback = blueBalloonMeshAnimate;
	robotObjectList.push( blueBalloonObject );
	// a beach ball rolling behind the drag point
	var beachBallObject = new Object();
	beachBallObject.name = 'Beach ball';
	beachBallObject.motiveMode = 'trackDragPoint';
	var beachBallMesh = new THREE.Mesh( new THREE.SphereGeometry( 10 ), new THREE.MeshLambertMaterial( { map:THREE.ImageUtils.loadTexture( 'image/parts/beachBallStripes.png' ) } ) );
	beachBallObject.mesh = beachBallMesh;
	beachBallObject.meshBoundingRadius = 10;
	beachBallObject.centerHeight = 10;
	beachBallObject.stepAnimationCallback = beachBallMeshAnimate;
	robotObjectList.push( beachBallObject );
	// a bizarrely colored wheel to try out rolling cylinder operation
	var lonelyWheelObject = new Object();
	lonelyWheelObject.name = 'Lonely wheel';
	lonelyWheelObject.motiveMode = 'trackDragPoint';
	var lonelyHubMesh = new THREE.Mesh( new THREE.SphereGeometry( 1 ), new THREE.MeshBasicMaterial() );
	var lonelyWheelMesh = new THREE.Mesh( new THREE.CylinderGeometry( 10, 10, 8, 8 ),
		new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/parts/cylinderTireImage.png' ) } ) );
	// old--lonelyWheelObject.mesh = lonelyWheelMesh;
	lonelyWheelObject.mesh = lonelyHubMesh;
	lonelyHubMesh.add( lonelyWheelMesh );
	lonelyWheelObject.meshBoundingRadius = 10;
	lonelyWheelObject.centerHeight = 10;
	lonelyWheelMesh.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
	lonelyWheelObject.stepAnimationCallback = lonelyWheelMeshAnimate;
	robotObjectList.push( lonelyWheelObject );
	// a flat piece of "cardboard" "flying" behind the drag point
	var flyingCardboardObject = new Object();
	flyingCardboardObject.name = 'Flying cardboard';
	flyingCardboardObject.motiveMode = 'trackDragPoint';
	var flyingCardboardMesh = new THREE.Mesh( new THREE.BoxGeometry( 30, 3, 15 ), new THREE.MeshLambertMaterial( { color: 0x987654 } ) );
	flyingCardboardObject.mesh = flyingCardboardMesh;
	flyingCardboardObject.meshBoundingRadius = 15;
	flyingCardboardObject.centerHeight = 10.0;
	flyingCardboardObject.stepAnimationCallback = flyingCardboardMeshAnimate;
	robotObjectList.push( flyingCardboardObject );
	// a piece of cardboard with "wings" that flap
	var wingedCardboardObject = new Object();
	wingedCardboardObject.name = 'Winged cardboard';
	wingedCardboardObject.motiveMode = 'trackDragPoint';
	var wingedCardboardMesh = new THREE.Mesh( new THREE.BoxGeometry( 30, 3, 15 ), new THREE.MeshLambertMaterial( { color: 0x987654 } ) );
	var leftWingCardboardMesh = new THREE.Mesh( new THREE.BoxGeometry( 10, 2, 5 ), new THREE.MeshLambertMaterial( { color: 0x113399 } ) );
	leftWingCardboardMesh.position.set( 0, 0, -10 );
	var rightWingCardboardMesh = new THREE.Mesh( new THREE.BoxGeometry( 15, 2, 5 ), new THREE.MeshLambertMaterial( { color: 0x2244cc } ) );
	rightWingCardboardMesh.position.set( 0, 0, 10 );
	wingedCardboardMesh.add( leftWingCardboardMesh );
	wingedCardboardMesh.add( rightWingCardboardMesh );
	wingedCardboardObject.mesh = wingedCardboardMesh;
	wingedCardboardObject.meshBoundingRadius = 15;
	wingedCardboardObject.centerHeight = 10.0;
	wingedCardboardObject.stepAnimationCallback = wingedCardboardMeshAnimate;
	robotObjectList.push( wingedCardboardObject );
	// a flying rectangle  trying to look like a sketch by Kenny in 1-3 grades
	var kennyRobotOneObject = new Object();
	kennyRobotOneObject.name = 'kenny Robot One';
	kennyRobotOneObject.motiveMode = 'trackDragPoint';
	var kennyRobotOneMesh = new THREE.Mesh( new THREE.BoxGeometry( 50, 4, 20 ), new THREE.MeshLambertMaterial( { color: 0x5973A2 } ) );
	var wideInsetMesh = new THREE.Mesh( new THREE.BoxGeometry( 4, 4.2, 7 ), new THREE.MeshLambertMaterial( { color: 0xCF5323 } ) );
	wideInsetMesh.position.set( 23.1, 0, 0 );
	var narrowInsetMesh = new THREE.Mesh( new THREE.BoxGeometry( 2.5, 4.2, 1.5 ), new THREE.MeshLambertMaterial( { color: 0xCF5323 } ) );
	narrowInsetMesh.position.set( 20, 0, 0 );
	kennyRobotOneMesh.add( wideInsetMesh );
	kennyRobotOneMesh.add( narrowInsetMesh );
	kennyRobotOneObject.mesh = kennyRobotOneMesh;
	kennyRobotOneObject.meshBoundingRadius = 25;
	kennyRobotOneObject.centerHeight = 10.0;
	kennyRobotOneObject.stepAnimationCallback = kennyRobotOneMeshAnimate;
	robotObjectList.push( kennyRobotOneObject );

	currentRobotIndex = 0;
}

function robotAnimationStepCallback() {
	if( needToshowRobotListWhenAvailable ) {
		// if( !backgroundAjaxExchangePending ) {
			needToshowRobotListWhenAvailable = false;
			makeRobotListBox();
		// }
	}
	pollRobotControls();
}

function robotAnimationRestartCallback(){
	// robotBody.position.copy( currentTrackLayoutStartingPoint );
	// robotBody.position.y += currentTrackType.width / 3;
}

function pauseBarClickCallback() {
	if( animationPaused ) {
		// animation is already paused so restart it
		playButton.deactivate();
		pauseButton.activate();
		animationPaused = false;
	} else {
		// pause the animation
		pauseButton.deactivate();
		playButton.activate();
		animationPaused = true;
	}
}

function brakeButtonClickedCallback() {
	vehicleInstantStop();
}

function initializeRobotControllerPanel(){
	// Controller panel
	robotControllerPanel = new robotControllerPanel( '0%', '0px', '100%', '25%' );
	robotControllerPanel.activate();

	// Pause/play button
	var pausePlayLeftPercent = 0.45;
	var pausePlayTopPercent = 0.6;
	var pausePlayWidthPercent = 0.1;
	var pausePlayHeightPercent = 0.4;
	pauseButton = new imageButton({
		imageFileName:'image/controls/pauseBars.png',
		leftPercent:pausePlayLeftPercent,
		topPercent:pausePlayTopPercent,
		widthPercent:pausePlayWidthPercent,
		heightPercent:pausePlayHeightPercent,
		preserveApect:'x',
		allowSlidingOn:false,
		clickedCallback:pauseBarClickCallback,
		hostElementId:'robotControllerPanel'
	});
	playButton = new imageButton({
		imageFileName:'image/controls/playWedge.png',
		leftPercent:pausePlayLeftPercent,
		topPercent:pausePlayTopPercent,
		widthPercent:pausePlayWidthPercent,
		heightPercent:pausePlayHeightPercent,
		preserveApect:'x',
		allowSlidingOn:false,
		clickedCallback:pauseBarClickCallback,
		hostElementId:'robotControllerPanel'
	});
	pauseButton.activate();
	animationPaused = false;

	// RestartAnimation button
	restartAnimationButton = new imageButton({
		imageFileName:'image/controls/restartAnimationArrow.png',
		leftPercent:pausePlayLeftPercent,
		topPercent:0.0,
		widthPercent:pausePlayWidthPercent,
		heightPercent:pausePlayHeightPercent,
		preserveApect:'x',
		allowSlidingOn:false,
		clickedCallback:restartAnimation,
		hostElementId:'robotControllerPanel'
	});
	restartAnimationButton.activate();

	// brake ('STOP') button
	brakeButton = new imageButton({
		imageFileName: 'image/controls/stopSign.png',
		leftPercent: 0.7,
		topPercent: 0.35,
		widthPercent: 0.3,
		heightPercent: 0.3,
		preserveApect: 'W',
		allowSlidingOn: true,
		clickedCallback: brakeButtonClickedCallback,
		hostElementId: 'robotControllerPanel'
	});
	brakeButton.activate();

	// Joy sticks
	leftJoyStick = new joyStick(
		{
		hostElementId:'robotControllerPanel',
		controlLeftPercent:0.0,
		controlTopPercent:0.0,
		controlWidthPercent:0.35,
		controlHeightPercent:1.0,
		stickWidthPercent:0.25,
		stickHeightPercent:0.25,
		preserveAspect:false,
		allowSlidingOn:true,
		initialHorizontalPosition:0.5,
		initialVerticalPosition:0.5
		}
	);
	leftJoyStick.activate();
/* drop the right joystick for now (Feb 11, '16)
	rightJoyStick = new joyStick(
		{
		hostElementId:'robotControllerPanel',
		controlLeftPercent:0.65,
		controlTopPercent:0.0,
		controlWidthPercent:0.35,
		controlHeightPercent:1.0,
		stickWidthPercent:0.25,
		stickHeightPercent:0.25,
		preserveAspect:false,
		allowSlidingOn:true,
		initialHorizontalPosition:0.5,
		initialVerticalPosition:0.5
		}
	);
	rightJoyStick.activate();
*/
}

function pollRobotControls() {
	if( leftJoyStick.buttonDown ) {
		// While the left joystick is being pressed, continuously apply speed and direction inputs to the vehicle
		currentSteeringValue = ( 0.5 - leftJoyStick.currentXValue ) * fullSteeringValue;
		currentEngineForceValue = ( leftJoyStick.currentYValue - 0.5 ) * fullEngineForceValue;
		// currentEngineForceValue = ( 0.5 - leftJoyStick.currentYValue ) * fullEngineForceValue;
		carVehicle.applyEngineForce(currentEngineForceValue, rightRearWheelIndex);
		carVehicle.applyEngineForce(currentEngineForceValue, leftRearWheelIndex);
		carVehicle.setSteeringValue(currentSteeringValue, rightFrontWheelIndex);
		carVehicle.setSteeringValue(currentSteeringValue, leftFrontWheelIndex);
	}
}

function enableDragPointSpring() {
	if( !dragPointSpringIsInPlace ) {
		world.addEventListener( "postStep", function( event ) { dragPointSpring.applyForce(); } );
		dragPointSpringIsInPlace = true;
	}
}

function disableDragPointSpring() {
	if( dragPointSpringIsInPlace ) {
		world.addEventListener( "postStep", function( event ) { dragPointSpring.applyForce(); } );
		dragPointSpringIsInPlace = false;
	}
}


//Debug - eventually this will develop into db-based robots a la choosing background, track type, etc. ....
function chooseRobot() {
	// in the meantime, we've got a hard-wired list...
}
// // Choosing a track layout is a three-step process:
// //  1) get the list of all track layouts via ajax exchange with the server database
// function chooseTrackLayout() {
// 	trackLayoutAjaxFunctionSent = 'get_track_layout_list';
// 	trackLayoutAjaxExchangePending = true;
// 	ajaxExchange( trackLayoutAjaxFunctionSent, 0, 0, trackLayoutAjaxCallback );
// }

//  2) put the list into the screen the user can see it
function makeRobotListBox() {
	globalListBox = new listBox({
		itemClickedCallback:selectRobotItemClickedCallback
	});
	for( var i = 0; i < robotObjectList.length; i++ ) {
		globalListBox.addItem( robotObjectList[ i ].name, i )
	}
}

//  3) each time the user clicks on an item on the list, get and install that track layout
function selectRobotItemClickedCallback( robotListItemObject ) {
	if( robotListItemObject.value  == -1 ) {
		enableChooseButtons();
		globalListBox.dispose();
	} else {
		getNewRobot( robotListItemObject.value );
	}
}

function getNewRobot( robotDbId ) {
	selectCurrentRobot( robotDbId );
	//.... eventually:
	// trackLayoutAjaxFunctionSent = 'get_track_layout';
	// trackLayoutAjaxExchangePending = true;
	// ajaxExchange( trackLayoutAjaxFunctionSent, trackLayoutDbId, 0, trackLayoutAjaxCallback );
}


function selectCurrentRobot( newMeshIndex ) {
	// remove the current robot mesh from the scene
	scene.remove( currentRobotMesh );
	// change to the new robot mesh and add it to the scene
	currentRobotIndex = newMeshIndex;
	currentRobotMesh = robotObjectList[ currentRobotIndex ].mesh;
	robotBody.shapes[ 0 ].radius = robotObjectList[ currentRobotIndex ].meshBoundingRadius;
	robotBody.updateBoundingRadius();
	currentRobotMotiveMode = robotObjectList[ currentRobotIndex ].motiveMode;
	scene.add( currentRobotMesh );
}

function updateRobotPosition() {
	switch( currentRobotMotiveMode ) {
		case 'dragPointSpring':
			currentDragPointBody.position.copy( dragPoints[ currentDragPoint ].location );
			break;
		case 'trackDragPoint':
			var dragPointToUse = offsetDragPointIndex();
			robotBody.position.x = dragPoints[ dragPointToUse ].location.x;
			robotBody.position.y = dragPoints[ dragPointToUse ].location.y + robotObjectList[ currentRobotIndex ].centerHeight ;
			robotBody.position.z = dragPoints[ dragPointToUse ].location.z;
			break;
		default:
			break;
	}
}

function animateRobotAssembly() {
	robotObjectList[ currentRobotIndex ].stepAnimationCallback();
}

function animateMeshDragPointRolling( meshToRoll, meshRadius, rollingAxis ) {
	var pitchRotationAngleAtLastPoint, pitchRotationAngleForThisStep, newPitchRotationAngle;
	// we want the mesh to roll along the track so...
	//	(... note that "rolling forward" is a matter of increasingly negative pitch angle...)
	// 1) save the previous mesh-centric rolling rotation angle
	// old--pitchRotationAngleAtLastPoint = robotObjectList[ currentRobotIndex ].mesh.rotation.z;
	switch( rollingAxis ) {
		case 'x':
			pitchRotationAngleAtLastPoint = meshToRoll.rotation.x;
			break;
		case 'y':
			pitchRotationAngleAtLastPoint = meshToRoll.rotation.y;
			break;
		case 'z':
			pitchRotationAngleAtLastPoint = meshToRoll.rotation.z;
			break;
		default:
			alert('hit default in switch in animateMeshDragPointRolling');
			break;
	}
	// 2) orient the (un-rotated) mesh to the current track small piece's orientation and then
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	meshToRoll.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	// 3) take the distance moved along the track and rotate the mesh to match the mesh's circumference arc to that distance
	// old--pitchRotationAngleForThisStep = -( dragPointLastStepDistance / robotObjectList[ currentRobotIndex ].mesh.geometry.boundingSphere.radius );
	pitchRotationAngleForThisStep = -( dragPointLastStepDistance / meshRadius );
	newPitchRotationAngle = pitchRotationAngleAtLastPoint + pitchRotationAngleForThisStep;
	while( newPitchRotationAngle < ( -2 * Math.PI ) ) {
		newPitchRotationAngle += ( 2 * Math.PI );
	}
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.z += newPitchRotationAngle;
	switch( rollingAxis ) {
		case 'x':
			meshToRoll.rotation.x += newPitchRotationAngle;
			break;
		case 'y':
			meshToRoll.rotation.y += newPitchRotationAngle;
			break;
		case 'z':
			meshToRoll.rotation.z += newPitchRotationAngle;
			break;
		default:
			alert('hit default in switch2 in animateMeshDragPointRolling');
			break;
	}
}

function animateMeshDragPointTracking( meshToDrag ) {
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	meshToDrag.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
}

function casterMeshAnimate() {
	animateMeshDragPointTracking( robotObjectList[ currentRobotIndex ].mesh );
	var wheelMesh = robotObjectList[ currentRobotIndex ].mesh.children[ 0 ].children[ 4 ].children[ 0 ];
	animateMeshDragPointRolling( wheelMesh, wheelMesh.rollingRadius, 'y' );
}

function blueBalloonMeshAnimate() {
}

function beachBallMeshAnimate() {
	// animateMeshDragPointRolling( beachBallMesh );
	animateMeshDragPointRolling( robotObjectList[ currentRobotIndex ].mesh, 10, 'z' );
}

function lonelyWheelMeshAnimate() {
	// animateMeshDragPointRolling( lonelyWheelMesh );
	animateMeshDragPointRolling( robotObjectList[ currentRobotIndex ].mesh, 10, 'z' );
}

function flyingCardboardMeshAnimate() {
	// animateMeshDragPointTracking( flyingCardboardMesh );
	animateMeshDragPointTracking( robotObjectList[ currentRobotIndex ].mesh );
}

function wingedCardboardMeshAnimate() {
	// animateMeshDragPointTracking( wingedCardboardMesh );
	animateMeshDragPointTracking( robotObjectList[ currentRobotIndex ].mesh );
}

function kennyRobotOneMeshAnimate() {
	// animateMeshDragPointTracking( kennyRobotOneMesh );
	animateMeshDragPointTracking( robotObjectList[ currentRobotIndex ].mesh );
}



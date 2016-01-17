/* robot.js

Select and specify a variety of robots

*/

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

function initializeRobots() {
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

	// create a contact material to allow the robot body material to respond to the track material
	robotTrackMaterialContactEquation = new CANNON.ContactMaterial( robotBodyMaterial, trackBodyMaterial, { friction: 0, restitution: 0.0 } );
	world.addContactMaterial( robotTrackMaterialContactEquation );

	// create array of robot definitions
	robotObjectList = [];
	var blueBalloonObject = new Object();
	blueBalloonObject.name = 'Blue balloon';
	blueBalloonObject.motiveMode = 'dragPointSpring';
	var blueBalloonMesh = new THREE.Mesh( new THREE.SphereGeometry( 10 ), new THREE.MeshLambertMaterial( { color: 0x6789ab } ) );
	blueBalloonObject.mesh = blueBalloonMesh;
	blueBalloonObject.meshBoundingRadius = 10;
	blueBalloonObject.centerHeight = 10;
	blueBalloonObject.stepAnimationCallback = blueBalloonMeshAnimate;
	robotObjectList.push( blueBalloonObject );
	var beachBallObject = new Object();
	beachBallObject.name = 'Beach ball';
	beachBallObject.motiveMode = 'trackDragPoint';
	var beachBallMesh = new THREE.Mesh( new THREE.SphereGeometry( 10 ), new THREE.MeshLambertMaterial( { map:THREE.ImageUtils.loadTexture( 'image/beachBallStripes.png' ) } ) );
	beachBallObject.mesh = beachBallMesh;
	beachBallObject.meshBoundingRadius = 10;
	beachBallObject.centerHeight = 10;
	beachBallObject.stepAnimationCallback = beachBallMeshAnimate;
	robotObjectList.push( beachBallObject );
	var lonelyWheelObject = new Object();
	lonelyWheelObject.name = 'Lonely wheel';
	lonelyWheelObject.motiveMode = 'trackDragPoint';
	var lonelyHubMesh = new THREE.Mesh( new THREE.SphereGeometry( 1 ), new THREE.MeshBasicMaterial() );
	var lonelyWheelMesh = new THREE.Mesh( new THREE.CylinderGeometry( 10, 10, 8, 8 ),
		new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture( 'image/cylinderTireImage.png' ) } ) );
	// old--lonelyWheelObject.mesh = lonelyWheelMesh;
	lonelyWheelObject.mesh = lonelyHubMesh;
	lonelyHubMesh.add( lonelyWheelMesh );
	lonelyWheelObject.meshBoundingRadius = 10;
	lonelyWheelObject.centerHeight = 10;
	lonelyWheelMesh.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
	lonelyWheelObject.stepAnimationCallback = lonelyWheelMeshAnimate;
	robotObjectList.push( lonelyWheelObject );
	var flyingCardboardObject = new Object();
	flyingCardboardObject.name = 'Flying cardboard';
	flyingCardboardObject.motiveMode = 'trackDragPoint';
	var flyingCardboardMesh = new THREE.Mesh( new THREE.BoxGeometry( 30, 3, 15 ), new THREE.MeshLambertMaterial( { color: 0x987654 } ) );
	flyingCardboardObject.mesh = flyingCardboardMesh;
	flyingCardboardObject.meshBoundingRadius = 15;
	flyingCardboardObject.centerHeight = 10.0;
	flyingCardboardObject.stepAnimationCallback = flyingCardboardMeshAnimate;
	robotObjectList.push( flyingCardboardObject );
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
	globalListBox = new listBox( selectRobotItemClickedCallback );
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

function animateMeshDragPointRolling( meshToRoll ) {
	var pitchRotationAngleAtLastPoint, pitchRotationAngleForThisStep, newPitchRotationAngle;
	// we want the mesh to roll along the track so...
	//	(... note that "rolling forward" is a matter of increasingly negative pitch angle...)
	// 1) save the previous mesh-centric rolling rotation angle
	// old--pitchRotationAngleAtLastPoint = robotObjectList[ currentRobotIndex ].mesh.rotation.z;
	pitchRotationAngleAtLastPoint = meshToRoll.rotation.z;
	// 2) orient the (un-rotated) mesh to the current track small piece's orientation and then
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	meshToRoll.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	// 3) take the distance moved along the track and rotate the mesh to match the mesh's circumference arc to that distance
	// old--pitchRotationAngleForThisStep = -( dragPointLastStepDistance / robotObjectList[ currentRobotIndex ].mesh.geometry.boundingSphere.radius );
	pitchRotationAngleForThisStep = -( dragPointLastStepDistance / meshToRoll.geometry.boundingSphere.radius );
	newPitchRotationAngle = pitchRotationAngleAtLastPoint + pitchRotationAngleForThisStep;
	while( newPitchRotationAngle < ( -2 * Math.PI ) ) {
		newPitchRotationAngle += ( 2 * Math.PI );
	}
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.z += newPitchRotationAngle;
	meshToRoll.rotation.z += newPitchRotationAngle;
}

function animateMeshDragPointTracking( meshToDrag ) {
	// old--robotObjectList[ currentRobotIndex ].mesh.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
	meshToDrag.rotation.copy( trackSmallPieces[ offsetDragPointIndex() ].orientationEuler );
}

function blueBalloonMeshAnimate() {
}

function beachBallMeshAnimate() {
	// animateMeshDragPointRolling( beachBallMesh );
	animateMeshDragPointRolling( robotObjectList[ currentRobotIndex ].mesh );
}

function lonelyWheelMeshAnimate() {
	// animateMeshDragPointRolling( lonelyWheelMesh );
	animateMeshDragPointRolling( robotObjectList[ currentRobotIndex ].mesh );
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



/* rendering.js */

var visibleAxes;
var camera, renderer, scene, xLight, yLight, zLight, xMinusLight, yMinusLight, zMinusLight;
var orbitControls;
var cameraLookingAtVector = new THREE.Vector3(), cameraMoveVector = new THREE.Vector3();
var cameraFollowDisplacement = new THREE.Vector3(), cameraRobotDisplacement = new THREE.Vector3();
var cameraPositioningMode, cameraTetherLength, cameraForwardViewDistance;

function initializeRendering() {
	animationStepCallbackList.push('renderingAnimationStepCallback');
	animationRestartCallbackList.push('renderingAnimationRestartCallback');
	camera = new THREE.PerspectiveCamera( 50, 1.3, 1, 10000 );
	camera.position.set( 50, 100, 200 );
	camera.lookAt(new THREE.Vector3(0,0,0));
	// renderer = new THREE.WebGLRenderer();
	renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
	renderer.domElement.id = "rendererDomElement";
	document.body.appendChild( renderer.domElement );
	xLight = new THREE.DirectionalLight( 0xffffff );
	xLight.position.set( 1, 0, 0 ).normalize();
	scene.add( xLight );
	xMinusLight = new THREE.DirectionalLight( 0xffffff );
	xMinusLight.position.set( -1, 0, 0 ).normalize();
	scene.add( xMinusLight );
	yLight = new THREE.DirectionalLight( 0xffffff );
	yLight.position.set( 0, 1, 0 ).normalize();
	scene.add( yLight );
	yMinusLight = new THREE.DirectionalLight( 0xffffff );
	yMinusLight.position.set( 0, -1, 0 ).normalize();
	scene.add( yMinusLight );
	zLight = new THREE.DirectionalLight( 0xffffff );
	zLight.position.set( 0, 0, 1 ).normalize();
	scene.add( zLight );
	zMinusLight = new THREE.DirectionalLight( 0xffffff );
	zMinusLight.position.set( 0, 0, -1 ).normalize();
	scene.add( zMinusLight );
	caDebugOutliner = new THREE.CannonDebugRenderer( scene, world );
	orbitControls = new THREE.OrbitControls( camera );
}

function renderingAnimationStepCallback() {
	render();
}

function renderingAnimationRestartCallback() {
	render();
}

function render() {
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.updateProjectionMatrix();
	renderer.render( scene, camera );
}

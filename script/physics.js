/* physics.js */

var outlineBodies = false;
var caDebugOutliner;
var world, timeStep = 1/60;

function initializePhysics() {
	animationStepCallbackList.push('physicsAnimationStepCallback');
	animationRestartCallbackList.push('physicsAnimationRestartCallback');
	world.gravity.set( 0, -9.8, 0 );
	world.broadphase = new CANNON.NaiveBroadphase();
}

function physicsAnimationStepCallback() {
	// visibleRobotBodyOrientationVector.update( currentRobotMesh );
	// caDebugOutliner.update();
	if( animationPaused ) return;
	world.step( timeStep );
}

function physicsAnimationRestartCallback(){
}

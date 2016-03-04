/* animation.js */

// Routines to be called for each animation step
var animationStepCallbackList = [];
// Routines to be called to reset the animation
var animationRestartCallbackList = [];
// Pairs of meshes with bodies where the mesh position/quaternion needs to follow that of the body
var animationBodyMeshPairs = [];

// var pauseButton, playButton, restartAnimationButton;
var animationPaused = false;
var frameCount;

function initializeAnimation(){
	frameCount = 0;
}

function animate() {
	requestAnimationFrame( animate );
	for(var i = 0; i < animationStepCallbackList.length; i++)
		window[animationStepCallbackList[i]]();
	frameCount++;
	for(var i = 0; i < animationBodyMeshPairs.length; i++){
		animationBodyMeshPairs[i].mesh.position.copy(animationBodyMeshPairs[i].body.position);
		animationBodyMeshPairs[i].mesh.quaternion.copy(animationBodyMeshPairs[i].body.quaternion);
	}
}

function restartAnimation() {
	for(var i = 0; i < animationRestartCallbackList.length; i++)
		window[animationRestartCallbackList[i]]();
}

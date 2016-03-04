/* vehicle.js */

var carChassisShape, carChassisBody, carChassisMesh = null
var carChassisInitialPosition = new CANNON.Vec3(), carChassisInitialQuaternion = new CANNON.Quaternion(), carChassisInitialVelocity = new CANNON.Vec3(), carChassisInitialAngularVelocity = new CANNON.Vec3();
var carChassisMass = 150;
var carVehicle;
var wheelShape, wheelGeometry, wheelMaterial;
var wheelBodies = [];
var wheelMeshes = [];
var rightFrontWheelIndex = 0;
var leftFrontWheelIndex = 1;
var rightRearWheelIndex = 2;
var leftRearWheelIndex = 3;
var carChassisLength = 15, carChassisWidth = 5, carChassisHeight = 1;
var wheelRadius = 2, wheelWidth = 0.3;
var carWheelBase = carChassisLength - (2*wheelRadius), carTrack = carChassisWidth + wheelWidth;
var fullSteeringValue = 0.9, currentSteeringValue = 0;
var fullEngineForceValue = 3000, currentEngineForceValue = 0;
var brakingForce = 1000000;
var instantStopBrakesAreOn = false;


function initializeVehicle(){
	animationStepCallbackList.push('vehicleAnimationStepCallback');
	animationRestartCallbackList.push('vehicleAnimationRestartCallback');
	// Cannon 'raycastvehicle'
	// car body
	carChassisShape = new CANNON.Box(new CANNON.Vec3( carChassisLength/2, carChassisHeight/2, carChassisWidth/2));
	carChassisBody = new CANNON.Body({mass:carChassisMass});
	carChassisBody.addShape(carChassisShape);
	carChassisBody.position.set(0, 5, 0);
	carChassisInitialPosition.copy(carChassisBody.position);
	carChassisInitialQuaternion.copy(carChassisBody.quaternion);
	carChassisInitialVelocity.copy(carChassisBody.velocity);
	carChassisInitialAngularVelocity.copy(carChassisBody.angularVelocity);
	var wheelOptions = {
		radius: wheelRadius,
		directionLocal: new CANNON.Vec3(0, -1, 0),
		suspensionStiffness: 30,
		suspensionRestLength: 0.7 * carChassisHeight / 2,
		frictionSlip: 5,
		dampingRelaxation: 2.3,
		dampingCompression: 4.4,
		maxSuspensionForce: 100000,
		rollInfluence: 0.01,
		axleLocal: new CANNON.Vec3(0, 0, 1),
		chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
		maxSuspensionTravel: 0.3,
		customSlidingRotationalSpeed: -30,
		useCustomSlidingRotationalSpeed: true
	}
	carVehicle = new CANNON.RaycastVehicle({chassisBody:carChassisBody, indexForwardAxis:0, indexRightAxis:2, indexUpAxis:1});
	// Wheel 0 is right front
	wheelOptions.chassisConnectionPointLocal.set(1.1*carWheelBase/2, 0, carTrack/2);
	carVehicle.addWheel(wheelOptions);
	// Wheel 1 is left front
	wheelOptions.chassisConnectionPointLocal.set(1.1*carWheelBase/2, 0, -carTrack/2);
	carVehicle.addWheel(wheelOptions);
	// Wheel 2 is right rear
	wheelOptions.chassisConnectionPointLocal.set(-carWheelBase/2, 0, carTrack/2);
	carVehicle.addWheel(wheelOptions);
	// Wheel 3 is left rear
	wheelOptions.chassisConnectionPointLocal.set(-carWheelBase/2, 0, -carTrack/2);
	carVehicle.addWheel(wheelOptions);
	carVehicle.addToWorld(world);
	for(var i=0; i<carVehicle.wheelInfos.length; i++) {
		var wheel = carVehicle.wheelInfos[i];
		var wheelShape = new CANNON.Cylinder( wheelRadius, wheelRadius, wheelWidth, 20);
		var wheelBody = new CANNON.Body({mass:0});
		wheelBody.type = CANNON.Body.KINEMATIC;
		wheelBody.collisionFilterGroup = 0;
		wheelBody.addShape(wheelShape);
		wheelBodies.push(wheelBody);
		world.addBody(wheelBody);
	}
	world.addEventListener('postStep', function(){
		for(var i = 0; i < carVehicle.wheelInfos.length; i++ ) {
			carVehicle.updateWheelTransform(i);
			var t = carVehicle.wheelInfos[i].worldTransform;
			var wheelBody = wheelBodies[i];
			wheelBody.position.copy(t.position);
			wheelBody.quaternion.copy(t.quaternion);
		}
	})
	// car mesh
	// ... a main car chassis mesh to match the car chassis body
	var carChassisGeometry = new THREE.BoxGeometry(carChassisLength, carChassisHeight, carChassisWidth);
	var carChassisMaterial = new THREE.MeshPhongMaterial({color:0x444444, specular:0xdddddd, metal:true});
	carChassisMesh = new THREE.Mesh(carChassisGeometry, carChassisMaterial);
	// ... car passenger section
	var carPassengerSectionGeometry = new THREE.CylinderGeometry( carChassisWidth/2, carChassisWidth/2, carChassisLength, 32 );
	var carPassengerSectionMaterial = new THREE.MeshPhongMaterial({color:0x445566, specular:0xddeeff, metal:true});
	var carPassengerSectionMesh = new THREE.Mesh(carPassengerSectionGeometry, carPassengerSectionMaterial);
	carPassengerSectionMesh.position.set(0,carChassisWidth/2,0);
	carPassengerSectionMesh.rotation.z = -Math.PI/2;
	// ... a car nose section
	var carNoseGeometry = new THREE.SphereGeometry( carChassisWidth/2 * 1.1, 32, 32 );
	var carNoseMaterial = new THREE.MeshPhongMaterial({color:0x446655, specular:0xddffee, metal:true});
	var carNoseMesh = new THREE.Mesh(carNoseGeometry, carNoseMaterial);
	carNoseMesh.position.set( carChassisLength / 2, carChassisWidth/2, 0 );
	// ... a car tail section
	var carTailGeometry = new THREE.CylinderGeometry( 0, carChassisWidth/2, carChassisLength/2, 32 );
	var carTailMaterial = new THREE.MeshPhongMaterial({color:0x774433, specular:0xffddaa, metal:true});
	var carTailMesh = new THREE.Mesh(carTailGeometry, carTailMaterial);
	carTailMesh.rotation.z = Math.PI/2;
	carTailMesh.position.set( -carChassisLength * ( 3/4 ), carChassisWidth/2, 0 );
	// ... put them all together .....
	// carMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
	carChassisMesh.add(carPassengerSectionMesh);
	carChassisMesh.add(carNoseMesh);
	carChassisMesh.add(carTailMesh);
	scene.add(carChassisMesh);
	// wheel meshes
	wheelGeometry = new THREE.CylinderGeometry( wheelRadius, wheelRadius, wheelWidth, 32 );
	wheelMaterial = new THREE.MeshLambertMaterial({color:0x223344});
	for(var i = 0; i < carVehicle.wheelInfos.length; i++) {
		var wheelVisibleMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
		wheelVisibleMesh.rotation.x = -Math.PI/2;
		wheelOrientationMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
		wheelOrientationMesh.add( wheelVisibleMesh );
		wheelMeshes.push( wheelOrientationMesh );
		scene.add(wheelOrientationMesh);
	}
	// push the body mesh pairs to be updated each animation step
	var carChassisPair = {};
	carChassisPair.body = carChassisBody;
	carChassisPair.mesh = carChassisMesh;
	animationBodyMeshPairs.push(carChassisPair);
	for(var i = 0; i < carVehicle.wheelInfos.length; i++){
		var wheelPair = {};
		wheelPair.body = wheelBodies[i];
		wheelPair.mesh = wheelMeshes[i];
		animationBodyMeshPairs.push(wheelPair);
	}
}

function vehicleInstantStop(){
	carVehicle.applyEngineForce(0, rightRearWheelIndex);
	carVehicle.applyEngineForce(0, leftRearWheelIndex);
	carVehicle.setSteeringValue(0, rightFrontWheelIndex);
	carVehicle.setSteeringValue(0, leftFrontWheelIndex);
	instantStopBrakesAreOn = true;
	setVehicleBrakingTo(brakingForce);

}

function setVehicleBrakingTo(brakeForce){
	for(var i = 0; i < carVehicle.wheelInfos.length; i++){
		carVehicle.setBrake(brakeForce, i);
	}
}

function vehicleAnimationStepCallback(){
	if(instantStopBrakesAreOn){
		if(carChassisBody.velocity.almostZero(0.1)){
			setVehicleBrakingTo(0);
		}
	}
}

function vehicleAnimationRestartCallback(){
	carChassisBody.position.copy(carChassisInitialPosition);
	carChassisBody.quaternion.copy(carChassisInitialQuaternion);
	carChassisBody.velocity.copy(carChassisInitialVelocity);
	carChassisBody.angularVelocity.copy(carChassisInitialAngularVelocity);
	carVehicle.applyEngineForce(0, rightRearWheelIndex);
	carVehicle.applyEngineForce(0, leftRearWheelIndex);
	carVehicle.setSteeringValue(0, rightFrontWheelIndex);
	carVehicle.setSteeringValue(0, leftFrontWheelIndex);
}
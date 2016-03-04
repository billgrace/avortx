/* terrain.js */

var terrainBodies = [];
var terrainMeshes = [];
var terrainInitialPositions = [];
var terrainInitialQuaternions = [];
var terrainInitialVelocities = [];
var terrainInitialAngularVelocities = [];

var groundPlaneMesh, groundPlaneBody, groundPlaneGeometry, groundPlaneShape, groundPlaneMaterial;

var floorShape, floorBody, floorGeometry, floorMaterial, floorMesh = null;
var floorHeightFieldRowArray = [];
var floorTextureImage;
var floorBoxThickness=0.1;
var floorWidthGridLineCount = 101, floorLengthGridLineCount = 101;
var floorWidthGridAreaCount = floorWidthGridLineCount - 1;
var floorLengthGridAreaCount = floorLengthGridLineCount - 1;
var floorWidthGridPixelSpacing = 2, floorLengthGridPixelSpacing = 2;
var floorPixelWidth = floorWidthGridAreaCount * floorWidthGridPixelSpacing;
var floorPixelLength = floorLengthGridAreaCount * floorLengthGridPixelSpacing;

function initializeTerrain(){
	animationStepCallbackList.push('terrainAnimationStepCallback');
	animationRestartCallbackList.push('terrainAnimationRestartCallback');
	addBathtubShapedTerrain();
	addEscapeRamp();
	addBarrierWall();
	addBall();
	addTree();
}

function terrainAnimationStepCallback() {
	for(var i = 0; i < terrainBodies.length; i++) {
		terrainMeshes[i].position.copy(terrainBodies[i].position);
		terrainMeshes[i].quaternion.copy(terrainBodies[i].quaternion);
	}
}

function terrainAnimationRestartCallback(){
	for(var i = 0; i < terrainBodies.length; i++){
		terrainBodies[i].position.copy(terrainInitialPositions[i]);
		terrainBodies[i].quaternion.copy(terrainInitialQuaternions[i]);
		terrainBodies[i].velocity.copy(terrainInitialVelocities[i]);
		terrainBodies[i].angularVelocity.copy(terrainInitialAngularVelocities[i]);
	}
}

function terrainPushObject( body, mesh ){
	terrainBodies.push(body);
	terrainMeshes.push(mesh);
	var initialPosition = new CANNON.Vec3();
	var initialQuaternion = new CANNON.Quaternion();
	var initialVelocity = new CANNON.Vec3();
	var initialAngularVelocity = new CANNON.Vec3();
	initialPosition.copy(body.position);
	initialQuaternion.copy(body.quaternion);
	initialVelocity.copy(body.velocity);
	initialAngularVelocity.copy(body.angularVelocity);
	terrainInitialPositions.push(initialPosition);
	terrainInitialQuaternions.push(initialQuaternion);
	terrainInitialVelocities.push(initialVelocity);
	terrainInitialAngularVelocities.push(initialAngularVelocity);
}

function addBathtubShapedTerrain(){
	floorTextureImage = THREE.ImageUtils.loadTexture('image/terrains/concrete.jpg');
	// floor
	floorHeightFieldRowArray = [];
	for(var i=0;i<floorLengthGridLineCount;i++){
		floorHeightFieldRowArray.push([]);
		for(var j=0;j<floorWidthGridLineCount;j++){
			// // height map style #1 = sinusoidal example from Cannon.js
			// var height = 5 * Math.cos(i/floorWidthGridLineCount * Math.PI * 2) * Math.cos(j/floorWidthGridLineCount * Math.PI * 2) + 2;
			// if(i === 0 || i === floorLengthGridLineCount - 1 || j === 0 || j === floorWidthGridLineCount - 1 )
			//   height = 3;
			// // height map style #2 = slope flat plane
			// var height = i + j;

			// height map style #3 = flat plane in center surrounded by a "rounded up" border
			// - from quadratic equation we get height in non-corner border areas as:
			// - - borderWidth - sqrt( borderWidth^2 - distanceIntoBorder^2 )
			// - in corners, we use the distance from the corner of flat central area and clip the height where that distance
			// - - goes beyond the border thickness
			var borderWidth = 20;
			var distanceIntoBorder = 0;
			if(i < borderWidth) {
				// in the 'left' border
				if(j < borderWidth) {
					// in the border's 'bottom left corner' (-X, +Z in Three)
					distanceIntoBorder = Math.sqrt((borderWidth - i)*(borderWidth - i) +
				                                (borderWidth - j)*(borderWidth - j));
				} else if(j > (floorWidthGridLineCount - borderWidth)) {
					// in the border's 'top left corner' (-X, -Z in Three)
					distanceIntoBorder = Math.sqrt((borderWidth - i)*(borderWidth - i) +
				                                  (j + borderWidth + 1 - floorWidthGridLineCount)*(j + borderWidth + 1 - floorWidthGridLineCount));
				} else {
					// in the 'left' border's non-corner extent (-X in Three)
					distanceIntoBorder = borderWidth - i;
				}
			} else if(i > (floorLengthGridLineCount - borderWidth)) {
				// in the 'right' border
				if(j < borderWidth) {
					// in the border's 'bottom right corner' (+X, +Z in Three)
					distanceIntoBorder = Math.sqrt((i + borderWidth + 1 - floorLengthGridLineCount)*(i + borderWidth + 1 - floorLengthGridLineCount) +
				                                (borderWidth - j)*(borderWidth - j));
				} else if(j > (floorWidthGridLineCount - borderWidth)) {
					// in the border's 'top right corner' (+X, -Z in Three)
					distanceIntoBorder = Math.sqrt((i + borderWidth + 1 - floorLengthGridLineCount)*(i + borderWidth + 1 - floorLengthGridLineCount) +
				                                  (j + borderWidth + 1 - floorWidthGridLineCount)*(j + borderWidth + 1 - floorWidthGridLineCount));
				} else {
					// in the 'left' border's non-corner extent (+X in Three)
					distanceIntoBorder = i + borderWidth + 1 - floorLengthGridLineCount;
				}
			} else if(j < borderWidth) {
				// in the 'bottom' border's non-corner extent (+Z in Three)
				distanceIntoBorder = borderWidth - j;
			} else if(j > (floorWidthGridLineCount - borderWidth)) {
				// in the 'top' border's non-corner extent (-Z in Three)
				distanceIntoBorder = j + borderWidth + 1 - floorWidthGridLineCount;
			} else {
				// not in the border area so distanceIntoBorder remains at default 0 => height = 0
			}
			if(distanceIntoBorder >= borderWidth) {
				var height = borderWidth;
			} else {
				var height = borderWidth - Math.sqrt(borderWidth*borderWidth - distanceIntoBorder*distanceIntoBorder);
			}
			floorHeightFieldRowArray[i].push(height);
		}
	}
	floorShape = new CANNON.Heightfield(floorHeightFieldRowArray,{elementSize:floorLengthGridPixelSpacing});
	floorBody = new CANNON.Body({mass:0});
	floorBody.addShape(floorShape);
	floorBody.shapeOrientations[0].setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI * 0.5);
	floorBody.position.set( -floorLengthGridAreaCount * floorLengthGridPixelSpacing / 2, 0, floorWidthGridAreaCount * floorWidthGridPixelSpacing / 2 );
	// floorBody.position.set( -floorLengthGridAreaCount * floorLengthGridPixelSpacing / 2, -floorWidthGridAreaCount * floorWidthGridPixelSpacing / 2, 0 );
	world.addBody(floorBody);

	// floor mesh
	// the plane has dimensions of "Length" along the X axis and "Width" along the Y axis
	floorGeometry = new THREE.PlaneGeometry( floorPixelLength, floorPixelWidth, floorLengthGridAreaCount, floorWidthGridAreaCount );
	// floorMaterial = new THREE.MeshBasicMaterial({color:0xbb8855, side:THREE.DoubleSide});
	// floorMaterial = new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true});
	floorMaterial = new THREE.MeshBasicMaterial({map:floorTextureImage, side:THREE.DoubleSide});

	// now pass over the plane mesh geometry and adjust the Z values of each vertex to match the Cannon height field body
	for(var ypos=0;ypos<floorWidthGridLineCount;ypos++){
		// vertically traversing the XY plane in horizontal strips beginning with the highest one (most +ve Y value)
		for(var xpos=0;xpos<floorLengthGridLineCount;xpos++){
			// horizontally traversing individual elements in each horizontal strip from left to right (-ve X to +ve X)
			var meshGeometryVertexIndex = ypos*floorLengthGridLineCount + xpos;
			floorGeometry.vertices[meshGeometryVertexIndex].z = floorHeightFieldRowArray[xpos][floorWidthGridAreaCount - ypos];
		}
	}
	floorGeometry.computeBoundingSphere();
	floorGeometry.computeFaceNormals();
	floorGeometry.computeBoundingBox();

	floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -Math.PI/2;
	scene.add(floorMesh);
}

function addEscapeRamp(){
	var rampLength = 75, rampWidth = 20, rampThickness = 0.1;
	var escapeRampShape = new CANNON.Box(new CANNON.Vec3(rampLength/2, rampThickness/2, rampWidth/2));
	var escapeRampBody = new CANNON.Body({mass:0});
	escapeRampBody.addShape(escapeRampShape);
	escapeRampBody.position.set(75,12,50);
	escapeRampBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), 0.33);
	world.addBody(escapeRampBody);
	var escapeRampGeometry = new THREE.BoxGeometry(rampLength, rampThickness, rampWidth);
	var escapeRampMaterial = new THREE.MeshBasicMaterial({color:0xa08050});
	var escapeRampMesh = new THREE.Mesh(escapeRampGeometry,escapeRampMaterial);
	scene.add(escapeRampMesh);
	escapeRampMesh.position.copy(escapeRampBody.position);
	escapeRampMesh.quaternion.copy(escapeRampBody.quaternion);
}

function addBarrierWall(){
	var barrierWallLength = 50, barrierWallWidth = 20, barrierWallThickness = 0.1;
	var barrerWallShape = new CANNON.Box(new CANNON.Vec3(barrierWallLength/2, barrierWallThickness/2, barrierWallWidth/2));
	var barrierWallBody = new CANNON.Body({mass:0});
	barrierWallBody.addShape(barrerWallShape);
	barrierWallBody.position.set( 0, barrierWallWidth/2, -60 );
	barrierWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI/2);
	world.addBody(barrierWallBody);
	var barrierWallGeometry = new THREE.BoxGeometry(barrierWallLength, barrierWallThickness,barrierWallWidth);
	var barrierWallMaterial = new THREE.MeshBasicMaterial({color:0x804090});
	var barrierWallMesh = new THREE.Mesh(barrierWallGeometry,barrierWallMaterial);
	scene.add(barrierWallMesh);
	barrierWallMesh.position.copy(barrierWallBody.position);
	barrierWallMesh.quaternion.copy(barrierWallBody.quaternion);
}

function addBall(){
	var ballRadius = 1;
	var ballShape = new CANNON.Sphere(ballRadius);
	var ballBody = new CANNON.Body({mass:5000});
	ballBody.addShape(ballShape)
	ballBody.position.set( 0, 30, 99 );
	world.addBody(ballBody);
	var ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
	var ballMaterial = new THREE.MeshPhongMaterial({color:0x992211, specular:0xff7711, metal:true});
	var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
	scene.add(ballMesh);
	terrainPushObject(ballBody, ballMesh);
}

function addTree(){
	var trunkRadius = 3;
	var trunkHeight = 10;
	var leafRadius = 10;
	var leafHeight = 25;
	var treeLocationX = -50, treeLocationY = trunkHeight/2, treeLocationZ = 0;
	var trunkShape = new CANNON.Cylinder(trunkRadius, trunkRadius, trunkHeight, 16);
	var trunkBody = new CANNON.Body({mass:0});
	trunkBody.addShape(trunkShape);
	trunkBody.position.set(treeLocationX, treeLocationY, treeLocationZ);
	trunkBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI/2);
	world.addBody(trunkBody);
	var leafGeometry = new THREE.CylinderGeometry(0, leafRadius, leafHeight, 32);
	var leafMaterial = new THREE.MeshLambertMaterial({color:0x11ff22});
	var leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
	leafMesh.position.set(0, 0, -(trunkHeight + leafHeight)/2);
	leafMesh.rotation.x = -Math.PI/2;
	var trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 32);
	var trunkMaterial = new THREE.MeshLambertMaterial({color:0x705030});
	var trunkVisibleMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
	trunkVisibleMesh.rotation.x = Math.PI/2;
	var trunkOrientationMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
	trunkOrientationMesh.add(leafMesh);
	trunkOrientationMesh.add(trunkVisibleMesh);
	scene.add(trunkOrientationMesh);
	trunkOrientationMesh.position.copy(trunkBody.position);
	trunkOrientationMesh.quaternion.copy(trunkBody.quaternion);
}
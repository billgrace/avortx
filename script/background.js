// background.js - handle the visible background in the rendering scene

// The background is a large box with scenic walls which surrounds the track.
// The images to be used for the background walls are specified in each track layout's characteristics.
// The distance from the scene's global origin to the background walls is part of
//	the track layout's characteristics.
// The background needs to be deleted and rebuilt when a new track layout is put in
//	place so the background mesh is given a fixed ID so it can be removed from the
//	scene before a new background is added.

// Notes about image files for the background mesh:
//  The jpg images are "painted" on the OUTSIDE faces of the box so flip them right-left to view from the inside
//   with the camera on the +Z side of 0, 0, 0 (with the +X axis heading off to the right) looking through 0, 0, 0.
//  The camera is looking at the "south" wall (face 6 in the loading order).
//  Loading order for box faces is west, east, sky, ground, north, south.

var backgroundListOfNamesAndIds = [];
var backgroundCubeGeometry, backgroundCubeMaterial, backgroundCubeMesh;
var backgroundCubeMaterialArray = [];
var backgroundCylinderWallGeometry, backgroundCylinderWallMaterial, backgroundCylinderWallMesh; 
var backgroundCylinderTopGeometry, backgroundCylinderTopMaterial, backgroundCylinderTopMesh;
var backgroundCylinderBottomGeometry, backgroundCylinderBottomMaterial, backgroundCylinderBottomMesh;

var backgroundAjaxExchangePending = false;
var backgroundAjaxFunctionSent;

var currentBackground = new Object();

function backgroundAjaxCallback() {
	switch( backgroundAjaxFunctionSent ) {
		case 'add_background':
			appendMessage( 'add_background returned: ' + xmlResponseString );
			break;
		case 'get_background':
			appendMessage( 'get_background has returned.' );
			if( xmlResponseData != undefined ) {
				currentBackground = xmlResponseData;
				installBackground();
			}
			break;
		case 'get_background_list':
			backgroundListOfNamesAndIds = xmlResponseData;
			break;
		case 'change_background':
			appendMessage( 'change_background returned: ' + xmlResponseString );
			break;
		case 'remove_background':
			appendMessage( 'remove_background returned: ' + xmlResponseString );
			break;
		default:
			appendMessage( '(default) background ajax exchange returned: ' + xmlResponseString );
			break;
	}
	backgroundAjaxExchangePending = false;
}

function addBackground() {
	backgroundAjaxFunctionSent = 'add_background';
	backgroundAjaxExchangePending = true;
	ajaxExchange( backgroundAjaxFunctionSent, 0, currentBackground, backgroundAjaxCallback );
}

function getNewBackground( backgroundDbId ) {
	var backgroundId;
	if( backgroundDbId === undefined ) {
		backgroundId = 'default';
	} else {
		backgroundId = backgroundDbId;
	}
	backgroundAjaxFunctionSent = 'get_background';
	backgroundAjaxExchangePending = true;
	ajaxExchange( backgroundAjaxFunctionSent, backgroundId, 0, backgroundAjaxCallback );
}

// Choosing a background is a three-step process:
//  1) get the list of all backgrounds via ajax exchange with the server database
function chooseBackground() {
	backgroundAjaxFunctionSent = 'get_background_list';
	backgroundAjaxExchangePending = true;
	ajaxExchange( backgroundAjaxFunctionSent, 0, 0, backgroundAjaxCallback );
}

//  2) put the list onto the screen where the user can see it
function makeBackgroundListBox() {
	var lb = new listBox( selectBackgroundItemClickedCallback );
	for( var i = 0; i < backgroundListOfNamesAndIds.length; i++ ) {
		lb.addItem( backgroundListOfNamesAndIds[ i ][ 'background_name' ], parseInt( backgroundListOfNamesAndIds[ i ][ 'db_id' ] ) )
	}
}

//  3) each time the user clicks on an item on the list, get and install that background
function selectBackgroundItemClickedCallback( backgroundListItemObject ) {
	getNewBackground( backgroundListItemObject.value );
}

function changeBackground( dbId, arrayOfChangedFields ) {
	backgroundAjaxFunctionSent = 'change_background';
	backgroundAjaxExchangePending = true;
	ajaxExchange( backgroundAjaxFunctionSent, dbId, arrayOfChangedFields, backgroundAjaxCallback );
}

function removeBackground( dbId ) {
	backgroundAjaxFunctionSent = 'remove_background';
	backgroundAjaxExchangePending = true;
	ajaxExchange( backgroundAjaxFunctionSent, dbId, 0, backgroundAjaxCallback );
}

function initializeBackground() {
	// Fill in the current background object with plausible values
	currentBackground.db_id = 1;
	currentBackground.background_name = 'Initial Background';
	currentBackground.author_name = 'A. Nonymous';
	currentBackground.shape_type = 'cube';
	currentBackground.shape_parameter_1 = 1000;
	currentBackground.shape_parameter_2 = 1000;
	currentBackground.shape_parameter_3 = 1000;
	currentBackground.shape_parameter_4 = 0;
	currentBackground.shape_parameter_5 = 0;
	currentBackground.shape_parameter_6 = 0;
	currentBackground.auto_locate_flag = 0;
	currentBackground.image_filename_1 = '!ff0000';
	currentBackground.image_filename_2 = '!00ff00';
	currentBackground.image_filename_3 = '!0000ff';
	currentBackground.image_filename_4 = '!ffff00';
	currentBackground.image_filename_5 = '!ff00ff';
	currentBackground.image_filename_6 = '!00ffff';
}

function pushACubeBackgroundMaterial( backgroundImageFileName ) {
	if( backgroundImageFileName.charAt( 0 ) == "!" )
	{
		var faceColor = parseInt( backgroundImageFileName.substring( 1 ), 16 );
		backgroundCubeMaterialArray.push( new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } ) );
	} else {
		backgroundCubeMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } ) );
	}
}

function setACylinderBackgroundMaterial( backgroundImageFileName, whichPart ) {
	// Load up the proper material for a plane end cap or surrounding wall of a cylinder background
	var faceColor;
	var colorNotImage;
	if( backgroundImageFileName.charAt( 0 ) == "!" ) {
		faceColor = parseInt( backgroundImageFileName.substring( 1 ), 16 );
		colorNotImage = true;
	} else {
		colorNotImage = false;
	}
	switch( whichPart ) {
		case 'top':
			if( colorNotImage ) {
				backgroundCylinderTopMaterial = new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } );
			} else {
				backgroundCylinderTopMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } );
			}
			break;
		case 'bottom':
			if( colorNotImage ) {
				backgroundCylinderBottomMaterial = new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } );
			} else {
				backgroundCylinderBottomMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } );
			}
			break;
		case 'wall':
			if( colorNotImage ) {
				backgroundCylinderWallMaterial = new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } );
			} else {
				backgroundCylinderWallMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } );
			}
			break;
		default:
			// Whaaaaa??!! shouldn't EVER get here....
			alert('default in switch in setACylinderBackgroundPlaneMaterial....');
			break;
	}
}
function setBackgroundPosition() {
	if( currentBackground.shape_type == 'cube' ) {
		// A cube background is a single mesh with a single position
		if( currentBackground.auto_locate_flag ) {
			// For auto location, center the cube horizontally and place its bottom surface
			//  at one track thickness below zero (which should be the bottom of the track)
			var cubeBackgroundY = ( currentBackground.shape_parameter_2 / 2 ) - currentTrackType.thickness;
			backgroundCubeMesh.position.set( 0, cubeBackgroundY, 0 );
			// backgroundCubeMesh.position.set( 0, 0, 0 );
		} else {
			// No auto location so place the cube wherever the parameters say
			backgroundCubeMesh.position.set(
				currentBackground.shape_parameter_4,
				currentBackground.shape_parameter_5,
				currentBackground.shape_parameter_6
			);
		}
	} else {
		// A cylinder background is three meshes that need to be positioned
		if( currentBackground.auto_locate_flag != 0 ) {
			// For auto location, center the cylinder and top/bottom planes horizontally and set their vertical
			//  positions such that the bottom plane is one track thickness below zero and the bottom of
			//  the cylinder is one millimeter below that.
			var cylinderBackgroundY = ( currentBackground.shape_parameter_2 / 2 ) - currentTrackType.thickness - 1;
			backgroundCylinderWallMesh.position.set( 0, cylinderBackgroundY, 0 );
		} else {
			// No auto location so place the cylinder according to the supplied configuration and
			//  then locate the top plane and bottom plane so they're just covering the ends of the cylinder
			//  (.... "just covering" meaning 1 millimeter separation )
			backgroundCylinderWallMesh.position.set(
				currentBackground.shape_parameter_4,
				currentBackground.shape_parameter_5,
				currentBackground.shape_parameter_6
			);
		}
		// copy the cylinder's (center) position to those of the (centers of the) planes and then shift the planes
		//  vertically by half the cylinder's height less one millimeter
		backgroundCylinderTopMesh.rotation.set( -Math.PI / 2, 0, 0 );
		backgroundCylinderBottomMesh.rotation.set( -Math.PI / 2, 0, 0 );
		backgroundCylinderTopMesh.position.copy( backgroundCylinderWallMesh.position );
		backgroundCylinderBottomMesh.position.copy( backgroundCylinderWallMesh.position );
		backgroundCylinderTopMesh.position.y += ( ( currentBackground.shape_parameter_2 / 2 ) - 1);
		backgroundCylinderBottomMesh.position.y -= ( ( currentBackground.shape_parameter_2 / 2 ) - 1);
	}
}

function installBackground() {
	// Remove any previous background meshes from the rendering scene
	scene.remove( backgroundCubeMesh );
	scene.remove( backgroundCylinderWallMesh );
	scene.remove( backgroundCylinderTopMesh );
	scene.remove( backgroundCylinderBottomMesh );
	// Now assemble the new background mesh
	if( currentBackground.shape_type == 'cube' ) {
		// Before installing a new cube background, remove any previous face images
		if( backgroundCubeMaterialArray.length > 0 ) {
			backgroundCubeMaterialArray.length = 0;
		}
		// Fetch the image files for the six faces of the cube
		pushACubeBackgroundMaterial( currentBackground.image_filename_1);
		pushACubeBackgroundMaterial( currentBackground.image_filename_2);
		pushACubeBackgroundMaterial( currentBackground.image_filename_3);
		pushACubeBackgroundMaterial( currentBackground.image_filename_4);
		pushACubeBackgroundMaterial( currentBackground.image_filename_5);
		pushACubeBackgroundMaterial( currentBackground.image_filename_6);
		// Make the cube's material from the loaded images
		backgroundCubeMaterial = new THREE.MeshFaceMaterial( backgroundCubeMaterialArray );
		// Make the cube's geometry according to the configured dimensions
		backgroundCubeGeometry = new THREE.BoxGeometry(
			currentBackground.shape_parameter_1,
			currentBackground.shape_parameter_2,
			currentBackground.shape_parameter_3
			);
		// Create the background's renderable mesh
		backgroundCubeMesh = new THREE.Mesh( backgroundCubeGeometry, backgroundCubeMaterial );
		// Add the new background to the rendered scene
		scene.add( backgroundCubeMesh );
	} else if( currentBackground.shape_type == 'cylinder' ) {
		backgroundCylinderWallGeometry = new THREE.CylinderGeometry( 
					currentBackground.shape_parameter_1,
					currentBackground.shape_parameter_1,
					currentBackground.shape_parameter_2,
					currentBackground.shape_parameter_3 );
		setACylinderBackgroundMaterial( currentBackground.image_filename_1, 'wall' );
		backgroundCylinderWallMesh = new THREE.Mesh( backgroundCylinderWallGeometry, backgroundCylinderWallMaterial );
		// We want planes to serve as end caps for the cylinder since the UV imaging geometry for cylinder
		//  endcaps is quite complicated. We'll place the endcaps just inside the ends of the cylinder.
		// The planes must be large enough to cover the ends of the cylinder...
		var planeExtent = currentBackground.shape_parameter_1 * 2;
		// Make renderable meshes for both endcaps and the cylinder
		backgroundCylinderTopGeometry = new THREE.PlaneBufferGeometry( planeExtent, planeExtent );
		setACylinderBackgroundMaterial( currentBackground.image_filename_2, 'top' );
		backgroundCylinderTopMesh = new THREE.Mesh( backgroundCylinderTopGeometry, backgroundCylinderTopMaterial );
		backgroundCylinderBottomGeometry = new THREE.PlaneBufferGeometry( planeExtent, planeExtent );
		setACylinderBackgroundMaterial( currentBackground.image_filename_3, 'bottom' );
		backgroundCylinderBottomMesh = new THREE.Mesh( backgroundCylinderBottomGeometry, backgroundCylinderBottomMaterial );
		scene.add( backgroundCylinderWallMesh);
		scene.add( backgroundCylinderTopMesh);
		scene.add( backgroundCylinderBottomMesh);
	}
	// Position the background cube according to the configuration parameters
	// (this is done by a separate function as it will need to be repeated whenever a new track type is installed)
	setBackgroundPosition();
};

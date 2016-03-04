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

var needToshowBackgroundListWhenAvailable = false;

var backgroundListOfNamesAndIds = [];
var backgroundCubeGeometry, backgroundCubeMaterial, backgroundCubeMesh;
var backgroundCubeMaterialArray = [];

var backgroundCylinderGeometry, backgroundCylinderMaterial, backgroundCylinderMesh;
var backgroundCylinderMaterialArray = [];

var backgroundAjaxExchangePending = false;
var backgroundAjaxFunctionSent;

var currentBackground = new Object();

function initializeBackground() {
	animationStepCallbackList.push('backgroundAnimationStepCallback');
	animationRestartCallbackList.push('backgroundAnimationRestartCallback');
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

function backgroundAnimationStepCallback(){
	if( needToshowBackgroundListWhenAvailable ) {
		if( !backgroundAjaxExchangePending ) {
			needToshowBackgroundListWhenAvailable = false;
			makeBackgroundListBox();
		}
	}
}

function backgroundAnimationRestartCallback(){
}

function backgroundAjaxCallback() {
	switch( backgroundAjaxFunctionSent ) {
		case 'add_background':
		emptyGlobalListBox();
			break;
		case 'get_background':
			if( xmlResponseData != undefined ) {
				currentBackground = xmlResponseData;
				installBackground();
			}
			break;
		case 'get_background_list':
			backgroundListOfNamesAndIds = xmlResponseData;
			break;
		case 'change_background':
			emptyGlobalListBox();
			break;
		case 'remove_background':
			emptyGlobalListBox();
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
	emptyGlobalListBox();
	globalListBox = new listBox({
		itemClickedCallback:selectBackgroundItemClickedCallback
	});
	for( var i = 0; i < backgroundListOfNamesAndIds.length; i++ ) {
		globalListBox.addItem( backgroundListOfNamesAndIds[ i ][ 'background_name' ], parseInt( backgroundListOfNamesAndIds[ i ][ 'db_id' ] ) );
	}
}

//  3) each time the user clicks on an item on the list, get and install that background
function selectBackgroundItemClickedCallback( backgroundListItemObject ) {
	if( backgroundListItemObject.value == -1 ) {
		enableChooseButtons();
		globalListBox.dispose();
	} else {
		getNewBackground( backgroundListItemObject.value );
	}
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

function pushACubeBackgroundMaterial( backgroundImageFileName ) {
	if( backgroundImageFileName.charAt( 0 ) == "!" )
	{
		var faceColor = parseInt( backgroundImageFileName.substring( 1 ), 16 );
		backgroundCubeMaterialArray.push( new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } ) );
	} else {
		backgroundCubeMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } ) );
	}
}

function pushACylinderBackgroundMaterial( backgroundImageFileName ) {
	if( backgroundImageFileName.charAt( 0 ) == "!" )
	{
		var faceColor = parseInt( backgroundImageFileName.substring( 1 ), 16 );
		backgroundCylinderMaterialArray.push( new THREE.MeshBasicMaterial( { color:faceColor, side:THREE.DoubleSide } ) );
	} else {
		backgroundCylinderMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( backgroundImageFileName ), side:THREE.DoubleSide } ) );
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
		if( currentBackground.auto_locate_flag != 0 ) {
			// For auto location, center the cube horizontally and place its bottom surface
			//  at one track thickness below zero (which should be the bottom of the track)
			var cubeBackgroundY = ( currentBackground.shape_parameter_2 / 2 ) - currentTrackType.thickness;
			backgroundCubeMesh.position.set( 0, cubeBackgroundY, 0 );
		} else {
			// No auto location so place the cube wherever the parameters say
			backgroundCubeMesh.position.set(
				currentBackground.shape_parameter_4,
				currentBackground.shape_parameter_5,
				currentBackground.shape_parameter_6
			);
		}
	} else {

		// A cylinder background is a single mesh with a single position
		if( currentBackground.auto_locate_flag != 0 ) {
			// For auto location, center the cylinder horizontally and place its bottom surface
			//  at one track thickness below zero (which should be the bottom of the track)
			var cylinderBackgroundY = ( currentBackground.shape_parameter_3 / 2 ) - currentTrackType.thickness;
			backgroundCylinderMesh.position.set( 0, cylinderBackgroundY, 0 );
		} else {
			// No auto location so place the cylinder wherever the parameters say
			backgroundCylinderMesh.position.set(
				currentBackground.shape_parameter_4,
				currentBackground.shape_parameter_5,
				currentBackground.shape_parameter_6
			);
		}
	}
}

function installBackground() {
	// Remove any previous background meshes from the rendering scene
	scene.remove( backgroundCubeMesh );

	scene.remove( backgroundCylinderMesh );

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

		// Before installing a new cylinder background, remove any previous face images
		if( backgroundCylinderMaterialArray.length > 0 ) {
			backgroundCylinderMaterialArray.length = 0;
		}
		// Fetch the image files for the sidewall, top and bottom caps of the cube
		pushACylinderBackgroundMaterial( currentBackground.image_filename_1);
		pushACylinderBackgroundMaterial( currentBackground.image_filename_2);
		pushACylinderBackgroundMaterial( currentBackground.image_filename_3);
		backgroundCylinderMaterial = new THREE.MeshFaceMaterial( backgroundCylinderMaterialArray );
		backgroundCylinderGeometry = new THREE.CylinderGeometry(
					currentBackground.shape_parameter_1,
					currentBackground.shape_parameter_1,
					currentBackground.shape_parameter_2,
					currentBackground.shape_parameter_3 );
		backgroundCylinderMesh = new THREE.Mesh( backgroundCylinderGeometry, backgroundCylinderMaterial );
		cylinderMeshUvForEndCapImages( backgroundCylinderMesh, 3 );
		scene.add( backgroundCylinderMesh );
	}
	// Position the background cube according to the configuration parameters
	// (this is done by a separate function as it will need to be repeated whenever a new track type is installed)
	setBackgroundPosition();
};

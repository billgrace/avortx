// track.js - handle visible track generation and track definition maintenance

// A track consists of a track type and a track layout.
// The track type defines characteristics of the entire track.
// The track layout defines a starting point, a starting direction and a
//  series of sections which can be straight or curving to the right or left.
// Each section of track may also rise or fall over its extent.

// Track sections are defined as one of three kinds of object -
//	straight,
//	curving to the right and
//	curving to the left

// var trackPathStraightSection = new Object();
// trackPathStraightSection.section_type = 'straight';
// trackPathStraightSection.length = 10;
// trackPathStraightSection.rise = 0;

// var trackPathCurvingRightSection = new Object();
// trackPathCurvingRightSection.section_type = 'right';
// trackPathCurvingRightSection.radius = 10;
// trackPathCurvingRightSection.angle = Math.PI;
// trackPathCurvingRightSection.rise = 0;

// var trackPathCurvingLeftSection = new Object();
// trackPathCurvingLeftSection.section_type = 'left';
// trackPathCurvingLeftSection.radius = 10;
// trackPathCurvingLeftSection.angle = Math.PI;
// trackPathCurvingLeftSection.rise = 0;

// To allow smooth rendering of the track, the track sections are further broken down into
//	a series of "small pieces". It is the array of all the small pieces making up the track
//	that are sent to the rendering and physics engines - the larger "track sections" are
//	the human-graspable form of the track.

// Each track section object stores the indexes for the small piece
//	array which point to where each section begins and ends in that array of small track pieces.

// The first step in processing a track layout is to sub-divide it into many small pieces. This serves
//	both to improve rendering of the curves and to establish many locations along the track path that
//	can be used to animate by "dragging" things along the track.
// The target size for piece length is a configurable number of millimeters. This results in a series of
//	small pieces of uniform length plus a last piece that might be shorter to make up the actual section length.
// Because the length of each small piece is configurable (in the hopes that this will allow good trade-offs
//	between track quality/resolution and processor speed/performance) the number of degrees to step the
//	slope of each piece is also configurable.
// For curves, the internal computations are given a radius in millimeters and an angular extent for
//	each piece so the angular extents are calculated to give a linear length of each curve piece equal
//	to the same number of millimeters as in a straight section - again with a fractional last piece as needed.
// Starting with radius = R millimeters and total angular extent = A radians, we have:
//	Total arclength = R x A which re-shuffles as:
//		A = total arclength / R so for one full piece of curved track:
//		angle (in radians) to make one full piece of curve arclength = configured piece length (in millimeters) / R
//	... so the angular extent of each piece of a curve section is the piece length divided by the radius.
// This entire processing stage completely ignores elevations ( y component ) and deals only with the
//	horizontal geometry of the track. Three dimensional vectors are used but the y components (vertical)
//	are all left at the same value (the origin point's elevation).
// Each small piece generated is either straight, curving right or curving left. Each small piece
//	has a pieceType ('straight', 'right', 'left'), pieceStartPoint and pieceFinishPoints (Vector3),
//	pieceStartDirection and pieceFinishDirections (Vector3), plus pieceLength (for straight pieces)
//	and radius and angular extent (for curve pieces).
// To avoid needless repetition of a lot of vector arithmetic, all the vertices of each piece are also
//	generated during this step with the elevation components ignored. This generates a "complete" track
//	lacking only rise and fall so the horizontal shape is fully calculated. The appropriate elevations
//	at each vertex are calculated in the next step and substituted in to complete the track geometry.
// Each straight small piece has eight vertices representing the corners of a rectangular block. Each
//	curved small piece has ten vertices representing the corners of a trapezoidal block PLUS vertices
//	at the midpoint of the longer circumferential sides so the surfaces can be reduced to triangular faces
//	for rendering.
// The vertices are given names during calculation ("start"/"finish", "left"/"right", "top"/"bottom" and
//	"midpoint" for the sake of conceptual sanity but they're reduced to integer indexes when it's time to
//	make the arrays of vertices and faces that become rendering meshes and physics bodies.
// During this step we also place a point ("center") that gives the center of the piece's volume which
//	will be used as the position for the piece's rendering mesh and physics body.
// Note - for rendering, the vertices are given coordinates relative to the center point - NOT global
//	coordinates.
// The collection of track pieces generated in this first step is pushed onto a global variable array
//	"trackSmallPieces".

// The second step in processing the track layout is to generate an elevation for each piece's pathStartPoint such
//	that the user's given rise and run for each section is honored AND the transitions between sections are
//	reasonably smooth.
// Each pair of sections is treated - including the pair of last/first at the track path origin.
// The criterion used is that there be no more than a configured amount of slope change between any two small pieces
//	of track.
// The slope for the point where two track sections meet is set to the average of the slopes of the two sections.
// Then each section is taken and run through an iterative process where the slope of the outermost small piece on
//	each end of the section is compared to the slope of the line connecting those two extremes. If the difference
//	is no more than the configured amount, the process is done. Otherwise, the extreme small piece is assigned a slope one
//	notch closer to that of the connecting line and the process is repeated using the next-inner small piece(s).
// This process gives a reasonably smooth slope transition and results in every small piece path start point
//	being assigned an elevation.

// The third step is to traverse the entire track small piece by small piece and generate a THREE.js mesh and
//	a CANNON.js body for each small piece. These meshes and bodies are added to the scene and world and also
//	to lists of track meshes and track bodies so the track can later be removed and regenerated as the
//	process of designing and modifying a track layout proceeds.

// Characteristics that apply to the entire track are in the currentTrackType object
var currentTrackType = new Object();
// The track layout is a bit different since it occupies multiple records in the server database. This requires a
//	certain amount of mapping back and forth to have reasonable variables for the javascript end here in the browser...
// The "meta data" for the current track layout:
var currentTrackLayoutLayoutName;
var currentTrackLayoutAuthorName;
var currentTrackLayoutLayoutId;
// The starting point and direction of the track are in the following two vectors
var currentTrackLayoutStartingPoint = new THREE.Vector3();
var currentTrackLayoutStartingDirection = new THREE.Vector3();
// The geometries of the sections that make up the track are stored in the following array of sections
var currentTrackLayoutSections = [];
// For interactions with the server database, track layouts are an array with a first element giving the starting point, a
//	second element giving the starting direction and ensuing elements containing all the sections.
// The layout name, author name and layout ID (an integer, probably unnecessary I suppose...) are copied into every record.
var databaseTrackLayoutArray = [];
// The track sections are divided into small pieces which are actually rendered
var trackSmallPieces = [];
// We track the render meshes and physics bodies so we can remove and replace them
var trackPieceMeshList = [];
var trackPieceBodyList = [];
//	for the physics engine, we have a global track material variable
var trackBodyMaterial;
// For adding new track layouts to the database, we build up a layout in local storage dedicated to
//	that so the process can be incomplete without meddling with the normal layout storage items:
var toBeAddedTrackLayoutLayoutName;
var toBeAddedTrackLayoutAuthorName;
var toBeAddedTrackLayoutStartingPoint = new THREE.Vector3();
var toBeAddedTrackLayoutStartingDirection = new THREE.Vector3();
var toBeAddedTrackLayoutSections = [];

// Track types and layouts are stored in the server database and accessed by ajax exchanges
var trackTypeListOfNamesAndIds = [];
var trackTypeAjaxExchangePending = false;
var trackTypeAjaxFunctionSent;

function trackTypeAjaxCallback() {
	switch( trackTypeAjaxFunctionSent ) {
		case 'add_track_type':
			appendMessage( 'add_track_type returned: ' + xmlResponseString );
			break;
		case 'get_track_type':
			appendMessage( 'get_track_type has returned.' );
			if( xmlResponseData != undefined ) {
				currentTrackType = xmlResponseData[ 0 ];
				currentTrackType.db_id = parseInt( currentTrackType.db_id );
				currentTrackType.thickness = parseFloat( currentTrackType.thickness );
				currentTrackType.width = parseFloat( currentTrackType.width );
				currentTrackType.small_piece_length = parseFloat( currentTrackType.small_piece_length );
				currentTrackType.slope_match_angle = parseFloat( currentTrackType.slope_match_angle );
				currentTrackType.track_color = parseInt( currentTrackType.track_color );
				currentTrackType.drag_point_radius = parseFloat( currentTrackType.drag_point_radius );
				currentTrackType.drag_point_color = parseInt( currentTrackType.drag_point_color );
				installTrack();
			}
			break;
		case 'get_track_type_list':
			trackTypeListOfNamesAndIds = xmlResponseData;
			break;
		case 'change_track_type':
			appendMessage( 'change_track_type returned: ' + xmlResponseString );
			break;
		case 'remove_track_type':
			appendMessage( 'remove_track_type returned: ' + xmlResponseString );
			break;
		default:
			appendMessage( '(default) background ajax exchange returned: ' + xmlResponseString );
			break;
	}
	trackTypeAjaxExchangePending = false;
}

function addTrackType() {
	trackTypeAjaxFunctionSent = 'add_track_type';
	trackTypeAjaxExchangePending = true;
	ajaxExchange( trackTypeAjaxFunctionSent, 0, currentTrackType, trackTypeAjaxCallback );
}

function getNewTrackType( trackTypeDbId ) {
	var trackTypeId;
	if( trackTypeDbId === undefined ) {
		trackTypeId = 'default';
	} else {
		trackTypeId = trackTypeDbId;
	}
	trackTypeAjaxFunctionSent = 'get_track_type';
	trackTypeAjaxExchangePending = true;
	ajaxExchange( trackTypeAjaxFunctionSent, trackTypeId, 0, trackTypeAjaxCallback );
}

// Choosing a track type is a three-step process:
//  1) get the list of all track types via ajax exchange with the server database
function chooseTrackType() {
	trackTypeAjaxFunctionSent = 'get_track_type_list';
	trackTypeAjaxExchangePending = true;
	ajaxExchange( trackTypeAjaxFunctionSent, 0, 0, trackTypeAjaxCallback );
}

//  2) put the list into the screen the user can see it
function makeTrackTypeListBox() {
	var lb = new listBox( selectTrackTypeItemClickedCallback );
	for( var i = 0; i < trackTypeListOfNamesAndIds.length; i++ ) {
		lb.addItem( trackTypeListOfNamesAndIds[ i ][ 'track_type_name' ], parseInt( trackTypeListOfNamesAndIds[ i ][ 'db_id' ] ) )
	}
}

//  3) each time the user clicks on an item on the list, get and install that track type
function selectTrackTypeItemClickedCallback( trackTypeListItemObject ) {
	getNewTrackType( trackTypeListItemObject.value );
}

function changeTrackType( dbId, arrayOfChangedFields ) {
	trackTypeAjaxFunctionSent = 'change_track_type';
	trackTypeAjaxExchangePending = true;
	ajaxExchange( trackTypeAjaxFunctionSent, dbId, arrayOfChangedFields, trackTypeAjaxCallback );
}

function removeTrackType( dbId ) {
	trackTypeAjaxFunctionSent = 'remove_track_type';
	trackTypeAjaxExchangePending = true;
	ajaxExchange( trackTypeAjaxFunctionSent, dbId, 0, trackTypeAjaxCallback );
}

var trackLayoutListOfNamesAndIds = [];
var trackLayoutAjaxExchangePending = false;
var trackLayoutAjaxFunctionSent;

function trackLayoutAjaxCallback() {
	switch( trackLayoutAjaxFunctionSent ) {
		case 'add_track_layout':
			appendMessage( 'add_track_layout returned: ' + xmlResponseString );
			break;
		case 'get_track_layout':
			appendMessage( 'get_track_layout has returned.' );
			if( xmlResponseData != undefined ) {
				databaseTrackLayoutArray = xmlResponseData;
				unpackCurrentTrackLayoutFromDatabaseArray();
				installTrack();
			}
			break;
		case 'get_track_layout_list':
			trackLayoutListOfNamesAndIds = xmlResponseData;
			break;
		case 'change_track_layout':
			appendMessage( 'change_track_layout returned: ' + xmlResponseString );
			break;
		case 'remove_track_layout':
			appendMessage( 'remove_track_layout returned: ' + xmlResponseString );
			break;
		default:
			appendMessage( '(default) background ajax exchange returned: ' + xmlResponseString );
			break;
	}
	trackLayoutAjaxExchangePending = false;
}

function addTrackLayout() {
	trackLayoutAjaxFunctionSent = 'add_track_layout';
	trackLayoutAjaxExchangePending = true;
	packNewTrackLayoutIntoDatabaseArray();
	ajaxExchange( trackLayoutAjaxFunctionSent, 0, databaseTrackLayoutArray, trackLayoutAjaxCallback );
}

function getNewTrackLayout( trackLayoutDbId ) {
	var trackLayoutId;
	if( trackLayoutDbId === undefined ) {
		trackLayoutId = 'default';
	} else {
		trackLayoutId = trackLayoutDbId;
	}
	trackLayoutAjaxFunctionSent = 'get_track_layout';
	trackLayoutAjaxExchangePending = true;
	ajaxExchange( trackLayoutAjaxFunctionSent, trackLayoutId, 0, trackLayoutAjaxCallback );
}

// Choosing a track layout is a three-step process:
//  1) get the list of all track layouts via ajax exchange with the server database
function chooseTrackLayout() {
	trackLayoutAjaxFunctionSent = 'get_track_layout_list';
	trackLayoutAjaxExchangePending = true;
	ajaxExchange( trackLayoutAjaxFunctionSent, 0, 0, trackLayoutAjaxCallback );
}

//  2) put the list into the screen the user can see it
function makeTrackLayoutListBox() {
	var lb = new listBox( selectTrackLayoutItemClickedCallback );
	for( var i = 0; i < trackLayoutListOfNamesAndIds.length; i++ ) {
		lb.addItem( trackLayoutListOfNamesAndIds[ i ][ 'track_layout_name' ], parseInt( trackLayoutListOfNamesAndIds[ i ][ 'track_layout_id' ] ) )
	}
}

//  3) each time the user clicks on an item on the list, get and install that track layout
function selectTrackLayoutItemClickedCallback( trackLayoutListItemObject ) {
	getNewTrackLayout( trackLayoutListItemObject.value );
}

function changeTrackLayout() {
	trackLayoutAjaxFunctionSent = 'change_track_layout';
	trackLayoutAjaxExchangePending = true;
	packNewTrackLayoutIntoDatabaseArray();
	ajaxExchange( trackLayoutAjaxFunctionSent, currentTrackLayout.db_id, databaseTrackLayoutArray, trackLayoutAjaxCallback );
}

function removeTrackLayout( dbId ) {
	trackLayoutAjaxFunctionSent = 'remove_track_layout';
	trackLayoutAjaxExchangePending = true;
	ajaxExchange( trackLayoutAjaxFunctionSent, dbId, 0, trackLayoutAjaxCallback );
}

function packNewTrackLayoutIntoDatabaseArray() {
	databaseTrackLayoutArray = [];
	var startingPointObject = new Object();
	startingPointObject.track_layout_name = toBeAddedTrackLayoutLayoutName;
	startingPointObject.author_name = toBeAddedTrackLayoutAuthorName;
	startingPointObject.track_layout_id = toBeAddedTrackLayoutLayoutId;
	startingPointObject.section_sequence_number = 1;
	startingPointObject.section_type = 'origin';
	startingPointObject.section_parameter_1 = toBeAddedTrackLayoutStartingPoint.x;
	startingPointObject.section_parameter_2 = toBeAddedTrackLayoutStartingPoint.y;
	startingPointObject.section_parameter_3 = toBeAddedTrackLayoutStartingPoint.z;
	databaseTrackLayoutArray.push( startingPointObject );
	var startingDirectionObject = new Object();
	startingDirectionObject.track_layout_name = toBeAddedTrackLayoutLayoutName;
	startingDirectionObject.author_name = toBeAddedTrackLayoutAuthorName;
	startingDirectionObject.track_layout_id = toBeAddedTrackLayoutLayoutId;
	startingDirectionObject.section_sequence_number = 2;
	startingDirectionObject.section_type = 'direction';
	startingDirectionObject.section_parameter_1 = toBeAddedTrackLayoutStartingDirection.x;
	startingDirectionObject.section_parameter_2 = toBeAddedTrackLayoutStartingDirection.y;
	startingDirectionObject.section_parameter_3 = toBeAddedTrackLayoutStartingDirection.z;
	databaseTrackLayoutArray.push( startingDirectionObject );
	for( var i = 0; i < toBeAddedTrackLayoutSections.length; i++ ) {
		var trackSectionObject = new Object();
		trackSectionObject.track_layout_name = toBeAddedTrackLayoutLayoutName;
		trackSectionObject.author_name = toBeAddedTrackLayoutAuthorName;
		trackSectionObject.track_layout_id = toBeAddedTrackLayoutLayoutId;
		trackSectionObject.section_sequence_number = i + 3 ;
		trackSectionObject.section_type = toBeAddedTrackLayoutSections[ i ].section_type;
		trackSectionObject.section_parameter_1 = toBeAddedTrackLayoutSections[ i ].rise;
		switch( toBeAddedTrackLayoutSections[ i ].section_type ) {
			case 'straight':
			trackSectionObject.section_parameter_2 = toBeAddedTrackLayoutSections[ i ].length;
			trackSectionObject.section_parameter_3 = 0;
				break;
			case 'right':
			case 'left':
			trackSectionObject.section_parameter_2 = toBeAddedTrackLayoutSections[ i ].radius;
			trackSectionObject.section_parameter_3 = toBeAddedTrackLayoutSections[ i ].angle;
				break;
			default:
				alert( 'default in switch in packNewTrackLayoutIntoDatabaseArray!' );
				break;
		}
	databaseTrackLayoutArray.push( trackSectionObject );
	}
}

function unpackCurrentTrackLayoutFromDatabaseArray() {
	currentTrackLayoutLayoutName = databaseTrackLayoutArray[ 0 ].track_layout_name;
	currentTrackLayoutAuthorName = databaseTrackLayoutArray[ 0 ].author_name;
	currentTrackLayoutLayoutId = databaseTrackLayoutArray[ 0 ].track_layout_id;
	currentTrackLayoutStartingPoint.set( parseFloat( databaseTrackLayoutArray[ 0 ].section_parameter_1 ),
										parseFloat( databaseTrackLayoutArray[ 0 ].section_parameter_2 ),
										parseFloat( databaseTrackLayoutArray[ 0 ].section_parameter_3) );
	currentTrackLayoutStartingDirection.set( parseFloat( databaseTrackLayoutArray[ 1 ].section_parameter_1 ),
										parseFloat( databaseTrackLayoutArray[ 1 ].section_parameter_2 ),
										parseFloat( databaseTrackLayoutArray[ 1 ].section_parameter_3) );
	currentTrackLayoutSections = [];
	for( var i = 2; i < databaseTrackLayoutArray.length; i++ ) {
		var trackSectionObject = new Object();
		trackSectionObject.section_type = databaseTrackLayoutArray[ i ].section_type;
		trackSectionObject.rise = parseFloat( databaseTrackLayoutArray[ i ].section_parameter_1 );
		switch( trackSectionObject.section_type ) {
			case 'straight':
				trackSectionObject.length = parseFloat( databaseTrackLayoutArray[ i ].section_parameter_2 );
				break;
			case 'right':
			case 'left':
				trackSectionObject.radius = parseFloat( databaseTrackLayoutArray[ i ].section_parameter_2 );
				trackSectionObject.angle = parseFloat( databaseTrackLayoutArray[ i ].section_parameter_3 );
				break;
			default:
				alert( 'default in switch in unpackCurrentTrackLayoutFromDatabaseArray!' );
				break;
		}
		currentTrackLayoutSections.push( trackSectionObject );
	}
}

function initializeTrack() {
	// Before a real track definition is fetched from the database,
	//	fill in the current objects with plausible values
	currentTrackType.db_id = 1;
	currentTrackType.track_type_name = 'Initial track type';
	currentTrackType.author_name = 'A. Nonymous';
	currentTrackType.thickness = 10;
	currentTrackType.width = 50;
	currentTrackType.small_piece_length = 10;
	currentTrackType.slope_match_angle = 0.0872665;
	currentTrackType.track_color = 0x905020;
	currentTrackType.drag_point_radius = 5;
	currentTrackType.drag_point_color = 0xff0000;
	trackBodyMaterial = new CANNON.Material( "trackBodyMaterial" );
	currentTrackLayoutLayoutName = 'Circle';
	currentTrackLayoutAuthorName = 'Bill Grace';
	currentTrackLayoutLayoutId = 0;
	currentTrackLayoutStartingPoint.set( 0, 0, 0 );
	currentTrackLayoutStartingDirection.set( 1, 0, 0 );
	currentTrackLayoutSections.length = 0;
	var trackSection1 = new Object();
	trackSection1.section_type = 'left';
	trackSection1.radius = 50;
	trackSection1.angle = Math.PI / 2;
	trackSection1.rise = 0;
	currentTrackLayoutSections.push( trackSection1 );
	var trackSection2 = new Object();
	trackSection2.section_type = 'left';
	trackSection2.radius = 50;
	trackSection2.angle = Math.PI / 2;
	trackSection2.rise = 0;
	currentTrackLayoutSections.push( trackSection2 );
	var trackSection3 = new Object();
	trackSection3.section_type = 'left';
	trackSection3.radius = 50;
	trackSection3.angle = Math.PI / 2;
	trackSection3.rise = 0;
	currentTrackLayoutSections.push( trackSection3 );
	var trackSection4 = new Object();
	trackSection4.section_type = 'left';
	trackSection4.radius = 50;
	trackSection4.angle = Math.PI / 2;
	trackSection4.rise = 0;
	currentTrackLayoutSections.push( trackSection4 );
	installTrack();
}

function installTrack() {
	// After a track definition has been arranged, process it into a working track
	turnOffAllDragPoints();
	currentDragPoint = 0;
	removeExistingTrackMeshesAndBodies();
	figureTrackPieces();
	figureTrackElevations();
	copyPathElevationsToVertices();
	figureTrackPieceCenters();
	makeTrackMeshesAndBodies();
	makeDragPointsFromTrackPieces();
	turnOffAllDragPoints();
}

// Remove any existing track meshes and bodies and empty all the track list arrays (except the track layout section description list)
function removeExistingTrackMeshesAndBodies() {
	if( trackPieceMeshList.length > 0 ) {
		for( var i = 0; i < trackPieceMeshList.length; i++ ) {
			scene.remove( trackPieceMeshList[ i ] );
		}
		trackPieceMeshList.length = 0;
	}
	if( trackPieceBodyList.length > 0 ) {
		for( var i = 0; i < trackPieceBodyList.length; i++ ) {
			world.remove( trackPieceBodyList[ i ] );
		}
		trackPieceBodyList.length = 0;
	}
};

// Traverse a track layout list of sections and create the lists of small track pieces which will be rendered
function figureTrackPieces() {
	trackSmallPieces.length = 0;	// start with an empty array in which to store the track pieces to be generated
	var trackWidth = currentTrackType.width;
	var previousPiecePathFinishPoint = new THREE.Vector3();
	var previousPiecePathFinishDirection = new THREE.Vector3();
	var yAxisDirection = new THREE.Vector3( 0, 1, 0 );
	// Start with the track path origin point and direction acting as the "finish" items of the "previous section"
	previousPiecePathFinishPoint.copy( currentTrackLayoutStartingPoint );
	previousPiecePathFinishDirection.copy( currentTrackLayoutStartingDirection );
	// starting past the characteristics and origin entries, traverse the layout array and process each section
	for( sectionIndex = 0; sectionIndex < currentTrackLayoutSections.length; sectionIndex++ ) {
		// Record the piece index where this section begins
		currentTrackLayoutSections[ sectionIndex ].beginPieceIndex = trackSmallPieces.length;
		switch( currentTrackLayoutSections[ sectionIndex ].section_type ) {
			case 'straight':
				// Full pieces are the configured number of millimeters in length
				var fullPieceCount = Math.floor( currentTrackLayoutSections[ sectionIndex ].length / currentTrackType.small_piece_length );
				// Last piece is whatever it takes to make up the actual given length
				var lastPieceLength = currentTrackLayoutSections[ sectionIndex ].length - ( fullPieceCount * currentTrackType.small_piece_length );
				// Traverse the straight section making each small piece
				//  ( if the length of the odd-sized last piece is too close to zero, ignore that piece )
				for( var currentPiece = 0; currentPiece < ( fullPieceCount + 1 ); currentPiece++ ) {
					var currentPieceLength;
					if( currentPiece == fullPieceCount ) {
						// This is the odd-sized last piece...
						currentPieceLength = lastPieceLength;
					} else {
						// This is just another full size piece
						currentPieceLength = currentTrackType.small_piece_length;
					}
					// Screen out overly small last pieces
					if( currentPieceLength > 0.001 ) {
						// Make the object representing the current piece of straight track section
						var thisPiece = new Object();
						thisPiece.pieceType = 'straight';
						thisPiece.pieceLength = currentPieceLength;
						// The path start point and direction are those of the previous piece's end point
						thisPiece.piecePathStartPoint = new THREE.Vector3();
						thisPiece.piecePathStartPoint.copy( previousPiecePathFinishPoint );
						thisPiece.piecePathStartDirection = new THREE.Vector3();
						thisPiece.piecePathStartDirection.copy( previousPiecePathFinishDirection );
						// The path finish point for a full straight piece is one millimeter from the start point in the direction of the piece
						thisPiece.piecePathFinishPoint = new THREE.Vector3();
						thisPiece.piecePathSpan = new THREE.Vector3();
						thisPiece.piecePathSpan.copy( previousPiecePathFinishDirection );	// get the direction of this piece
						thisPiece.piecePathSpan.normalize();
						thisPiece.piecePathSpan.multiplyScalar( currentPieceLength );
						thisPiece.piecePathFinishPoint.addVectors( thisPiece.piecePathStartPoint, thisPiece.piecePathSpan );	// add it to the start point
						thisPiece.piecePathFinishDirection = new THREE.Vector3();
						thisPiece.piecePathFinishDirection.copy( thisPiece.piecePathStartDirection );	// for straight pieces, the direction never changes
						// Make the eight vertices of this small piece of straight track
						thisPiece.startRightTopVertex = new THREE.Vector3();
						thisPiece.finishRightTopVertex = new THREE.Vector3();
						thisPiece.finishLeftTopVertex = new THREE.Vector3();
						thisPiece.startLeftTopVertex = new THREE.Vector3();
						thisPiece.startRightBottomVertex = new THREE.Vector3();
						thisPiece.finishRightBottomVertex = new THREE.Vector3();
						thisPiece.finishLeftBottomVertex = new THREE.Vector3();
						thisPiece.startLeftBottomVertex = new THREE.Vector3();
						// The separation of vertices "left" and "right" is taken one at a time from the center-located path points
						// ... the direction of these is the piece direction rotated 90 degrees either way about the Y axis and
						// ... the length of each is half the track width.
						var leftwardVector = new THREE.Vector3();
						var rightwardVector = new THREE.Vector3();
						leftwardVector.copy( thisPiece.piecePathStartDirection );
						rightwardVector.copy( thisPiece.piecePathStartDirection );
						leftwardVector.normalize();
						rightwardVector.normalize();
						leftwardVector.multiplyScalar( currentTrackType.width / 2 );
						rightwardVector.multiplyScalar( currentTrackType.width / 2 );
						leftwardVector.applyAxisAngle( yAxisDirection, Math.PI / 2 );
						rightwardVector.applyAxisAngle( yAxisDirection, -Math.PI / 2 );
						// Now place the piece vertices
						thisPiece.startRightTopVertex.addVectors( thisPiece.piecePathStartPoint, rightwardVector );
						thisPiece.finishRightTopVertex.addVectors( thisPiece.piecePathFinishPoint, rightwardVector );
						thisPiece.finishLeftTopVertex.addVectors( thisPiece.piecePathFinishPoint, leftwardVector );
						thisPiece.startLeftTopVertex.addVectors( thisPiece.piecePathStartPoint, leftwardVector );
						// ( just copy the top vectors to the bottom vectors and ignore the vertical quantities for now...)
						thisPiece.startRightBottomVertex.copy( thisPiece.startRightTopVertex );
						thisPiece.finishRightBottomVertex.copy( thisPiece.finishRightTopVertex );
						thisPiece.finishLeftBottomVertex.copy( thisPiece.finishLeftTopVertex );
						thisPiece.startLeftBottomVertex.copy( thisPiece.startLeftTopVertex );
						// Push the completed piece onto the list of pieces
						trackSmallPieces.push( thisPiece );
						// Update the "previous" path items so we can process the next small piece
						previousPiecePathFinishPoint.copy( thisPiece.piecePathFinishPoint );
						previousPiecePathFinishDirection.copy( thisPiece.piecePathFinishDirection );
					}
				}
				break;
			case 'right':
				// Get the radius of this section of curved track
				var currentPieceRadius = currentTrackLayoutSections[ sectionIndex ].radius;
				// Figure the piece angle that will give the configured piece length at the given radius
				var fullPieceAngle = ( currentTrackType.small_piece_length / currentPieceRadius );
				// Full pieces are the configured number of millimeters in arc length
				var fullPieceCount = Math.floor( currentTrackLayoutSections[ sectionIndex ].angle / fullPieceAngle );
				// Last piece is whatever it takes to make up the actual given curve angle
				var lastPieceAngle = ( currentTrackLayoutSections[ sectionIndex ].angle ) - ( fullPieceCount * fullPieceAngle );
				for( var currentPiece = 0; currentPiece < ( fullPieceCount + 1 ); currentPiece++ ) {
					var currentPieceAngle;
					if( currentPiece == fullPieceCount ) {
						// This is the odd-sized last piece
						currentPieceAngle = lastPieceAngle;
					} else {
						// This is just another full, one mm piece
						currentPieceAngle = fullPieceAngle;
					}
					// Screen out overly small last pieces
					if( currentPieceAngle > 0.0001 ) {
						// Make the object representing the current piece of track curve
						var thisPiece = new Object();
						thisPiece.pieceType = 'right';
						thisPiece.angle = currentPieceAngle;
						thisPiece.radius = currentPieceRadius;
						// Copy start point and direction from the previous piece's finish point and direction
						thisPiece.piecePathStartPoint = new THREE.Vector3();
						thisPiece.piecePathStartPoint.copy( previousPiecePathFinishPoint );
						thisPiece.piecePathStartDirection = new THREE.Vector3();
						thisPiece.piecePathStartDirection.copy( previousPiecePathFinishDirection );
						// Create the center point of the curve for this piece
						var centerPoint = new THREE.Vector3();
						// - make a vector from the start point to the center point
						var centerOffsetVector = new THREE.Vector3();
						centerOffsetVector.copy( thisPiece.piecePathStartDirection );	// get the piece's start direction
						centerOffsetVector.normalize();	// make it one unit long
						centerOffsetVector.applyAxisAngle( yAxisDirection, -Math.PI / 2 );	// rotate it 90 degrees clockwise = direction from path start point to center point
						centerOffsetVector.multiplyScalar( thisPiece.radius ); // give it a length equal to the distance from the center point to all points on the path
						centerPoint.addVectors( thisPiece.piecePathStartPoint, centerOffsetVector );	// set the center point at the sum of the start point location vector and the offset we just made
						// Create spoke vectors from the center point to points of interest on this piece ( midpoint vertex and path finish point )
						var startSpokeDirection = new THREE.Vector3();
						var middleSpokeDirection = new THREE.Vector3();
						var finishSpokeDirection = new THREE.Vector3();
						var middleSpokeEndpoint = new THREE.Vector3();
						var spokeWorkingVector = new THREE.Vector3();
						// "start spoke" is from the curve center point to the piece's path start point
						startSpokeDirection.copy( centerOffsetVector );	// get a copy of the vector from the path start point to the curve center point
						startSpokeDirection.normalize();	// normalize it to a length of 1
						startSpokeDirection.multiplyScalar( -1.0 );	// reverse it so it's pointing from the center point to the path start point
						// "middle spoke" is from the curve center point to the extra vertex at the midpoint of the left side
						middleSpokeDirection.copy( startSpokeDirection );	// copy the start spoke direction to the middle spoke
						middleSpokeDirection.applyAxisAngle( yAxisDirection, -( currentPieceAngle / 2 ) );	// rotate it clockwise through half the curve angle
						// "finish spoke" is from the curve center point to the piece's path finish point
						finishSpokeDirection.copy( startSpokeDirection );	// copy the start spoke direction to the finish spoke
						finishSpokeDirection.applyAxisAngle( yAxisDirection, -currentPieceAngle );	// rotate it clockwise through the curve angle
						// Locate an end point for middle spoke that's the midpoint of the left side
						spokeWorkingVector.copy( middleSpokeDirection );
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( Math.cos( currentPieceAngle / 2 ) * ( currentPieceRadius - ( trackWidth / 2 ) ) );	// middle spoke direction with length to get from center to midpoint between vertex 1 and vertex 2
						middleSpokeEndpoint.addVectors( centerPoint, spokeWorkingVector );
						// Calculate this piece's finish point and direction
						thisPiece.piecePathFinishPoint = new THREE.Vector3();
						thisPiece.piecePathFinishDirection = new THREE.Vector3();
						spokeWorkingVector.copy( finishSpokeDirection );
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( currentPieceRadius );	// finish spoke direction from center point with length of curve radius
						thisPiece.piecePathFinishPoint.addVectors( centerPoint, spokeWorkingVector );
						// ... the finish direction is the start direction rotated clockwise (right curve) by the piece's angle
						thisPiece.piecePathFinishDirection.copy( thisPiece.piecePathStartDirection );
						thisPiece.piecePathFinishDirection.applyAxisAngle( yAxisDirection, -thisPiece.angle );
						// Make the ten vertices of this small piece of right curve track
						thisPiece.startRightTopVertex = new THREE.Vector3();
						thisPiece.finishRightTopVertex = new THREE.Vector3();
						thisPiece.finishLeftTopVertex = new THREE.Vector3();
						thisPiece.midpointLeftTopVertex = new THREE.Vector3();
						thisPiece.startLeftTopVertex = new THREE.Vector3();
						thisPiece.startRightBottomVertex = new THREE.Vector3();
						thisPiece.finishRightBottomVertex = new THREE.Vector3();
						thisPiece.finishLeftBottomVertex = new THREE.Vector3();
						thisPiece.midpointLeftBottomVertex = new THREE.Vector3();
						thisPiece.startLeftBottomVertex = new THREE.Vector3();
						// Vertex 0 = start right top
						spokeWorkingVector.copy( startSpokeDirection );	// make a vector that reaches from the center to vertex 0
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius - ( trackWidth / 2 ) );
						thisPiece.startRightTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 0
						// Vertex 1 = finish right top
						spokeWorkingVector.copy( finishSpokeDirection );	// make a vector that reaches from the center to vertex 1
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius - ( trackWidth / 2 ) );
						thisPiece.finishRightTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 1
						// Vertex 2 = finish left top
						spokeWorkingVector.copy( finishSpokeDirection );	// make a vector that reaches from the center to vertex 2
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius + ( trackWidth / 2 ) );
						thisPiece.finishLeftTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 2
						// Vertex 3 = midpoint left top
						spokeWorkingVector.copy( middleSpokeDirection );	// make a vector that reaches from the center to vertex 3
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( Math.cos( currentPieceAngle / 2 ) * ( thisPiece.radius + ( trackWidth / 2 ) ) );
						thisPiece.midpointLeftTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 3
						// Vertex 4 = start left top
						spokeWorkingVector.copy( startSpokeDirection );	// make a vector that reaches from the center to vertex 4
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius + ( trackWidth / 2 ) );
						thisPiece.startLeftTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 4
						// (ignore the vertical differences for now...)
						// Vertex 5 = start right bottom
						thisPiece.startRightBottomVertex.copy( thisPiece.startRightTopVertex );
						// Vertex 6 = finish right bottom
						thisPiece.finishRightBottomVertex.copy( thisPiece.finishRightTopVertex );
						// Vertex 7 = finish left bottom
						thisPiece.finishLeftBottomVertex.copy( thisPiece.finishLeftTopVertex );
						// Vertex 8 = midpoint left bottom
						thisPiece.midpointLeftBottomVertex.copy( thisPiece.midpointLeftTopVertex );
						// Vertex 9 = start left bottom
						thisPiece.startLeftBottomVertex.copy( thisPiece.startLeftTopVertex );
						// Push the completed piece onto the list of pieces
						trackSmallPieces.push( thisPiece );
						// Update the "previous" path items so we can process the next small piece
						previousPiecePathFinishPoint.copy( thisPiece.piecePathFinishPoint );
						previousPiecePathFinishDirection.copy( thisPiece.piecePathFinishDirection );
					}
				}
				break;
			case 'left':
				// Get the radius of this section of curved track
				var currentPieceRadius = currentTrackLayoutSections[ sectionIndex ].radius;
				// Figure the piece angle that will give the configured piece length at the given radius
				var fullPieceAngle = ( currentTrackType.small_piece_length / currentPieceRadius );
				// Full pieces are the configured number of millimeters in arc length
				var fullPieceCount = Math.floor( currentTrackLayoutSections[ sectionIndex ].angle / fullPieceAngle );
				// Last piece is whatever it takes to make up the actual given curve angle
				var lastPieceAngle = ( currentTrackLayoutSections[ sectionIndex ].angle ) - ( fullPieceCount * fullPieceAngle );
				for( var currentPiece = 0; currentPiece < ( fullPieceCount + 1 ); currentPiece++ ) {
					var currentPieceAngle;
					if( currentPiece == fullPieceCount ) {
						// This is the odd-sized last piece
						currentPieceAngle = lastPieceAngle;
					} else {
						// This is just another full, one mm piece
						currentPieceAngle = fullPieceAngle;
					}
					// Screen out overly small last pieces
					if( currentPieceAngle > 0.0001 ) {
						// Make the object representing the current piece of track curve
						var thisPiece = new Object();
						thisPiece.pieceType = 'left';
						thisPiece.angle = currentPieceAngle;
						thisPiece.radius = currentPieceRadius;
						// Copy start point and direction from the previous piece's finish point and direction
						thisPiece.piecePathStartPoint = new THREE.Vector3();
						thisPiece.piecePathStartPoint.copy( previousPiecePathFinishPoint );
						thisPiece.piecePathStartDirection = new THREE.Vector3();
						thisPiece.piecePathStartDirection.copy( previousPiecePathFinishDirection );
						// Create the center point of the curve for this piece
						var centerPoint = new THREE.Vector3();
						// - make a vector from the start point to the center point
						var centerOffsetVector = new THREE.Vector3();
						centerOffsetVector.copy( thisPiece.piecePathStartDirection );	// get the piece's start direction
						centerOffsetVector.normalize();	// make it one unit long
						centerOffsetVector.applyAxisAngle( yAxisDirection, Math.PI / 2 );	// rotate it 90 degrees counter-clockwise = direction from path start point to center point
						centerOffsetVector.multiplyScalar( thisPiece.radius ); // give it a length equal to the distance from the center point to all points on the path
						centerPoint.addVectors( thisPiece.piecePathStartPoint, centerOffsetVector );	// set the center point at the sum of the start point location vector and the offset we just made
						// Create spoke vectors from the center point to points of interest on this piece ( midpoint vertex and path finish point )
						var startSpokeDirection = new THREE.Vector3();
						var middleSpokeDirection = new THREE.Vector3();
						var finishSpokeDirection = new THREE.Vector3();
						var middleSpokeEndpoint = new THREE.Vector3();
						var spokeWorkingVector = new THREE.Vector3();
						// "start spoke" is from the curve center point to the piece's path start point
						startSpokeDirection.copy( centerOffsetVector );	// get a copy of the vector from the path start point to the curve center point
						startSpokeDirection.normalize();	// normalize it to a length of 1
						startSpokeDirection.multiplyScalar( -1.0 );	// reverse it so it's pointing from the center point to the path start point
						// "middle spoke" is from the curve center point to the extra vertex at the midpoint of the left side
						middleSpokeDirection.copy( startSpokeDirection );	// copy the start spoke direction to the middle spoke
						middleSpokeDirection.applyAxisAngle( yAxisDirection, ( currentPieceAngle / 2 ) );	// rotate it clockwise through half the curve angle
						// "finish spoke" is from the curve center point to the piece's path finish point
						finishSpokeDirection.copy( startSpokeDirection );	// copy the start spoke direction to the finish spoke
						finishSpokeDirection.applyAxisAngle( yAxisDirection, currentPieceAngle );	// rotate it clockwise through the curve angle
						// Locate an end point for middle spoke that's the midpoint of the left side
						spokeWorkingVector.copy( middleSpokeDirection );
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( Math.cos( currentPieceAngle / 2 ) * ( currentPieceRadius - ( trackWidth / 2 ) ) );	// middle spoke direction with length to get from center to midpoint between vertex 1 and vertex 2
						middleSpokeEndpoint.addVectors( centerPoint, spokeWorkingVector );
						// Calculate this piece's finish point and direction
						thisPiece.piecePathFinishPoint = new THREE.Vector3();
						thisPiece.piecePathFinishDirection = new THREE.Vector3();
						spokeWorkingVector.copy( finishSpokeDirection );
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( currentPieceRadius );	// finish spoke direction from center point with length of curve radius
						thisPiece.piecePathFinishPoint.addVectors( centerPoint, spokeWorkingVector );
						// ... the finish direction is the start direction rotated counter-clockwise (left curve) by the piece's angle
						thisPiece.piecePathFinishDirection.copy( thisPiece.piecePathStartDirection );
						thisPiece.piecePathFinishDirection.applyAxisAngle( yAxisDirection, thisPiece.angle );
						// Make the ten vertices of this small piece of right curve track
						thisPiece.startRightTopVertex = new THREE.Vector3();
						thisPiece.midpointRightTopVertex = new THREE.Vector3();
						thisPiece.finishRightTopVertex = new THREE.Vector3();
						thisPiece.finishLeftTopVertex = new THREE.Vector3();
						thisPiece.startLeftTopVertex = new THREE.Vector3();
						thisPiece.startRightBottomVertex = new THREE.Vector3();
						thisPiece.midpointRightBottomVertex = new THREE.Vector3();
						thisPiece.finishRightBottomVertex = new THREE.Vector3();
						thisPiece.finishLeftBottomVertex = new THREE.Vector3();
						thisPiece.startLeftBottomVertex = new THREE.Vector3();
						// Vertex 0 = start right top
						spokeWorkingVector.copy( startSpokeDirection );	// make a vector that reaches from the center to vertex 0
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius + ( trackWidth / 2 ) );
						thisPiece.startRightTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 0
						// Vertex 1 = midpoint right top
						spokeWorkingVector.copy( middleSpokeDirection );	// make a vector that reaches from the center to vertex 1
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( Math.cos( currentPieceAngle / 2 ) * ( thisPiece.radius + ( trackWidth / 2 ) ) );
						thisPiece.midpointRightTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 1
						// Vertex 2 = finish right top
						spokeWorkingVector.copy( finishSpokeDirection );	// make a vector that reaches from the center to vertex 2
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius + ( trackWidth / 2 ) );
						thisPiece.finishRightTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 2
						// Vertex 3 = finish left top
						spokeWorkingVector.copy( finishSpokeDirection );	// make a vector that reaches from the center to vertex 3
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius - ( trackWidth / 2 ) );
						thisPiece.finishLeftTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 3
						// Vertex 4 = start left top
						spokeWorkingVector.copy( startSpokeDirection );	// make a vector that reaches from the center to vertex 4
						spokeWorkingVector.normalize();
						spokeWorkingVector.multiplyScalar( thisPiece.radius - ( trackWidth / 2 ) );
						thisPiece.startLeftTopVertex.addVectors( centerPoint, spokeWorkingVector );	// place vertex 4
						// (ignore vertical distances for now...)
						// Vertex 5 = start right bottom
						thisPiece.startRightBottomVertex.copy( thisPiece.startRightTopVertex );
						// Vertex 6 = midpoint right bottom
						thisPiece.midpointRightBottomVertex.copy( thisPiece.midpointRightTopVertex );
						// Vertex 7 = finish right bottom
						thisPiece.finishRightBottomVertex.copy( thisPiece.finishRightTopVertex );
						// Vertex 8 = finish left bottom
						thisPiece.finishLeftBottomVertex.copy( thisPiece.finishLeftTopVertex );
						// Vertex 9 = start left bottom
						thisPiece.startLeftBottomVertex.copy( thisPiece.startLeftTopVertex );
						// Push the completed piece onto the list of pieces
						trackSmallPieces.push( thisPiece );
						// Update the "previous" path items so we can process the next small piece
						previousPiecePathFinishPoint.copy( thisPiece.piecePathFinishPoint );
						previousPiecePathFinishDirection.copy( thisPiece.piecePathFinishDirection );
					}
				}
				break;
			default:
				alert( "I should not be here ( figureTrackPieces()-switch-default )" );
				break;
		}
		// Record the piece index where this section ends
		currentTrackLayoutSections[ sectionIndex ].endPieceIndex = trackSmallPieces.length - 1;
	}
};

// Traverse a track layout list and track small pieces and generate elevations for each track path point that give both
//	smooth slope changes and the desired rise and fall per track section given in the track layout list
function figureTrackElevations() {
	// If the current section has zero rise or fall then the entire section is declared flat and all of its
	//	pieces have the same elevation. Otherwise:
	// ...if the bordering section (on either side) is flat (has no rise or fall), all the elevation smoothing adjustment is done in
	//	this current section - which is to say that the point where the two sections meet is assigned
	//	a slope of zero.
	// If the bordering section has a rise or fall, the point where the two sections meet is assigned a slope which
	//	is equal to the average of that section's overall slope and this section's overall slope. "Overall slope" here
	//	is taken as the rise or fall of the section divided by the length of the section.
	var previousSectionRise, currentSectionRise, nextSectionRise;
	var previousSectionLength, currentSectionLength, nextSectionLength;
	var previousSectionSlopeAngle, currentSectionSlopeAngle, nextSectionSlopeAngle;
	var currentSectionStartingSlopeAngle, currentSectionEndingSlopeAngle;
	var previousSectionIndex, nextSectionIndex;
	var sectionStartElevation, sectionEndElevation;
	// Traverse all the sections in the track adjusting piece start/finish elevations as needed
	for( var currentSectionIndex = 0; currentSectionIndex < currentTrackLayoutSections.length; currentSectionIndex++ ) {
		// Assign the elevation of the first piece of the current section...
		//	if this is the first section then the starting elevation is that of the track's origin point
		//	otherwise the starting elevation is the ending elevation of the last piece in the previous section
		if( currentSectionIndex == 0 ) {
			// This is the first section of the track, use the track origin elevation
			sectionStartElevation = currentTrackLayoutStartingPoint.y;
			trackSmallPieces[ 0 ].piecePathStartPoint.y = currentTrackLayoutStartingPoint.y;
		} else {
			// This is some other section of track, use the previous section's last-piece-finish-path-point elevation
			sectionStartElevation = trackSmallPieces[ currentTrackLayoutSections[ currentSectionIndex - 1 ].endPieceIndex ].piecePathFinishPoint.y;
		}
		// Assign this starting elevation to the path start point of the track small piece at the beginning of this section
		trackSmallPieces[ currentTrackLayoutSections[ currentSectionIndex ].beginPieceIndex ].piecePathStartPoint.y = sectionStartElevation;
		// If this is a section of track with no rise or fall, set all the path points in it to the same elevation and return because we're done
		if( currentTrackLayoutSections[ currentSectionIndex ].rise == 0 ) {
			for( var currentPiece = currentTrackLayoutSections[ currentSectionIndex ].beginPieceIndex; currentPiece <= currentTrackLayoutSections[ currentSectionIndex ].endPieceIndex; currentPiece++ ) {
				trackSmallPieces[ currentPiece ].piecePathStartPoint.y = sectionStartElevation;
				trackSmallPieces[ currentPiece ].piecePathFinishPoint.y = sectionStartElevation;
			}
		} else {
			// Since this is not a flat section, determine which sections border this section
			// - start by assuming we're not at the beginning or end of the track layout
			previousSectionIndex = currentSectionIndex - 1;
			nextSectionIndex = currentSectionIndex + 1;
			// - now check to see if we need to adjust that assumption...
			if( currentSectionIndex == 0 ) {
				// The current section is the first section of the track so the previous section is actually the last section of track
				previousSectionIndex = currentTrackLayoutSections.length - 1;
			}
			if( currentSectionIndex == ( currentTrackLayoutSections.length - 1 ) ) {
				// The current section is the last section of the track so the next section is actually the first section of track
				nextSectionIndex = 0;
			}
			// Figure the raw slopes of our three sections
			previousSectionLength = sectionLength( previousSectionIndex );
			currentSectionLength = sectionLength( currentSectionIndex );
			nextSectionLength = sectionLength( nextSectionIndex );
			previousSectionRise = currentTrackLayoutSections[ previousSectionIndex ].rise;
			currentSectionRise = currentTrackLayoutSections[ currentSectionIndex ].rise;
			nextSectionRise = currentTrackLayoutSections[ nextSectionIndex ].rise;
			previousSectionSlopeAngle = Math.atan( previousSectionRise / previousSectionLength );
			currentSectionSlopeAngle = Math.atan( currentSectionRise / currentSectionLength );
			nextSectionSlopeAngle = Math.atan( nextSectionRise / nextSectionLength );
			// Figure the starting and ending slopes for the current section
			if( Math.abs( previousSectionSlopeAngle ) < currentTrackType.slope_match_angle ) {
				// the previous section has close enough to zero slope
				currentSectionStartingSlopeAngle = 0;
			} else {
				// the previous section also has some slope so average it with the current section and start with that
				currentSectionStartingSlopeAngle = ( previousSectionSlopeAngle + currentSectionSlopeAngle ) / 2;
			}
			if( Math.abs( nextSectionSlopeAngle ) < currentTrackType.slope_match_angle ) {
				// the next section has close enough to zero slope
				currentSectionEndingSlopeAngle = 0;
			} else {
				// the next section also has some slope so average it with the current section and end with that
				currentSectionEndingSlopeAngle = ( nextSectionSlopeAngle + currentSectionSlopeAngle ) / 2;
			}
			// We figured the start elevation of this section above - now add this section's rise to get the section's ending elevation
			sectionEndElevation = sectionStartElevation + currentTrackLayoutSections[ currentSectionIndex ].rise;
			// ... copy the section end elevation to the end of the last small piece of the section
			trackSmallPieces[ currentTrackLayoutSections[ currentSectionIndex ].endPieceIndex ].piecePathFinishPoint.y = sectionEndElevation;
			// Now begin at the starting and ending path points of this section and iterate elevations toward the
			//	center until the section is reasonably smooth vertically
			// The initial center region is the entire section
			var iterationStartElevation = sectionStartElevation;
			var iterationEndElevation = sectionEndElevation;
			var iterationStartingSlopeAngle = currentSectionStartingSlopeAngle;
			var iterationEndingSlopeAngle = currentSectionEndingSlopeAngle;
			var iterationStartingPieceIndex = currentTrackLayoutSections[ currentSectionIndex ].beginPieceIndex;
			var iterationEndingPieceIndex = currentTrackLayoutSections[ currentSectionIndex ].endPieceIndex;
			var nextStartingSlopeAngle, nextEndingSlopeAngle;
			var finished = false, overFlowed = false, loopLimit = 0;
			while( !finished ) {
				// Find the effective slope of this iteration's entire center (i.e. so-far-unprocessed) region
				// ... in each iteration, this "center gap" includes the starting and ending pieces and
				// ... extends from the pathStartPoint of the starting piece to the pathFinishPoint of the ending piece
				var iterationCenterRise = iterationEndElevation - iterationStartElevation;
				var iterationCenterLength = iterationGapLength( iterationStartingPieceIndex, iterationEndingPieceIndex );
				var iterationCenterSlopeAngle = Math.atan( iterationCenterRise / iterationCenterLength );
				var iterationStartingSlopeVariance = Math.abs( iterationCenterSlopeAngle - iterationStartingSlopeAngle );
				var iterationEndingSlopeVariance  = Math.abs( iterationCenterSlopeAngle - iterationEndingSlopeAngle );
				// If the variance in slope of the center region and each end piece is less than the configured maximum, we're done with smoothing.
				//	if it's not, then we need to put a that maximum slope change on the end small piece(s), re-figure what the
				//	remaining gap is and try again.
				if( ( iterationStartingSlopeVariance < currentTrackType.slope_match_angle ) &&
					( iterationEndingSlopeVariance < currentTrackType.slope_match_angle ) ) {
					// It's smooth enough now
					finished = true;
				} else {
					if( iterationStartingSlopeVariance >= currentTrackType.slope_match_angle ) {
						// We need to adjust the starting piece and iterate again
						// Adjust the starting slope by one degree in the needed direction
						// Get the starting slope in degrees
						var adjustmentSlopeAngle = iterationStartingSlopeAngle;
						// Shift it one degree toward the center gap slope
						if( iterationCenterSlopeAngle > adjustmentSlopeAngle ) {
							adjustmentSlopeAngle += currentTrackType.slope_match_angle;
						} else {
							adjustmentSlopeAngle -= currentTrackType.slope_match_angle;
						}
						// This becomes the starting slope for the next iteration
						nextStartingSlopeAngle = adjustmentSlopeAngle;
						// Using the original starting slope, figure the elevation change over the piece that we're about to remove from the center gap
						var iterationStartingPieceRise = smallPieceLength( iterationStartingPieceIndex ) * Math.tan( iterationStartingSlopeAngle );
						// And apply that elevation change to the end of this piece and copy it to the start of the next piece
						trackSmallPieces[ iterationStartingPieceIndex ].piecePathFinishPoint.y = trackSmallPieces[ iterationStartingPieceIndex ].piecePathStartPoint.y + iterationStartingPieceRise;
						trackSmallPieces[ iterationStartingPieceIndex + 1 ].piecePathStartPoint.y = trackSmallPieces[ iterationStartingPieceIndex ].piecePathFinishPoint.y;
						// Now step past this piece to set up for the next iteration
						iterationStartingPieceIndex++;
						iterationStartingSlopeAngle = nextStartingSlopeAngle;
					}
					if( iterationEndingSlopeVariance >= currentTrackType.slope_match_angle ) {
						// We need to adjust the ending piece and iterate again
						// Adjust the ending slope by one degree in the needed direction
						// ( same logic as above for starting slope )
						var adjustmentSlopeAngle = iterationEndingSlopeAngle;
						if( iterationCenterSlopeAngle > adjustmentSlopeAngle ) {
							adjustmentSlopeAngle += currentTrackType.slope_match_angle;
						} else {
							adjustmentSlopeAngle -= currentTrackType.slope_match_angle;
						}
						nextEndingSlopeAngle = adjustmentSlopeAngle;
						// Figure the elevation change for the ending piece we're about to declare processed
						var iterationEndingPieceRise = smallPieceLength( iterationEndingPieceIndex ) * Math.tan( iterationEndingSlopeAngle );
						trackSmallPieces[ iterationEndingPieceIndex ].piecePathStartPoint.y = trackSmallPieces[ iterationEndingPieceIndex ].piecePathFinishPoint.y - iterationEndingPieceRise;
						trackSmallPieces[ iterationEndingPieceIndex - 1 ].piecePathFinishPoint.y = trackSmallPieces[ iterationEndingPieceIndex ].piecePathStartPoint.y;
						iterationEndingPieceIndex--;
						iterationEndingSlopeAngle = nextEndingSlopeAngle;
					}
				}
				loopLimit++;
				if( loopLimit > 500 ) {
					overFlowed = true;
					finished = true;
				}
				if( overFlowed ) {
					alert( "I should not be here - overflowed in figureTrackElevations()" );
				}
				// Now that the smoothing is done, fill in the remaining center gap with simple linear sloping
				// A linear slope from the pathStartPoint of the last iteration's beginning piece to the
				//	pathFinishPoint of the last iteration's ending piece will do nicely.
				var remainingRise = trackSmallPieces[ iterationEndingPieceIndex ].piecePathFinishPoint.y - trackSmallPieces[ iterationStartingPieceIndex ].piecePathStartPoint.y;
				var remainingPieceCount = iterationEndingPieceIndex - iterationStartingPieceIndex + 1;
				var incrementalRise = remainingRise / remainingPieceCount;
				// Traverse all the pieces remaining in the center gap of the section and assign linearly increasing elevations
				for( var currentPieceIndex = iterationStartingPieceIndex; currentPieceIndex <= iterationEndingPieceIndex; currentPieceIndex++ ) {
					// Insert the incremental rise in the current piece
					trackSmallPieces[ currentPieceIndex ].piecePathFinishPoint.y = trackSmallPieces[ currentPieceIndex ].piecePathStartPoint.y + incrementalRise;
					// IF the current piece is NOT the last piece in the center gap, copy the ending elevation of the current piece into the beginning elevation of the next piece
					if( currentPieceIndex != iterationEndingPieceIndex ) {
						trackSmallPieces[ currentPieceIndex + 1 ].piecePathStartPoint.y = trackSmallPieces[ currentPieceIndex ].piecePathFinishPoint.y;
					}
				}
			}
		}
	}
};

// Apply the track elevations assigned to the track path points to the corresponding vertices needed for mesh and body generation
function copyPathElevationsToVertices() {
	for( var currentPieceIndex = 0; currentPieceIndex < trackSmallPieces.length; currentPieceIndex++ ) {
		var pathPieceStartTopElevation = trackSmallPieces[ currentPieceIndex ].piecePathStartPoint.y;
		var pathPieceStartBottomElevation = pathPieceStartTopElevation - currentTrackType.thickness;
		var pathPieceFinishTopElevation = trackSmallPieces[ currentPieceIndex ].piecePathFinishPoint.y;
		var pathPieceFinishBottomElevation = pathPieceFinishTopElevation - currentTrackType.thickness;
		var pathPieceMidpointTopElevation = ( ( pathPieceStartTopElevation + pathPieceFinishTopElevation ) / 2 );
		var pathPieceMidpointBottomElevation = pathPieceMidpointTopElevation - currentTrackType.thickness;
		switch( trackSmallPieces[ currentPieceIndex ].pieceType ) {
			case 'straight':
				trackSmallPieces[ currentPieceIndex ].startRightTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].startRightBottomVertex.y = pathPieceStartBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex.y = pathPieceStartBottomElevation;
				break;
			case 'right':
				trackSmallPieces[ currentPieceIndex ].startRightTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].midpointLeftTopVertex.y = pathPieceMidpointTopElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].startRightBottomVertex.y = pathPieceStartBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].midpointLeftBottomVertex.y = pathPieceMidpointBottomElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex.y = pathPieceStartBottomElevation;
				break;
			case 'left':
				trackSmallPieces[ currentPieceIndex ].startRightTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].midpointRightTopVertex.y = pathPieceMidpointTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex.y = pathPieceFinishTopElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftTopVertex.y = pathPieceStartTopElevation;
				trackSmallPieces[ currentPieceIndex ].startRightBottomVertex.y = pathPieceStartBottomElevation;
				trackSmallPieces[ currentPieceIndex ].midpointRightBottomVertex.y = pathPieceMidpointBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex.y = pathPieceFinishBottomElevation;
				trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex.y = pathPieceStartBottomElevation;
				break;
			default:
				alert( "I should not be here ( makeTrackMeshAndBody()-switch-default )" );
				break;
		}
	}
};

// Now that the path points of the pieces have all three dimensions figured out, generate the centers of the pieces
//	using the start and finish path points.
function figureTrackPieceCenters() {
	// We take the center of each piece - straight or curve - to be the midpoint between the track path start and
	//	track path finish points dropped vertically by half the track thickness
	for( currentPieceIndex = 0; currentPieceIndex < trackSmallPieces.length; currentPieceIndex++ ) {
		// Make a vector running from the piece's path start point to the piece's path end point
		var trackPiecePath = new THREE.Vector3();
		trackPiecePath.subVectors( trackSmallPieces[ currentPieceIndex ].piecePathFinishPoint, trackSmallPieces[ currentPieceIndex ].piecePathStartPoint );
		// Cut the length of that vector in half
		trackPiecePath.multiplyScalar( 0.5 );
		// Make a vector by adding this new vector to the piece's path start point.
		var trackPieceCenterPoint = new THREE.Vector3();
		trackPieceCenterPoint.addVectors( trackSmallPieces[ currentPieceIndex ].piecePathStartPoint, trackPiecePath );
		// Now drop that vector vertically by half the thickness of the track piece
		trackPieceCenterPoint.y -= ( currentTrackType.thickness / 2 );
		// The result is the global location of the center of the piece
		trackSmallPieces[ currentPieceIndex ].center = trackPieceCenterPoint;
	}
};

// Traverse a track layout list of small pieces and generate the corresponding meshes to be rendered and bodies for physics functions
// Our track layout system generates the vertices of track pieces in global coordinates. Both Three.js and Cannon.js operate with vertices
//	specified relative to the center of the piece and use the piece position ( the global coordinates of the center of the piece) to come
//	up with the global vertex coordinates.
function makeTrackMeshesAndBodies() {
	for( var currentPieceIndex = 0; currentPieceIndex < trackSmallPieces.length; currentPieceIndex++ ) {
		var trackPieceGeometry = new THREE.Geometry();
		switch( trackSmallPieces[ currentPieceIndex ].pieceType ) {
			case 'straight':
				// The mesh for a small piece of straight track has eight vertices and eight triangular faces
				var localMeshVertex0 = new THREE.Vector3();
				var localMeshVertex1 = new THREE.Vector3();
				var localMeshVertex2 = new THREE.Vector3();
				var localMeshVertex3 = new THREE.Vector3();
				var localMeshVertex4 = new THREE.Vector3();
				var localMeshVertex5 = new THREE.Vector3();
				var localMeshVertex6 = new THREE.Vector3();
				var localMeshVertex7 = new THREE.Vector3();
				localMeshVertex0.subVectors( trackSmallPieces[ currentPieceIndex ].startRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex1.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex2.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex3.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex4.subVectors( trackSmallPieces[ currentPieceIndex ].startRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex5.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex6.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex7.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				trackPieceGeometry.vertices.push(
					localMeshVertex0,
					localMeshVertex1,
					localMeshVertex2,
					localMeshVertex3,
					localMeshVertex4,
					localMeshVertex5,
					localMeshVertex6,
					localMeshVertex7
				 );
				trackPieceGeometry.faces.push(
					new THREE.Face3( 0, 2, 3 ),
					new THREE.Face3( 0, 1, 2 ),
					new THREE.Face3( 4, 7, 6 ),
					new THREE.Face3( 4, 6, 5 ),
					new THREE.Face3( 0, 5, 1 ),
					new THREE.Face3( 0, 4, 5 ),
					new THREE.Face3( 3, 6, 7 ),
					new THREE.Face3( 3, 2, 6 )
				);
				// The body for a small piece of straight track has eight vertices and six four-sided faces
				var localBodyVertex0 = new CANNON.Vec3(), localBodyVertex1 = new CANNON.Vec3(), localBodyVertex2 = new CANNON.Vec3(), localBodyVertex3 = new CANNON.Vec3(), localBodyVertex4 = new CANNON.Vec3();
				var localBodyVertex5 = new CANNON.Vec3(), localBodyVertex6 = new CANNON.Vec3(), localBodyVertex7 = new CANNON.Vec3();
				localBodyVertex0.copy( localMeshVertex0 );
				localBodyVertex1.copy( localMeshVertex1 );
				localBodyVertex2.copy( localMeshVertex2 );
				localBodyVertex3.copy( localMeshVertex3 );
				localBodyVertex4.copy( localMeshVertex4 );
				localBodyVertex5.copy( localMeshVertex5 );
				localBodyVertex6.copy( localMeshVertex6 );
				localBodyVertex7.copy( localMeshVertex7 );
				var trackPieceBodyPoints = [
					localBodyVertex0,
					localBodyVertex1,
					localBodyVertex2,
					localBodyVertex3,
					localBodyVertex4,
					localBodyVertex5,
					localBodyVertex6,
					localBodyVertex7
					];
				var trackPieceBodyFaces = [
					[ 0, 3, 7, 4 ],
					[ 1, 5, 6, 2 ],
					[ 2, 6, 7, 3 ],
					[ 0, 4, 5, 1 ],
					[ 0, 1, 2, 3 ],
					[ 4, 7, 6, 5 ]
				];
				break;
			case 'right':
				// The mesh for a small piece of curve track has ten vertices and ten triangular faces
				var localMeshVertex0 = new THREE.Vector3();
				var localMeshVertex1 = new THREE.Vector3();
				var localMeshVertex2 = new THREE.Vector3();
				var localMeshVertex3 = new THREE.Vector3();
				var localMeshVertex4 = new THREE.Vector3();
				var localMeshVertex5 = new THREE.Vector3();
				var localMeshVertex6 = new THREE.Vector3();
				var localMeshVertex7 = new THREE.Vector3();
				var localMeshVertex8 = new THREE.Vector3();
				var localMeshVertex9 = new THREE.Vector3();
				localMeshVertex0.subVectors( trackSmallPieces[ currentPieceIndex ].startRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex1.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex2.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex3.subVectors( trackSmallPieces[ currentPieceIndex ].midpointLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex4.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex5.subVectors( trackSmallPieces[ currentPieceIndex ].startRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex6.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex7.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex8.subVectors( trackSmallPieces[ currentPieceIndex ].midpointLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex9.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				trackPieceGeometry.vertices.push(
					localMeshVertex0,
					localMeshVertex1,
					localMeshVertex2,
					localMeshVertex3,
					localMeshVertex4,
					localMeshVertex5,
					localMeshVertex6,
					localMeshVertex7,
					localMeshVertex8,
					localMeshVertex9
				 );
				trackPieceGeometry.faces.push(
					new THREE.Face3( 0, 3, 4 ),
					new THREE.Face3( 0, 1, 3 ),
					new THREE.Face3( 1, 2, 3 ),
					new THREE.Face3( 5, 9, 8 ),
					new THREE.Face3( 5, 8, 6 ),
					new THREE.Face3( 6, 8, 7 ),
					new THREE.Face3( 0, 5, 1 ),
					new THREE.Face3( 1, 5, 6 ),
					new THREE.Face3( 2, 9, 4 ),
					new THREE.Face3( 2, 7, 9 )
				);
				// The body for a small piece of curve track has eight vertices and six four-sided faces...
				//  the midpoints used in the mesh are omitted in the body
				var localBodyVertex0 = new CANNON.Vec3(), localBodyVertex1 = new CANNON.Vec3(), localBodyVertex2 = new CANNON.Vec3(), localBodyVertex3 = new CANNON.Vec3(), localBodyVertex4 = new CANNON.Vec3();
				var localBodyVertex5 = new CANNON.Vec3(), localBodyVertex6 = new CANNON.Vec3(), localBodyVertex7 = new CANNON.Vec3();
				localBodyVertex0.copy( localMeshVertex0 );
				localBodyVertex1.copy( localMeshVertex1 );
				localBodyVertex2.copy( localMeshVertex2 );
				// omit mesh vertex 3 = left top midpoint
				localBodyVertex3.copy( localMeshVertex4 );
				localBodyVertex4.copy( localMeshVertex5 );
				localBodyVertex5.copy( localMeshVertex6 );
				localBodyVertex6.copy( localMeshVertex7 );
				// omit mesh vertex 8 = left bottom midpoint
				localBodyVertex7.copy( localMeshVertex9 );
				var trackPieceBodyPoints = [
					localBodyVertex0,
					localBodyVertex1,
					localBodyVertex2,
					localBodyVertex3,
					localBodyVertex4,
					localBodyVertex5,
					localBodyVertex6,
					localBodyVertex7
					];
				var trackPieceBodyFaces = [
					[ 0, 3, 7, 4 ],
					[ 1, 5, 6, 2 ],
					[ 2, 6, 7, 3 ],
					[ 0, 4, 5, 1 ],
					[ 0, 1, 2, 3 ],
					[ 4, 7, 6, 5 ]
				];
				break;
			case 'left':
				// The mesh for a small piece of curve track has ten vertices and ten triangular faces
				var localMeshVertex0 = new THREE.Vector3();
				var localMeshVertex1 = new THREE.Vector3();
				var localMeshVertex2 = new THREE.Vector3();
				var localMeshVertex3 = new THREE.Vector3();
				var localMeshVertex4 = new THREE.Vector3();
				var localMeshVertex5 = new THREE.Vector3();
				var localMeshVertex6 = new THREE.Vector3();
				var localMeshVertex7 = new THREE.Vector3();
				var localMeshVertex8 = new THREE.Vector3();
				var localMeshVertex9 = new THREE.Vector3();
				localMeshVertex0.subVectors( trackSmallPieces[ currentPieceIndex ].startRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex1.subVectors( trackSmallPieces[ currentPieceIndex ].midpointRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex2.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex3.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex4.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftTopVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex5.subVectors( trackSmallPieces[ currentPieceIndex ].startRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex6.subVectors( trackSmallPieces[ currentPieceIndex ].midpointRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex7.subVectors( trackSmallPieces[ currentPieceIndex ].finishRightBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex8.subVectors( trackSmallPieces[ currentPieceIndex ].finishLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				localMeshVertex9.subVectors( trackSmallPieces[ currentPieceIndex ].startLeftBottomVertex, trackSmallPieces[ currentPieceIndex ].center );
				trackPieceGeometry.vertices.push(
					localMeshVertex0,
					localMeshVertex1,
					localMeshVertex2,
					localMeshVertex3,
					localMeshVertex4,
					localMeshVertex5,
					localMeshVertex6,
					localMeshVertex7,
					localMeshVertex8,
					localMeshVertex9
				 );
				trackPieceGeometry.faces.push(
					new THREE.Face3( 0, 1, 4 ),
					new THREE.Face3( 1, 3, 4 ),
					new THREE.Face3( 1, 2, 3 ),
					new THREE.Face3( 5, 9, 6 ),
					new THREE.Face3( 6, 9, 8 ),
					new THREE.Face3( 6, 8, 7 ),
					new THREE.Face3( 0, 5, 2 ),
					new THREE.Face3( 2, 5, 7 ),
					new THREE.Face3( 3, 9, 4 ),
					new THREE.Face3( 3, 8, 9 )
				);
				// The body for a small piece of curve track has eight vertices and six four-sided faces...
				//  the midpoints used in the mesh are omitted in the body
				var localBodyVertex0 = new CANNON.Vec3(), localBodyVertex1 = new CANNON.Vec3(), localBodyVertex2 = new CANNON.Vec3(), localBodyVertex3 = new CANNON.Vec3(), localBodyVertex4 = new CANNON.Vec3();
				var localBodyVertex5 = new CANNON.Vec3(), localBodyVertex6 = new CANNON.Vec3(), localBodyVertex7 = new CANNON.Vec3();
				localBodyVertex0.copy( localMeshVertex0 );
				// omit mesh vertex 1 = right top midpoint
				localBodyVertex1.copy( localMeshVertex2 );
				localBodyVertex2.copy( localMeshVertex3 );
				localBodyVertex3.copy( localMeshVertex4 );
				localBodyVertex4.copy( localMeshVertex5 );
				// omit mesh vertex 6 = right bottom midpoint
				localBodyVertex5.copy( localMeshVertex7 );
				localBodyVertex6.copy( localMeshVertex8 );
				localBodyVertex7.copy( localMeshVertex9 );
				var trackPieceBodyPoints = [
					localBodyVertex0,
					localBodyVertex1,
					localBodyVertex2,
					localBodyVertex3,
					localBodyVertex4,
					localBodyVertex5,
					localBodyVertex6,
					localBodyVertex7
					];
				var trackPieceBodyFaces = [
					[ 0, 3, 7, 4 ],
					[ 1, 5, 6, 2 ],
					[ 2, 6, 7, 3 ],
					[ 0, 4, 5, 1 ],
					[ 0, 1, 2, 3 ],
					[ 4, 7, 6, 5 ]
				];
				break;
			default:
				alert( "I should not be here ( copyPathElevationsToVertices()-switch-default )" );
				break;
		}
		trackPieceGeometry.computeBoundingSphere();
		trackPieceGeometry.computeFaceNormals();
		var trackPieceMesh = new THREE.Mesh( trackPieceGeometry, new THREE.MeshLambertMaterial( { color:currentTrackType.track_color } ) );
		trackPieceMesh.position.copy( trackSmallPieces[ currentPieceIndex ].center );
		scene.add( trackPieceMesh );
		trackPieceMeshList.push( trackPieceMesh );
		// trackBodyMaterial = new CANNON.Material( "trackBodyMaterial" );
		var trackPieceBody = new CANNON.Body( { material: trackBodyMaterial, mass: 0 } );
		var trackPieceBodyShape = new CANNON.ConvexPolyhedron( trackPieceBodyPoints, trackPieceBodyFaces );
		trackPieceBody.position.copy( trackSmallPieces[ currentPieceIndex ].center );
		trackPieceBodyShape.computeNormals();
		trackPieceBodyShape.updateBoundingSphereRadius();
		trackPieceBody.addShape( trackPieceBodyShape );
		world.add( trackPieceBody );
		trackPieceBodyList.push( trackPieceBody );
	}
};

// Get the length of a section of track
function sectionLength( sectionIndex ) {
	switch( currentTrackLayoutSections[ sectionIndex ].section_type ) {
		case 'straight':
			// For a straight section of track, the length is part of the section specification from the beginning
			return currentTrackLayoutSections[ sectionIndex ].length;
			break;
		case 'right':
		case 'left':
			// For a curved section of track, the length is the curve's radius times its angle in radians
			return ( currentTrackLayoutSections[ sectionIndex ].radius * ( currentTrackLayoutSections[ sectionIndex ].angle ) );
			break;
		default:
			alert( "I should not be here ( sectionLength()-switch-default )" );
			break;
	}
};

// Get the length of a small piece of track
function smallPieceLength( pieceIndex ) {
	switch( trackSmallPieces[ pieceIndex ].pieceType ) {
		case 'straight':
			return trackSmallPieces[ pieceIndex ].pieceLength;
			break;
		case 'right':
		case 'left':
			return ( trackSmallPieces[ pieceIndex ].radius * trackSmallPieces[ pieceIndex ].angle );
			break;
		default:
			alert( "I should not be here ( smallPieceLength()-switch-default )" );
			break;
	}
};

// Get the horizontal length of part of a section of track ("center gap") which extends
//	from the start point of a given starting small piece to the finish point of a given ending small piece
function iterationGapLength( startingPieceIndex, endingPieceIndex ) {
	var returnValue = 1;
	switch( trackSmallPieces[ startingPieceIndex ].pieceType ) {
		case 'straight':
			var gapHorizontalLengthVector = new THREE.Vector3();
			var startPointHorizontalLocation = new THREE.Vector3();
			var endPointHorizontalLocation = new THREE.Vector3();
			// Get the endpoints of the gap's beginning-to-ending straight line
			startPointHorizontalLocation.copy( trackSmallPieces[ startingPieceIndex ].piecePathStartPoint );
			endPointHorizontalLocation.copy( trackSmallPieces[ endingPieceIndex ].piecePathFinishPoint );
			// Project those points onto the horizontal plane
			startPointHorizontalLocation.y = 0;
			endPointHorizontalLocation.y = 0;
			// Take the length of the vector connecting those two points
			gapHorizontalLengthVector.subVectors( endPointHorizontalLocation, startPointHorizontalLocation );
			returnValue = gapHorizontalLengthVector.length();
			break;
		case 'right':
		case 'left':
			var curveRadius;
			var lastPieceLength, remainingPiecesLength;
			// Get the radius of the gap's curve
			curveRadius = trackSmallPieces[ startingPieceIndex ].radius;
			// Since the last piece in the gap might be a shorter-than-normal piece, figure its length individually
			lastPieceLength = trackSmallPieces[ endingPieceIndex ].angle * curveRadius;
			remainingPiecesLength = trackSmallPieces[ startingPieceIndex ].angle * curveRadius * ( endingPieceIndex - startingPieceIndex );
			returnValue = lastPieceLength + remainingPiecesLength;
			break;
		default:
			alert( "I should not be here ( iterationGapLength()-switch-default )" );
			break;
	}
	return returnValue;
};

function makeDragPoint( pointLocation ) {
	var newPointLocation = new THREE.Vector3();
	newPointLocation.copy( pointLocation );
	var newVisiblePointMesh = new THREE.Mesh( new THREE.SphereGeometry( currentTrackType.drag_point_radius ), new THREE.MeshLambertMaterial( { color:currentTrackType.drag_point_color } ) );
	newVisiblePointMesh.position.copy( pointLocation );
	scene.add( newVisiblePointMesh );
	var newdragPoint = {
		location: newPointLocation,
		visible: true,
		mesh: newVisiblePointMesh
	}
	dragPoints.push( newdragPoint );
}
// function turnOnAllDragPoints() {
// 	for( var i = 0; i < dragPoints.length; i++ ) {
// 		if( !dragPoints[ i ].visible ) {
// 			dragPoints[ i ].visible = true;
// 			scene.add( dragPoints[ i ].mesh );
// 		}
// 	}
// 	dragPointsAreVisible = true;
// }
function turnOffAllDragPoints() {
	for( var i = 0; i < dragPoints.length; i++ ) {
		if( dragPoints[ i ].visible ) {
			dragPoints[ i ].visible = false;
			scene.remove( dragPoints[ i ].mesh );
		}
	}
	dragPointsAreVisible = false;
}
function turnOnDragPoint( index ) {
	if( !dragPoints[ index ].visible ) {
		dragPoints[ index ].visible = true;
		scene.add( dragPoints[ index ].mesh );
	}
}
function turnOffDragPoint( index ) {
	// console.log('index: ', index);
	if( dragPoints[ index ].visible ) {
		dragPoints[ index ].visible = false;
		scene.remove( dragPoints[ index ].mesh );
	}
}
function makeDragPointsFromTrackPieces() {
	// Empty the array
	dragPoints.length = 0;
	for( var currentPieceIndex = 0; currentPieceIndex < trackSmallPieces.length; currentPieceIndex++ ) {
		makeDragPoint( trackSmallPieces[ currentPieceIndex ].piecePathStartPoint );
	}
}

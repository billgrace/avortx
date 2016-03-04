<?php
require_once 'core/avortx_init.php';
if(Session::exists('home')) {
	echo '<p>' . Session::flash('home') . '</p>';
}
$adminMode = false;
$user = new User();
?>

<!DOCTYPE html>
<html>
<head>
	<title>Robot Race Track</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<style type="text/css">
		body {
			margin: 0px;
			background-color: #fff;
			overflow: hidden;
		}
	</style>
</head>
<body>
	<div id="messageDisplay" style="color:#332211;background-color:#00FFFF;opacity:0.6;position:absolute;left:0px;top:550px">
	</div>

<?php
// Making editing available to a logged in admin only
if($user->isLoggedIn()&&$user->hasPermission('admin')) {
	$adminMode = true;
?>
	<div id="textInputDiv" style="color:#443322;background-color:#00ccff;opacity:0.8;position:absolute;right:0px;top:50px;display:none">
		<table>
			<tr>
				<td id="textInputLabel1">Parameter 1</td><td><input id="textInput1" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel2">Parameter 2</td><td><input id="textInput2" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel3">Parameter 3</td><td><input id="textInput3" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel4">Parameter 4</td><td><input id="textInput4" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel5">Parameter 5</td><td><input id="textInput5" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel6">Parameter 6</td><td><input id="textInput6" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel7">Parameter 7</td><td><input id="textInput7" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel8">Parameter 8</td><td><input id="textInput8" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel9">Parameter 9</td><td><input id="textInput9" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel10">Parameter 10</td><td><input id="textInput10" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel11">Parameter 11</td><td><input id="textInput11" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel12">Parameter 12</td><td><input id="textInput12" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel13">Parameter 13</td><td><input id="textInput13" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel14">Parameter 14</td><td><input id="textInput14" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel15">Parameter 15</td><td><input id="textInput15" type="text" size="50"></td>
			</tr>
			<tr>
				<td id="textInputLabel16">Parameter 16</td><td><input id="textInput16" type="text" size="50"></td>
			</tr>
		</table>
	</div>
<?php } ?>
	<script type="text/javascript" src="script/three.min.js"></script>
	<script type="text/javascript" src="script/OrbitControls.js"></script>
	<script type="text/javascript" src="script/stats.min.js"></script>
	// <script type="text/javascript" src="script/cannon.min.js"></script>
	<script type="text/javascript" src="script/cannon.js"></script>
	<script type="text/javascript" src="script/CannonDebugRenderer.js"></script>
	<script type="text/javascript" src="script/ajax.js"></script>
	<script type="text/javascript" src="script/animation.js"></script>
	<script type="text/javascript" src="script/background.js"></script>
	<script type="text/javascript" src="script/controls.js"></script>

	<script type="text/javascript" src="script/Projector.js"></script>
	<script type="text/javascript" src="script/CanvasRenderer.js"></script>
	<script type="text/javascript" src="script/RaytracingRenderer.js"></script>
	<script type="text/javascript" src="script/SoftwareRenderer.js"></script>
	<script type="text/javascript" src="script/SVGRenderer.js"></script>
	<script type="text/javascript" src="script/Detector.js"></script>

	<script type="text/javascript" src="script/physics.js"></script>
	<script type="text/javascript" src="script/rendering.js"></script>
	<script type="text/javascript" src="script/robot.js"></script>
	<script type="text/javascript" src="script/robotController.js"></script>
	<script type="text/javascript" src="script/shapes.js"></script>
	<script type="text/javascript" src="script/showVectors.js"></script>
	<script type="text/javascript" src="script/terrain.js"></script>
	<script type="text/javascript" src="script/track.js"></script>
	<script type="text/javascript" src="script/vehicle.js"></script>
	<script type="text/javascript">

		var kbuf;

		var stats;

		init();

		function showMessage( message ) {
			var messageDisplayElement = document.getElementById( "messageDisplay" );
			messageDisplayElement.innerHTML = message;
		}
		function clearMessage() {
			var messageDisplayElement = document.getElementById( "messageDisplay" );
			messageDisplayElement.innerHTML = '';
		}
		function appendMessage( message ) {
			var messageDisplayElement = document.getElementById( "messageDisplay" );
			if( messageDisplayElement.innerHTML.length > 0 ) {
				messageDisplayElement.innerHTML += '<br>';
		}
			messageDisplayElement.innerHTML += message;
		}

		// disable orbit controls when mouse is over input panels to allow text input
		function inputDivOnMouseOver() {
			orbitControls.enabled = false;
		}
		function inputDivOnMouseOut() {
			orbitControls.enabled = true;
		}

<?php if($adminMode) { ?>
		//Dev - Editing buttons...
		function editNothingButtonOnClick( e ) {
			document.getElementById('textInputDiv').style.display = 'none';
			bgButtonPanel.style.display = 'none';
			ttButtonPanel.style.display = 'none';
			tlButtonPanel.style.display = 'none';
			showMessage( '' );
		}
		function editBackgroundButtonOnClick( e ) {
			// document.getElementById('textInputLabel0').innerHTML = "db_id";
			document.getElementById('textInputLabel1').innerHTML = "background_name";
			document.getElementById('textInputLabel2').innerHTML = "author_name";
			document.getElementById('textInputLabel3').innerHTML = "shape_type";
			document.getElementById('textInputLabel4').innerHTML = "shape_parameter_1";
			document.getElementById('textInputLabel5').innerHTML = "shape_parameter_2";
			document.getElementById('textInputLabel6').innerHTML = "shape_parameter_3";
			document.getElementById('textInputLabel7').innerHTML = "shape_parameter_4";
			document.getElementById('textInputLabel8').innerHTML = "shape_parameter_5";
			document.getElementById('textInputLabel9').innerHTML = "shape_parameter_6";
			document.getElementById('textInputLabel10').innerHTML = "auto_locate_flag";
			document.getElementById('textInputLabel11').innerHTML = "image_filename_1";
			document.getElementById('textInputLabel12').innerHTML = "image_filename_2";
			document.getElementById('textInputLabel13').innerHTML = "image_filename_3";
			document.getElementById('textInputLabel14').innerHTML = "image_filename_4";
			document.getElementById('textInputLabel15').innerHTML = "image_filename_5";
			document.getElementById('textInputLabel16').innerHTML = "image_filename_6";
			document.getElementById('textInputDiv').style.display = 'block';
			bgButtonPanel.style.display = 'block';
			ttButtonPanel.style.display = 'none';
			tlButtonPanel.style.display = 'none';
		}
		function editTrackTypeButtonOnClick( e ) {
			// document.getElementById('textInputLabel0').innerHTML = "db_id";
			document.getElementById('textInputLabel1').innerHTML = "track_type_name";
			document.getElementById('textInputLabel2').innerHTML = "author_name";
			document.getElementById('textInputLabel3').innerHTML = "thickness";
			document.getElementById('textInputLabel4').innerHTML = "width";
			document.getElementById('textInputLabel5').innerHTML = "small_piece_length";
			document.getElementById('textInputLabel6').innerHTML = "slope_match_angle";
			document.getElementById('textInputLabel7').innerHTML = "track_color";
			document.getElementById('textInputLabel8').innerHTML = "drag_point_radius";
			document.getElementById('textInputLabel9').innerHTML = "drag_point_color";
			document.getElementById('textInputLabel10').innerHTML = "(not used)";
			document.getElementById('textInputLabel11').innerHTML = "(not used)";
			document.getElementById('textInputLabel12').innerHTML = "(not used)";
			document.getElementById('textInputLabel13').innerHTML = "(not used)";
			document.getElementById('textInputLabel14').innerHTML = "(not used)";
			document.getElementById('textInputLabel15').innerHTML = "(not used)";
			document.getElementById('textInputLabel16').innerHTML = "(not used)";
			document.getElementById('textInputDiv').style.display = 'block';
			ttButtonPanel.style.display = 'block';
			bgButtonPanel.style.display = 'none';
			tlButtonPanel.style.display = 'none';
		}
		function editTrackLayoutButtonOnClick( e ) {
			// document.getElementById('textInputLabel0').innerHTML = "db_id";
			document.getElementById('textInputLabel1').innerHTML = "track_layout_name";
			document.getElementById('textInputLabel2').innerHTML = "author_name";
			document.getElementById('textInputLabel3').innerHTML = "origin.x";
			document.getElementById('textInputLabel4').innerHTML = "origin.y";
			document.getElementById('textInputLabel5').innerHTML = "origin.z";
			document.getElementById('textInputLabel6').innerHTML = "direction.x";
			document.getElementById('textInputLabel7').innerHTML = "direction.y";
			document.getElementById('textInputLabel8').innerHTML = "direction.z";
			document.getElementById('textInputLabel9').innerHTML = "section_type";
			document.getElementById('textInputLabel10').innerHTML = "rise";
			document.getElementById('textInputLabel11').innerHTML = "length";
			document.getElementById('textInputLabel12').innerHTML = "radius";
			document.getElementById('textInputLabel13').innerHTML = "angle (degrees)";
			document.getElementById('textInputLabel14').innerHTML = "(not used)";
			document.getElementById('textInputLabel15').innerHTML = "(not used)";
			document.getElementById('textInputLabel16').innerHTML = "(not used)";
			document.getElementById('textInputDiv').style.display = 'block';
			tlButtonPanel.style.display = 'block';
			bgButtonPanel.style.display = 'none';
			ttButtonPanel.style.display = 'none';
		}
		function addBgButtonOnClick( e ) {
			currentBackground.background_name = document.getElementById( "textInput1" ).value;
			currentBackground.author_name = document.getElementById( "textInput2" ).value;
			currentBackground.shape_type = document.getElementById( "textInput3" ).value;
			currentBackground.shape_parameter_1 = document.getElementById( "textInput4" ).value;
			currentBackground.shape_parameter_2 = document.getElementById( "textInput5" ).value;
			currentBackground.shape_parameter_3 = document.getElementById( "textInput6" ).value;
			currentBackground.shape_parameter_4 = document.getElementById( "textInput7" ).value;
			currentBackground.shape_parameter_5 = document.getElementById( "textInput8" ).value;
			currentBackground.shape_parameter_6 = document.getElementById( "textInput9" ).value;
			currentBackground.auto_locate_flag = document.getElementById( "textInput10" ).value;
			currentBackground.image_filename_1 = document.getElementById( "textInput11" ).value;
			currentBackground.image_filename_2 = document.getElementById( "textInput12" ).value;
			currentBackground.image_filename_3 = document.getElementById( "textInput13" ).value;
			currentBackground.image_filename_4 = document.getElementById( "textInput14" ).value;
			currentBackground.image_filename_5 = document.getElementById( "textInput15" ).value;
			currentBackground.image_filename_6 = document.getElementById( "textInput16" ).value;
			addBackground();
		}
		function chgBgButtonOnClick( e ) {
			var fieldsToChange = Object();
			var field1 = document.getElementById( "textInput1" ).value;
			if( field1 != '' ) {
				fieldsToChange.background_name = field1;
			}
			var field2 = document.getElementById( "textInput2" ).value;
			if( field2 != '' ) {
				fieldsToChange.author_name = field2;
			}
			var field3 = document.getElementById( "textInput3" ).value;
			if( field3 != '' ) {
				fieldsToChange.shape_type = field3;
			}
			var field4 = document.getElementById( "textInput4" ).value;
			if( field4 != '' ) {
				fieldsToChange.shape_parameter_1 = field4;
			}
			var field5 = document.getElementById( "textInput5" ).value;
			if( field5 != '' ) {
				fieldsToChange.shape_parameter_2 = field5;
			}
			var field6 = document.getElementById( "textInput6" ).value;
			if( field6 != '' ) {
				fieldsToChange.shape_parameter_3 = field6;
			}
			var field7 = document.getElementById( "textInput7" ).value;
			if( field7 != '' ) {
				fieldsToChange.shape_parameter_4 = field7;
			}
			var field8 = document.getElementById( "textInput8" ).value;
			if( field8 != '' ) {
				fieldsToChange.shape_parameter_5 = field8;
			}
			var field9 = document.getElementById( "textInput9" ).value;
			if( field9 != '' ) {
				fieldsToChange.shape_parameter_6 = field9;
			}
			var field10 = document.getElementById( "textInput10" ).value;
			if( field10 != '' ) {
				fieldsToChange.auto_locate_flag = field10;
			}
			var field11 = document.getElementById( "textInput11" ).value;
			if( field11 != '' ) {
				fieldsToChange.image_filename_1 = field11;
			}
			var field12 = document.getElementById( "textInput12" ).value;
			if( field12 != '' ) {
				fieldsToChange.image_filename_2 = field12;
			}
			var field13 = document.getElementById( "textInput13" ).value;
			if( field13 != '' ) {
				fieldsToChange.image_filename_3 = field13;
			}
			var field14 = document.getElementById( "textInput14" ).value;
			if( field14 != '' ) {
				fieldsToChange.image_filename_4 = field14;
			}
			var field15 = document.getElementById( "textInput15" ).value;
			if( field15 != '' ) {
				fieldsToChange.image_filename_5 = field15;
			}
			var field16 = document.getElementById( "textInput16" ).value;
			if( field16 != '' ) {
				fieldsToChange.image_filename_6 = field16;
			}
			// changeBackground( dbIdToChange, fieldsToChange );
			changeBackground( currentBackground.db_id, fieldsToChange );
		}
		function rmvBgButtonOnClick( e ) {
			// removeBackground( document.getElementById( "textInput0" ).value );
			removeBackground( currentBackground.db_id );
		}
		function addTtButtonOnClick( e ) {
			currentTrackType.track_type_name = document.getElementById( "textInput1" ).value;
			currentTrackType.author_name = document.getElementById( "textInput2" ).value;
			currentTrackType.thickness = document.getElementById( "textInput3" ).value;
			currentTrackType.width = document.getElementById( "textInput4" ).value;
			currentTrackType.small_piece_length = document.getElementById( "textInput5" ).value;
			currentTrackType.slope_match_angle = document.getElementById( "textInput6" ).value;
			currentTrackType.track_color = document.getElementById( "textInput7" ).value;
			currentTrackType.drag_point_radius = document.getElementById( "textInput8" ).value;
			currentTrackType.drag_point_color = document.getElementById( "textInput9" ).value;
			addTrackType();
		}
		function chgTtButtonOnClick( e ) {
			var fieldsToChange = Object();
			// var dbIdToChange = document.getElementById( "textInput0" ).value;
			var field1 = document.getElementById( "textInput1" ).value;
			if( field1 != '' ) {
				fieldsToChange.track_type_name = field1;
			}
			var field2 = document.getElementById( "textInput2" ).value;
			if( field2 != '' ) {
				fieldsToChange.author_name = field2;
			}
			var field3 = document.getElementById( "textInput3" ).value;
			if( field3 != '' ) {
				fieldsToChange.thickness = field3;
			}
			var field4 = document.getElementById( "textInput4" ).value;
			if( field4 != '' ) {
				fieldsToChange.width = field4;
			}
			var field5 = document.getElementById( "textInput5" ).value;
			if( field5 != '' ) {
				fieldsToChange.small_piece_length = field5;
			}
			var field6 = document.getElementById( "textInput6" ).value;
			if( field6 != '' ) {
				fieldsToChange.slope_match_angle = field6;
			}
			var field7 = document.getElementById( "textInput7" ).value;
			if( field7 != '' ) {
				fieldsToChange.track_color = field7;
			}
			var field8 = document.getElementById( "textInput8" ).value;
			if( field8 != '' ) {
				fieldsToChange.drag_point_radius = field8;
			}
			var field9 = document.getElementById( "textInput9" ).value;
			if( field9 != '' ) {
				fieldsToChange.drag_point_color = field9;
			}
			// changeTrackType( dbIdToChange, fieldsToChange );
			changeTrackType( currentTrackType.db_id, fieldsToChange );
		}
		function rmvTtButtonOnClick( e ) {
			// removeTrackType( document.getElementById( "textInput0" ).value );
			removeTrackType( currentTrackType.db_id );
		}
		function strtTlButtonOnClick( e ) {
			toBeAddedTrackLayoutSections = [];
			toBeAddedTrackLayoutLayoutName = document.getElementById( "textInput1" ).value;
			toBeAddedTrackLayoutAuthorName = document.getElementById( "textInput2" ).value;
			toBeAddedTrackLayoutStartingPoint.set(
				parseFloat( document.getElementById( "textInput3" ).value ),
				parseFloat( document.getElementById( "textInput4" ).value ),
				parseFloat( document.getElementById( "textInput5" ).value ) );
			toBeAddedTrackLayoutStartingDirection.set(
				parseFloat( document.getElementById( "textInput6" ).value ),
				parseFloat( document.getElementById( "textInput7" ).value ),
				parseFloat( document.getElementById( "textInput8" ).value ) );
		}
		function addTlButtonOnClick( e ) {
			newSection = new Object();
			newSection.section_type = document.getElementById( "textInput9" ).value;
			newSection.rise = parseFloat( document.getElementById( "textInput10" ).value );
			switch( newSection.section_type ) {
				case 'straight':
					newSection.length = parseFloat( document.getElementById( "textInput11" ).value );
					break;
				case 'right':
				case 'left':
					newSection.radius = parseFloat( document.getElementById( "textInput12" ).value );
					newSection.angle = ( Math.PI * parseFloat( document.getElementById( "textInput13" ).value ) / 180.0 );
					break;
				default:
					alert( 'switch default in addTlButtonOnClick');
					break;
			}
			toBeAddedTrackLayoutSections.push( newSection );
		}
		function sndTlButtonOnClick( e ) {
			addTrackLayout();
		}
		function chgTlButtonOnClick( e ) {
			// Replace the track layout in the database that has the currentTrackLayout.db_id to the one now in toBeAddedTrackLayout local storage
			changeTrackLayout();
		}
		function rmvTlButtonOnClick( e ) {
			// removeTrackLayout( document.getElementById( "textInput0" ).value );
			removeTrackLayout( currentTrackLayoutLayoutId );
		}
		//Dev - Some buttons...
<?php } ?>
		//All users (regular OR admin) - need to choose database items
		function chooseRbButtonOnClick( e ) {
			disableChooseButtons( 'Rb' );
			emptyGlobalListBox();
			needToshowRobotListWhenAvailable = true;
			chooseRobot();
		}
		function chooseBgButtonOnClick( e ) {
			disableChooseButtons( 'Bg' );
			emptyGlobalListBox();
			needToshowBackgroundListWhenAvailable = true;
			chooseBackground();
		}
		function chooseTtButtonOnClick( e ) {
			disableChooseButtons( 'Tt' );
			emptyGlobalListBox();
			needToshowTrackTypeListWhenAvailable = true;
			chooseTrackType();
		}
		function chooseTlButtonOnClick( e ) {
			disableChooseButtons( 'Tl' );
			emptyGlobalListBox();
			needToshowTrackLayoutListWhenAvailable = true;
			chooseTrackLayout();
		}
		function enableChooseRbButton() {
			document.getElementById( "chooseRbButton" ).disabled = false;
		}
		function disableChooseRbButton() {
			document.getElementById( "chooseRbButton" ).disabled = true;
		}
		function enableChooseBgButton() {
			document.getElementById( "chooseBgButton" ).disabled = false;
		}
		function disableChooseBgButton() {
			document.getElementById( "chooseBgButton" ).disabled = true;
		}
		function enableChooseTtButton() {
			document.getElementById( "chooseTtButton" ).disabled = false;
		}
		function disableChooseTtButton() {
			document.getElementById( "chooseTtButton" ).disabled = true;
		}
		function enableChooseTlButton() {
			document.getElementById( "chooseTlButton" ).disabled = false;
		}
		function disableChooseTlButton() {
			document.getElementById( "chooseTlButton" ).disabled = true;
		}
		function enableChooseButtons() {
			enableChooseRbButton();
			enableChooseBgButton();
			enableChooseTtButton();
			enableChooseTlButton();
		}
		function disableChooseButtons( exceptFor ) {
			if( exceptFor != 'Rb' ) {
				disableChooseRbButton();
			}
			if( exceptFor != 'Bg' ) {
				disableChooseBgButton();
			}
			if( exceptFor != 'Tt' ) {
				disableChooseTtButton();
			}
			if( exceptFor != 'Tl' ) {
				disableChooseTlButton();
			}
		}

		//All users (regular OR admin) - need to choose database items

		function init() {
			animationStepCallbackList.push('indexAnimationStepCallback');
			animationRestartCallbackList.push('indexAnimationRestartCallback');

			scene = new THREE.Scene();

			world = new CANNON.World();

			var chooseButtonPanel = document.createElement( "div" );
			chooseButtonPanel.style.cssText = "position:absolute;right:0px;top:0px;display:block";
			chooseButtonPanel.id = "chooseButtonPanel";
			chooseButtonPanel.style.opacity = 0.8;
			chooseButtonPanel.innerHTML = "";
			document.body.appendChild( chooseButtonPanel );

<?php if($adminMode) { ?>
			// Provide normal mouse behavior for text entry fields
			document.getElementById("textInputDiv").addEventListener("mouseover", inputDivOnMouseOver);
			document.getElementById("textInputDiv").addEventListener("mouseout", inputDivOnMouseOut);

			// Edit category select buttons
			var editNothingButtonColor = "#999999";
			var editBackgroundButtonColor = "#88BBFF";
			var editTrackTypeButtonColor = "#88FF55";
			var editTrackLayoutButtonColor = "#FF7755";
			var editNothingButton = document.createElement( "button" );
			editNothingButton.style.backgroundColor = editNothingButtonColor;
			editNothingButton.innerHTML = 'Edit<br>Nothing';
			editNothingButton.onclick = editNothingButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( editNothingButton );
			var editBackgroundButton = document.createElement( "button" );
			editBackgroundButton.style.backgroundColor = editBackgroundButtonColor;
			editBackgroundButton.innerHTML = 'Edit<br>Background';
			editBackgroundButton.onclick = editBackgroundButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( editBackgroundButton );
			var editTrackTypeButton = document.createElement( "button" );
			editTrackTypeButton.style.backgroundColor = editTrackTypeButtonColor;
			editTrackTypeButton.innerHTML = 'Edit<br>TrackType';
			editTrackTypeButton.onclick = editTrackTypeButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( editTrackTypeButton );
			var editTrackLayoutButton = document.createElement( "button" );
			editTrackLayoutButton.style.backgroundColor = editTrackLayoutButtonColor;
			editTrackLayoutButton.innerHTML = 'Edit<br>TrackLayout';
			editTrackLayoutButton.onclick = editTrackLayoutButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( editTrackLayoutButton );

			// Background buttons
			var bgButtonPanel = document.createElement( "div" );
			bgButtonPanel.style.cssText = "position:absolute;right:0px;top:450px;display:none";
			bgButtonPanel.id = "bgButtonPanel";
			bgButtonPanel.style.opacity = 0.8;
			bgButtonPanel.innerHTML = "";
			document.body.appendChild( bgButtonPanel );
			var addBgButton = document.createElement( "button" );
			addBgButton.style.backgroundColor = editBackgroundButtonColor;
			addBgButton.innerHTML = 'Add<br>Background';
			addBgButton.onclick = addBgButtonOnClick;
			bgButtonPanel.appendChild( addBgButton );
			var chgBgButton = document.createElement( "button" );
			chgBgButton.style.backgroundColor = editBackgroundButtonColor;
			chgBgButton.innerHTML = 'Change<br>Background';
			chgBgButton.onclick = chgBgButtonOnClick;
			bgButtonPanel.appendChild( chgBgButton );
			var rmvBgButton = document.createElement( "button" );
			rmvBgButton.style.backgroundColor = editBackgroundButtonColor;
			rmvBgButton.innerHTML = 'Remove<br>Background';
			rmvBgButton.onclick = rmvBgButtonOnClick;
			bgButtonPanel.appendChild( rmvBgButton );

			// Track type buttons
			var ttButtonPanel = document.createElement( "div" );
			ttButtonPanel.style.cssText = "position:absolute;right:0px;top:450px;display:none";
			ttButtonPanel.id = "ttButtonPanel";
			ttButtonPanel.style.opacity = 0.5;
			ttButtonPanel.innerHTML = "";
			document.body.appendChild( ttButtonPanel );
			var addTtButton = document.createElement( "button" );
			addTtButton.style.backgroundColor = editTrackTypeButtonColor;
			addTtButton.innerHTML = 'Add<br>TrackType';
			addTtButton.onclick = addTtButtonOnClick;
			ttButtonPanel.appendChild( addTtButton );
			var chgTtButton = document.createElement( "button" );
			chgTtButton.style.backgroundColor = editTrackTypeButtonColor;
			chgTtButton.innerHTML = 'Chg<br>TrackType';
			chgTtButton.onclick = chgTtButtonOnClick;
			ttButtonPanel.appendChild( chgTtButton );
			var rmvTtButton = document.createElement( "button" );
			rmvTtButton.style.backgroundColor = editTrackTypeButtonColor;
			rmvTtButton.innerHTML = 'Rmv<br>TrackType';
			rmvTtButton.onclick = rmvTtButtonOnClick;
			ttButtonPanel.appendChild( rmvTtButton );

			// Track layout buttons
			var tlButtonPanel = document.createElement( "div" );
			tlButtonPanel.style.cssText = "position:absolute;right:0px;top:450px;display:none";
			tlButtonPanel.id = "tlButtonPanel";
			tlButtonPanel.style.opacity = 0.5;
			tlButtonPanel.innerHTML = "";
			document.body.appendChild( tlButtonPanel );
			var strtTlButton = document.createElement( "button" );
			strtTlButton.style.backgroundColor = editTrackLayoutButtonColor;
			strtTlButton.innerHTML = 'Start<br>TrackLayout';
			strtTlButton.onclick = strtTlButtonOnClick;
			tlButtonPanel.appendChild( strtTlButton );
			var addTlButton = document.createElement( "button" );
			addTlButton.style.backgroundColor = editTrackLayoutButtonColor;
			addTlButton.innerHTML = 'Add<br>TLSection';
			addTlButton.onclick = addTlButtonOnClick;
			tlButtonPanel.appendChild( addTlButton );
			var sndTlButton = document.createElement( "button" );
			sndTlButton.style.backgroundColor = editTrackLayoutButtonColor;
			sndTlButton.innerHTML = 'Send<br>TrackLayout';
			sndTlButton.onclick = sndTlButtonOnClick;
			tlButtonPanel.appendChild( sndTlButton );
			var chgTlButton = document.createElement( "button" );
			chgTlButton.style.backgroundColor = editTrackLayoutButtonColor;
			chgTlButton.innerHTML = 'Change<br>TrackLayout';
			chgTlButton.onclick = chgTlButtonOnClick;
			tlButtonPanel.appendChild( chgTlButton );
			var rmvTlButton = document.createElement( "button" );
			rmvTlButton.style.backgroundColor = editTrackLayoutButtonColor;
			rmvTlButton.innerHTML = 'Remove<br>TrackLayout';
			rmvTlButton.onclick = rmvTlButtonOnClick;
			tlButtonPanel.appendChild( rmvTlButton );

			//Dev - Some buttons...
<?php } ?>
			// Both Admin AND non-Admin users need the "choose" buttons
			var userChooseButtonColor = "#FFFFFF";
			var chooseRbButton = document.createElement( "button" );
			chooseRbButton.id = "chooseRbButton";
			chooseRbButton.style.backgroundColor = userChooseButtonColor;
			chooseRbButton.innerHTML = 'Choose<br>Robot';
			chooseRbButton.onclick = chooseRbButtonOnClick;
			chooseRbButton.ontouchstart = chooseRbButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( chooseRbButton );

			var chooseBgButton = document.createElement( "button" );
			chooseBgButton.id = "chooseBgButton";
			chooseBgButton.style.backgroundColor = userChooseButtonColor;
			chooseBgButton.innerHTML = 'Choose<br>Background';
			chooseBgButton.onclick = chooseBgButtonOnClick;
			chooseBgButton.ontouchstart = chooseBgButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( chooseBgButton );

			var chooseTtButton = document.createElement( "button" );
			chooseTtButton.id = "chooseTtButton";
			chooseTtButton.style.backgroundColor = userChooseButtonColor;
			chooseTtButton.innerHTML = 'Choose<br>Track type';
			chooseTtButton.onclick = chooseTtButtonOnClick;
			chooseTtButton.ontouchstart = chooseTtButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( chooseTtButton );

			var chooseTlButton = document.createElement( "button" );
			chooseTlButton.id = "chooseTlButton";
			chooseTlButton.style.backgroundColor = userChooseButtonColor;
			chooseTlButton.innerHTML = 'Choose<br>Track layout';
			chooseTlButton.onclick = chooseTlButtonOnClick;
			chooseTlButton.ontouchstart = chooseTlButtonOnClick;
			document.getElementById("chooseButtonPanel").appendChild( chooseTlButton );

			initializeAnimation();
			initializeBackground();
			initializePhysics();
			initializeRendering();
			initializeRobot();
			initializeTerrain();
			initializeTrack();
			initializeVehicle();

			restartAnimation();

			document.addEventListener( "keydown", checkKeyDown );
			// window.addEventListener( "resize", onWindowResize, false );
			// window.addEventListener( "orientationchange", onWindowResize, false );

			stats = new Stats();
			stats.domElement.style.position = "absolute";
			stats.domElement.style.top = "0px";
			stats.domElement.style.left = "0px";
			document.body.appendChild( stats.domElement );

			animate();
		}

		function checkKeyDown( event ) {
			if( event.defaultPrevented ) return;
			var handled = false;
			var keyCode = event.keyCode;
			if( keyCode !== undefined ) {
				switch( keyCode ) {
					case 13: // enter
						if( kbuf == 'lolol' ) {
<?php if($adminMode) { 
	echo "window.open( 'logout.php', '_self' );";
	} else {
	echo "window.open( 'login.php', '_self' );";
	}
?>
						}
						break;
					case 32: // space bar
						kbuf = '';
						break;
					case 76: // L
						kbuf += 'l';
						break;
					case 79: // O
						kbuf += 'o';
						break;
					default:
						break;
				}
			}
			if( handled ) {
				event.preventDefault();
			}
		}

		function indexAnimationStepCallback() {
			// pollControls();
			stats.update();
		}

		function indexAnimationRestartCallback() {
			
		}
	</script>
</body>
</html>

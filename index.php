<?php
require_once 'core/avortx_init.php';

if(Session::exists('home')) {
	echo '<p>' . Session::flash('home') . '</p>';
}

$user = new User();
// if($user->isLoggedIn()) {
// ?>
<!--
	<p>Hello <a href="profile.php?user=<?php echo escape($user->data()->login_name); ?>"><?php echo escape($user->data()->login_name); ?></a>!</p>

	<ul>
 		<li><a href="update.php">Update details</a></li>
 		<li><a href="changepassword.php">Change password</a></li>
 		<li><a href="logout.php">Log out</a></li>
 	</ul>
 -->
  <?php

// 	if($user->hasPermission('admin')) {
// 		echo '<p>You are an administrator!</p>';
// 	}

// } else {
// 	echo '<h1>You need to <a href="login.php">log in</a> or <a href="register.php">register</a></h1>';
// }
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
	<!-- Dev - buttons, text entry and message display.... -->
	<div id="messageDisplay" style="color:#332211;background-color:#00FFFF;opacity:0.6;position:absolute;left:0px;top:550px">
	</div>
	<div id="textInputDiv" style="color:#443322;background-color:#00ccff;opacity:0.8;position:absolute;right:0px;top:50px;display:none">
		<table>
<!-- 			<tr>
				<td id="textInputLabel0">Parameter 0</td><td><input id="textInput0" type="text" size="50"></td>
			</tr>
 -->			<tr>
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
	<!-- Dev - buttons, text entry and message display.... -->
	<script type="text/javascript" src="script/three.min.js"></script>
	<script type="text/javascript" src="script/OrbitControls.js"></script>
	<script type="text/javascript" src="script/stats.min.js"></script>
	<script type="text/javascript" src="script/cannon.min.js"></script>
	<script type="text/javascript" src="script/CannonDebugRenderer.js"></script>
	<script type="text/javascript" src="script/showVectors.js"></script>
	<script type="text/javascript" src="script/controls.js"></script>
	<script type="text/javascript" src="script/ajax.js"></script>
	<script type="text/javascript" src="script/track.js"></script>
	<script type="text/javascript" src="script/background.js"></script>
	<script type="text/javascript">

		var dragPoints = [], currentDragPoint;
		var currentDragPointBody;

		var animationPaused;

		var frameCount = 0, slowMotion = false, outlineBodies = false;

		var camera, renderer, scene, xLight, yLight, zLight;
		var orbitControls;
		var cameraLookingAtVector = new THREE.Vector3(), cameraMoveVector = new THREE.Vector3();
		var cameraFollowDisplacement = new THREE.Vector3(), cameraRobotDisplacement = new THREE.Vector3();
		var cameraPositioningMode, cameraTetherLength, cameraForwardViewDistance;

		var world, timeStep = 1/60, caDebugOutliner;

		var groundPlaneMesh, groundPlaneBody, groundPlaneGeometry, groundPlaneShape, groundPlaneMaterial;

		var robotBody, robotMesh;

		var stats;

		init();


		var needToshowBackgroundListWhenAvailable = false;
		var needToshowTrackTypeListWhenAvailable = false;
		var needToshowTrackLayoutListWhenAvailable = false;

		//Dev - A general purpose message display place on the left of the screen
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
		//Dev - A general purpose message display place on the left of the screen

		//Dev - disable orbit controls when mouse is over button panel to allow text input
		function textInputDivOnMouseOver() {
			orbitControls.enabled = false;
		}
		function textInputDivOnMouseOut() {
			orbitControls.enabled = true;
		}
		//Dev - disable orbit controls when mouse is over button panel to allow text input

		//Dev - Some buttons...



		// function listboxCallback( listItemObject ) {
		// 	showMessage( 'listboxCallback from item with value = ' + listItemObject.value );
		// }
		// var lb;
		// function test1ButtonOnClick( e ) {
		// 	lb = new listBox( listboxCallback );
		// 	lb.addItem( "Hello?", 1 );
		// 	lb.addItem( "Hey!", 2 );
		// 	lb.addItem( "Hello?", 3 );
		// 	lb.addItem( "Hey!", 4 );
		// 	lb.addItem( "Hello?", 5 );
		// 	lb.addItem( "Hey!", 6 );
		// 	lb.addItem( "Hello?", 7 );
		// 	lb.addItem( "Hey!", 8 );
		// 	lb.addItem( "Hello?", 9 );
		// 	lb.addItem( "Hey!", 10 );
		// 	lb.addItem( "Hello?", 11 );
		// 	lb.addItem( "Hey!", 12 );
		// }
		// function test2ButtonOnClick( e ) {
		// }



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
			document.getElementById('textInputLabel3').innerHTML = "track_layout_id";
			document.getElementById('textInputLabel4').innerHTML = "origin.x";
			document.getElementById('textInputLabel5').innerHTML = "origin.y";
			document.getElementById('textInputLabel6').innerHTML = "origin.z";
			document.getElementById('textInputLabel7').innerHTML = "direction.x";
			document.getElementById('textInputLabel8').innerHTML = "direction.y";
			document.getElementById('textInputLabel9').innerHTML = "direction.z";
			document.getElementById('textInputLabel10').innerHTML = "section_type";
			document.getElementById('textInputLabel11').innerHTML = "rise";
			document.getElementById('textInputLabel12').innerHTML = "length";
			document.getElementById('textInputLabel13').innerHTML = "radius";
			document.getElementById('textInputLabel14').innerHTML = "angle (degrees)";
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
		// function getBgButtonOnClick( e ) {
		// 	getNewBackground( document.getElementById( "textInput0" ).value );
		// }
		function chooseBgButtonOnClick( e ) {
			needToshowBackgroundListWhenAvailable = true;
			chooseBackground();
		}
		function chgBgButtonOnClick( e ) {
			var fieldsToChange = Object();
			// var dbIdToChange = document.getElementById( "textInput0" ).value;
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
		// function getTtButtonOnClick( e ) {
		// 	getNewTrackType( document.getElementById( "textInput0" ).value );
		// }
		function chooseTtButtonOnClick( e ) {
			needToshowTrackTypeListWhenAvailable = true;
			chooseTrackType();
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
			toBeAddedTrackLayoutLayoutName = 
			toBeAddedTrackLayoutAuthorName = 
			toBeAddedTrackLayoutStartingPoint = 
			toBeAddedTrackLayoutStartingDirection
		}
		function addTlButtonOnClick( e ) {
		}
		function sndTlButtonOnClick( e ) {
			addTrackLayout();
		}
		// function getTlButtonOnClick( e ) {
		// 	getNewTrackLayout( document.getElementById( "textInput0" ).value )
		// }
		function chooseTlButtonOnClick( e ) {
			needToshowTrackLayoutListWhenAvailable = true;
			chooseTrackLayout();
		}
		function chgTlButtonOnClick( e ) {
			// Replace the track layout in the database that has the currentTrackLayout.db_id to the one now in toBeAddedTrackLayout local storage
			changeTrackLayout();
		}
		function rmvTlButtonOnClick( e ) {
			// removeTrackLayout( document.getElementById( "textInput0" ).value );
			removeTrackLayout( currentTrackLayout.track_layout_id );
		}
		//Dev - Some buttons...


		function init() {

			scene = new THREE.Scene();

			world = new CANNON.World();
			world.gravity.set( 0, -9.8, 0 );
			world.broadphase = new CANNON.NaiveBroadphase();

			//Dev - some text entry fields on the upper right of the screen
			document.getElementById("textInputDiv").addEventListener("mouseover", textInputDivOnMouseOver);
			document.getElementById("textInputDiv").addEventListener("mouseout", textInputDivOnMouseOut);
			//Dev - some text entry fields on the upper right of the screen

			//Dev - Some buttons...

			// Edit category select buttons
			var editNothingButtonColor = "#999999";
			var editBackgroundButtonColor = "#88BBFF";
			var editTrackTypeButtonColor = "#88FF55";
			var editTrackLayoutButtonColor = "#FF7755";
			var csButtonPanel = document.createElement( "div" );
			csButtonPanel.style.cssText = "position:absolute;right:0px;top:0px;display:block";
			csButtonPanel.id = "csButtonPanel";
			csButtonPanel.style.opacity = 0.8;
			csButtonPanel.innerHTML = "";
			document.body.appendChild( csButtonPanel );
			// var test1Button = document.createElement( 'button' );
			// test1Button.innerHTML = ' Test1 ';
			// test1Button.onclick = test1ButtonOnClick;
			// csButtonPanel.appendChild( test1Button );
			// var test2Button = document.createElement( 'button' );
			// test2Button.innerHTML = ' Test2 ';
			// test2Button.onclick = test2ButtonOnClick;
			// csButtonPanel.appendChild( test2Button );
			var editNothingButton = document.createElement( "button" );
			editNothingButton.style.backgroundColor = editNothingButtonColor;
			editNothingButton.innerHTML = 'Edit<br>Nothing';
			editNothingButton.onclick = editNothingButtonOnClick;
			csButtonPanel.appendChild( editNothingButton );
			var editBackgroundButton = document.createElement( "button" );
			editBackgroundButton.style.backgroundColor = editBackgroundButtonColor;
			editBackgroundButton.innerHTML = 'Edit<br>Background';
			editBackgroundButton.onclick = editBackgroundButtonOnClick;
			csButtonPanel.appendChild( editBackgroundButton );
			var editTrackTypeButton = document.createElement( "button" );
			editTrackTypeButton.style.backgroundColor = editTrackTypeButtonColor;
			editTrackTypeButton.innerHTML = 'Edit<br>TrackType';
			editTrackTypeButton.onclick = editTrackTypeButtonOnClick;
			csButtonPanel.appendChild( editTrackTypeButton );
			var editTrackLayoutButton = document.createElement( "button" );
			editTrackLayoutButton.style.backgroundColor = editTrackLayoutButtonColor;
			editTrackLayoutButton.innerHTML = 'Edit<br>TrackLayout';
			editTrackLayoutButton.onclick = editTrackLayoutButtonOnClick;
			csButtonPanel.appendChild( editTrackLayoutButton );
			// Edit category select buttons

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
			// var getBgButton = document.createElement( "button" );
			// getBgButton.style.backgroundColor = editBackgroundButtonColor;
			// getBgButton.innerHTML = 'Get<br>Background';
			// getBgButton.onclick = getBgButtonOnClick;
			// bgButtonPanel.appendChild( getBgButton );
			var chooseBgButton = document.createElement( "button" );
			chooseBgButton.style.backgroundColor = editBackgroundButtonColor;
			chooseBgButton.innerHTML = 'Choose<br>Background';
			chooseBgButton.onclick = chooseBgButtonOnClick;
			bgButtonPanel.appendChild( chooseBgButton );
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
			var addttButton = document.createElement( "button" );
			addttButton.style.backgroundColor = editTrackTypeButtonColor;
			addttButton.innerHTML = 'Add<br>TrackType';
			addttButton.onclick = addTtButtonOnClick;
			ttButtonPanel.appendChild( addttButton );
			// var getttButton = document.createElement( "button" );
			// getttButton.style.backgroundColor = editTrackTypeButtonColor;
			// getttButton.innerHTML = 'Get<br>TrackType';
			// getttButton.onclick = getTtButtonOnClick;
			// ttButtonPanel.appendChild( getttButton );
			var choosettButton = document.createElement( "button" );
			choosettButton.style.backgroundColor = editTrackTypeButtonColor;
			choosettButton.innerHTML = 'Choose<br>TrackType';
			choosettButton.onclick = chooseTtButtonOnClick;
			ttButtonPanel.appendChild( choosettButton );
			var chgttButton = document.createElement( "button" );
			chgttButton.style.backgroundColor = editTrackTypeButtonColor;
			chgttButton.innerHTML = 'Chg<br>TrackType';
			chgttButton.onclick = chgTtButtonOnClick;
			ttButtonPanel.appendChild( chgttButton );
			var rmvttButton = document.createElement( "button" );
			rmvttButton.style.backgroundColor = editTrackTypeButtonColor;
			rmvttButton.innerHTML = 'Rmv<br>TrackType';
			rmvttButton.onclick = rmvTtButtonOnClick;
			ttButtonPanel.appendChild( rmvttButton );

			// Track layout buttons
			var tlButtonPanel = document.createElement( "div" );
			tlButtonPanel.style.cssText = "position:absolute;right:0px;top:450px;display:none";
			tlButtonPanel.id = "tlButtonPanel";
			tlButtonPanel.style.opacity = 0.5;
			tlButtonPanel.innerHTML = "";
			document.body.appendChild( tlButtonPanel );
			var strttlButton = document.createElement( "button" );
			strttlButton.style.backgroundColor = editTrackLayoutButtonColor;
			strttlButton.innerHTML = 'Start<br>TrackLayout';
			strttlButton.onclick = strtTlButtonOnClick;
			tlButtonPanel.appendChild( strttlButton );
			var addtlButton = document.createElement( "button" );
			addtlButton.style.backgroundColor = editTrackLayoutButtonColor;
			addtlButton.innerHTML = 'Add<br>TLSection';
			addtlButton.onclick = addTlButtonOnClick;
			tlButtonPanel.appendChild( addtlButton );
			var sndtlButton = document.createElement( "button" );
			sndtlButton.style.backgroundColor = editTrackLayoutButtonColor;
			sndtlButton.innerHTML = 'Send<br>TrackLayout';
			sndtlButton.onclick = sndTlButtonOnClick;
			tlButtonPanel.appendChild( sndtlButton );
			// var gettlButton = document.createElement( "button" );
			// gettlButton.style.backgroundColor = editTrackLayoutButtonColor;
			// gettlButton.innerHTML = 'Get<br>TrackLayout';
			// gettlButton.onclick = getTlButtonOnClick;
			// tlButtonPanel.appendChild( gettlButton );
			var choosetlButton = document.createElement( "button" );
			choosetlButton.style.backgroundColor = editTrackLayoutButtonColor;
			choosetlButton.innerHTML = 'Choose<br>TrackLayout';
			choosetlButton.onclick = chooseTlButtonOnClick;
			tlButtonPanel.appendChild( choosetlButton );
			var chgtlButton = document.createElement( "button" );
			chgtlButton.style.backgroundColor = editTrackLayoutButtonColor;
			chgtlButton.innerHTML = 'Change<br>TrackLayout';
			chgtlButton.onclick = chgTlButtonOnClick;
			tlButtonPanel.appendChild( chgtlButton );
			var rmvtlButton = document.createElement( "button" );
			rmvtlButton.style.backgroundColor = editTrackLayoutButtonColor;
			rmvtlButton.innerHTML = 'Remove<br>TrackLayout';
			rmvtlButton.onclick = rmvTlButtonOnClick;
			tlButtonPanel.appendChild( rmvtlButton );

			//Dev - Some buttons...
			initializeTrack();
			initializeBackground();

			camera = new THREE.PerspectiveCamera( 100, 1.3, 1, 10000 );
			camera.position.set( 100, 100, 500);
			renderer = new THREE.WebGLRenderer();
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
			// var ambientLight = new THREE.AmbientLight( 0x555555 );
			// scene.add( ambientLight );

			// currentTrackPathPointBody = new CANNON.Body( { material: new CANNON.Material(), mass: 0 } );
			currentDragPointBody = new CANNON.Body( { material: new CANNON.Material(), mass: 0 } );
			currentDragPointBody.addShape( new CANNON.Sphere( currentTrackType.dragPointRadius ) );
			world.addBody( currentDragPointBody );
			currentDragPoint = 0;

			// caDebugOutliner = new THREE.CannonDebugRenderer( scene, world );

			orbitControls = new THREE.OrbitControls( camera );
			orbitControls.damping = 0.2;
			orbitControls.maxDistance = ( 10000 );
			orbitControls.addEventListener( 'change', render );

			// visibleAxes = new THREE.AxisHelper( 300 );
			// visibleAxesVisible = false;
			// cannonAxes = new CannonAxes( 400 );
			// cannonAxesVisible = false;
			// visibleCameraVector = new VisibleVector( camera.getWorldDirection(), camera.position, 500, 1.0, 0.5, 1.0 );
			// scene.add( visibleCameraVector );

			robotMesh = new THREE.Mesh( new THREE.SphereGeometry( currentTrackType.width / 3 ), new THREE.MeshLambertMaterial( { color: 0x6789ab } ) );
			scene.add( robotMesh );
			var robotBodyMaterial = new CANNON.Material();
			robotBody = new CANNON.Body( { material: robotBodyMaterial, mass: 100, linearDamping: 0.9, angularDamping: 0 } );
			robotBody.addShape( new CANNON.Sphere( currentTrackType.width / 3 ) );
			world.addBody( robotBody );

			var mainSpring = new CANNON.Spring( currentDragPointBody, robotBody, {
				localAnchorA: new CANNON.Vec3( 0, 0, 0 ),
				localAnchorB: new CANNON.Vec3( 0, 0, 0 ),
				restLength: 0,
				stiffness: 2000,
				damping: 1
			} );
			world.addEventListener( "postStep", function( event ) {
				mainSpring.applyForce();
			} );
			var robotTrackMaterialContactEquation = new CANNON.ContactMaterial( robotBodyMaterial, trackBodyMaterial, { friction: 0, restitution: 0.0 } );
			world.addContactMaterial( robotTrackMaterialContactEquation );

			restartAnimation();


			camera.position.copy( currentTrackLayoutStartingPoint );
			camera.position.z += 50;


			// document.addEventListener( "keydown", checkKeyDown );
			window.addEventListener( "resize", onWindowResize, false );
			window.addEventListener( "orientationchange", onWindowResize, false );

			stats = new Stats();
			stats.domElement.style.position = "absolute";
			stats.domElement.style.top = "0px";
			stats.domElement.style.right = "50%";
			document.body.appendChild( stats.domElement );

			animationPaused = false;

			animate();
		}

		function moveMeshToBody() {
			robotMesh.position.copy( robotBody.position );
		}

		function onWindowResize() {
			var layout = "portrait";
			if( window.innerWidth > window.innerHeight )
				layout = "landscape";
		}

		function restartAnimation() {
			robotBody.position.copy( currentTrackLayoutStartingPoint );
			robotBody.position.y += currentTrackType.width / 3;
			currentDragPoint = 0;
		}

		function processPhysics() {
			currentDragPointBody.position.copy( dragPoints[ currentDragPoint ].location );
			world.step( timeStep );
			moveMeshToBody();
		}

		function render() {
			renderer.setSize( window.innerWidth, window.innerHeight );
			camera.updateProjectionMatrix();
			// visibleCameraVector.update( cameraLookingAtVector );
			renderer.render( scene, camera );
		}

		function animate() {
			requestAnimationFrame( animate );
			stats.update();

			if( needToshowBackgroundListWhenAvailable ) {
				if( !backgroundAjaxExchangePending ) {
					needToshowBackgroundListWhenAvailable = false;
					makeBackgroundListBox();
					// var message = 'Backgrounds:<br>';
					// for( var i = 0; i < backgroundListOfNamesAndIds.length; i++ ) {
					// 	message += 'db_id: ' + backgroundListOfNamesAndIds[ i ][ 'db_id' ] +
					// 				', name: ' + backgroundListOfNamesAndIds[ i ][ 'background_name' ] + '<br>';
					// }
					// appendMessage( message );
				}
			}

			if( needToshowTrackTypeListWhenAvailable ) {
				if( !trackTypeAjaxExchangePending ) {
					needToshowTrackTypeListWhenAvailable = false;
					makeTrackTypeListBox();
					// var message = 'Track types:<br>';
					// for( var i = 0; i < trackTypeListOfNamesAndIds.length; i++ ) {
					// 	message += 'db_id: ' + trackTypeListOfNamesAndIds[ i ][ 'db_id' ] +
					// 				', name: ' + trackTypeListOfNamesAndIds[ i ][ 'track_type_name' ] + '<br>';
					// }
					// appendMessage( message );
				}
			}

			if( needToshowTrackLayoutListWhenAvailable ) {
				if( !trackLayoutAjaxExchangePending ) {
					needToshowTrackLayoutListWhenAvailable = false;
					makeTrackLayoutListBox();
					// var message = 'Track Layouts:<br>';
					// for( var i = 0; i < trackLayoutListOfNamesAndIds.length; i++ ) {
					// 	message += 'db_id: ' + trackLayoutListOfNamesAndIds[ i ][ 'track_layout_id' ] +
					// 				', name: ' + trackLayoutListOfNamesAndIds[ i ][ 'track_layout_name' ] + '<br>';
					// }
					// appendMessage( message );
				}
			}

			if( animationPaused ) return;
			var timeToAnimate;
			frameCount++;
			if( slowMotion ) {
				timeToAnimate = ( 0 ==  ( frameCount % 25 ) );
			} else {
				timeToAnimate = true;
			}
			if( ( frameCount % 3 ) == 0 ) {
				turnOffDragPoint( currentDragPoint );
				currentDragPoint++;
				if( currentDragPoint >= dragPoints.length ) { currentDragPoint = 0; }
				turnOnDragPoint( currentDragPoint );
			}
			if( timeToAnimate ) {
				processPhysics();
				// if( outlineBodies )
				// 	caDebugOutliner.update();
				// else
				// 	caDebugOutliner.depopulate();

				render();
			}
		}
	</script>
</body>
</html>

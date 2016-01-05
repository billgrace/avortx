<?php
require_once 'core/avortx_init.php';

/*
functions & arguments for ajax exchanges

	'function='				'id='															'json='							returns:

	'add_background'																		<new background object>			"OK" or "Error:..."
	'get_background'		<numeric background db id> or <text background name>											background object as json or "Error:..."
	'get_background_list'																									list of background db_id's & background_names as json or "Error:..."
	'change_background'		<numeric background db id>										<object with changed fields>	"OK" or "Error:..."
	'remove_background'		<numeric background db id>																		"OK" or "Error:..."

	'add_track_type'																		<new track type object>			"OK" or "Error:..."
	'get_track_type'		<numeric track type db id> or <text track type name>											track type object as json or "Error:..."
	'get_track_type_list'																									list of track type db_id's & background_names as json or "Error:..."
	'change_track_type'		<numeric track type db id>										<object with changed fields>	"OK" or "Error:..."
	'remove_track_type'		<numeric track type db id>																		"OK" or "Error:..."

	'add_track_layout'																		<new track layout object>		"OK" or "Error:..."
	'get_track_layout'		<numeric track layout db id> or <text track layout name>										track layout object as json or "Error:..."
	'get_track_layout_list'																									list of track layout db_id's & background_names as json or "Error:..."
	'replace_track_layout'	<numeric track layout db id>									<new track layout object>		"OK" or "Error:..."
	'remove_track_layout'	<numeric track layout db id>																	"OK" or "Error:..."

NB: backgrounds and track types are each a single row in the database and can be modified field by field while track layouts are
		sets of multiple rows in the database and are modified by supplying a complete new layout which replaces the existing one
		in the database - i.e. all the rows of the existing layout are deleted and the new rows are inserted.
*/

$db = DB::getInstance();

$request_function = $_POST['function'];
$request_json = $_POST['json'];
$request_id = $_POST['id'];
// Nota Bene!!!! php needs an array here and javascript is passing it an object.
// et VOILA!! the whole problem disappears if you just typecase the object as an array :)
// ... welcome to the new world, sir -
switch ($request_function) {
	case 'add_background':
		$background_object = new Background();
		$array_of_fields = (array)json_decode($request_json);
		// remove the db_id (first) item in the array since we're adding a new one to the database table
		array_shift($array_of_fields);
		$background_object->add($array_of_fields);
		echo 'OK';
		break;
	case 'get_background':
		$background_object = new Background();
		$return_boolean = $background_object->get($request_id);
		if($return_boolean) {
			echo json_encode($background_object->data());
		} else {
			echo 'Error getting background with id =' . $request_id;
		}
		break;
	case 'get_background_list':
		$background_object = new Background();
		$return_boolean = $background_object->getNameList();
		if($return_boolean) {
			echo json_encode($background_object->data());
		} else {
			echo 'Error getting background name list';
		}
		break;
	case 'change_background':
		$background_object = new Background();
		$array_of_fields = (array)json_decode($request_json);
		$background_object->change($array_of_fields, $request_id);
		echo 'OK';
		break;
	case 'remove_background':
		$background_object = new Background();
		$background_object->remove($request_id);
		echo 'OK';
		break;
	case 'add_track_type':
		$track_type_object = new TrackType();
		$array_of_fields = (array)json_decode($request_json);
		// remove the db_id (first) item in the array since we're adding a new one to the database table
		array_shift($array_of_fields);
		$track_type_object->add($array_of_fields);
		echo 'OK';
		break;
	case 'get_track_type':
		$track_type_object = new TrackType();
		$return_boolean = $track_type_object->get($request_id);
		if($return_boolean) {
			echo json_encode($track_type_object->data());
		} else {
			echo 'Error getting track type with id =' . $request_id;
		}
		break;
	case 'get_track_type_list':
		$track_type_object = new TrackType();
		$return_boolean = $track_type_object->getNameList();
		if($return_boolean) {
			echo json_encode($track_type_object->data());
		} else {
			echo 'Error getting track type name list';
		}
		break;
	case 'change_track_type':
		$track_type_object = new TrackType();
		$array_of_fields = (array)json_decode($request_json);
		$track_type_object->change($array_of_fields, $request_id);
		echo 'OK';
		break;
	case 'remove_track_type':
		$track_type_object = new TrackType();
		$track_type_object->remove($request_id);
		echo 'OK';
		break;
	case 'add_track_layout':
		$track_layout_object = new TrackLayout();
		$array_of_rows = (array)json_decode($request_json);
		$track_layout_object->add($array_of_rows);
		echo 'OK';
		break;
	case 'get_track_layout':
		$track_layout_object = new TrackLayout();
		$return_boolean = $track_layout_object->get($request_id);
		if($return_boolean) {
			echo json_encode($track_layout_object->data());
		} else {
			echo 'Error: track layout not found';
		}
		break;
	case 'get_track_layout_list':
		$track_layout_object = new TrackLayout();
		$return_boolean = $track_layout_object->getNameList();
		if($return_boolean) {
			echo json_encode($track_layout_object->data());
		} else {
			echo 'Error getting track layout name list';
		}
		break;
	case 'replace_track_layout':
		$track_layout_object = new TrackLayout();
		$array_of_rows = (array)json_decode($request_json);
		$track_layout_object->change($array_of_rows, $request_id);
		echo 'OK';
		break;
	case 'remove_track_layout':
		$track_layout_object = new TrackLayout();
		$track_layout_object->remove($request_id);
		echo 'OK';
		break;
	default:
		echo 'Error: unknown ajax function request';
		break;
}
?>

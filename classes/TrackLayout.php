<?php
class TrackLayout {
	private $_db,
			$_data;

	public function __construct() {
		$this->_db = DB::getInstance();
	}

/* since track layouts are stored as multiple rows in the database, we don't use the internal
	database-generated primary index "db_id" to identify them, we use the php-generated
	"track_layout_id" which is the same over a set of rows for a given layout.
*/
	public function add($rows = array(), $target_track_layout_id = null) {
		// For a newly created layout, the id is null so figure out the next available integer
		// For a new layout replacing a recently deleted layout in an update operation, re-use the original layout id number
		if(!$target_track_layout_id) {
			// $track_layout_id = 1 + $this->_db->query("SELECT MAX(track_layout_id) FROM track_layouts")->First();
			$this->_db->query("SELECT MAX(track_layout_id) AS maxId FROM track_layouts");
			$max_existing_track_layout_id = $this->_db->first()->maxId;
			$track_layout_id = $max_existing_track_layout_id + 1;
		} else {
			// There's already a layout id to be re-used
			$track_layout_id = $target_track_layout_id;
		}
		echo 'track layout id to use: ' . $track_layout_id . '<br>';
		// insert all the rows supplied
		foreach ($rows as $row) {
			$row->track_layout_id = $track_layout_id;
			if(!$this->_db->insert('track_layouts', (array)$row)) {
				throw new Exception("Error inserting new layout", 1);
				
			}
		}
	}

	public function get($target_id = null) {
		if($target_id) {
			$field = (is_numeric($target_id)) ? 'track_layout_id' : 'track_layout_name';
			$get_data = $this->_db->getSorted('track_layouts', array($field, '=', $target_id), 'section_sequence_number');
			if($get_data->count()) {
				$this->_data = $get_data->results();
				return true;
			}
		}
		return false;
	}

	public function getNameList() {
		// return an array of objects containing track layout names and track layout id's (!! NOT db_id's which
		//	are unique to each database record but TRACK LAYOUT ID's which are unique to each layout !!)
		$name_list = $this->_db->get_distinct_columns(array('track_layout_id', 'track_layout_name'), 'track_layouts');
		if($name_list->count()) {
			$this->_data = $name_list->results();
			return true;
		}
		return false;
	}

	public function change($rows = array(), $track_layout_id = null) {
		if(!$track_layout_id) {
			throw new Exception("Error: need track_layout_id to change a track layout", 1);
		} else {
			// "Changing" a track layout consists of deleting all of that layout's existing rows...
			$this->_db->delete('track_layouts', array('track_layout_id', '=', $track_layout_id));
			//  and then inserting all of the new ones just as if it were a layout being created,
			//  except that the existing track_layout_id is supplied.
			$this->add($rows, $track_layout_id);
		}
	}

	public function remove($target_id = null) {
		if($target_id) {
			$field = (is_numeric($target_id)) ? 'track_layout_id' : 'track_layout_name';
			if(!$this->_db->delete('track_layouts', array($field, '=', $target_id))) {
				throw new Exception("Error removing track layout: " . $target_id, 1);
			}
		}
	}

	public function data() {
		return $this->_data;
	}

}
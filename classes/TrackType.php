<?php
class TrackType {
	private $_db,
			$_data;

	public function __construct() {
		$this->_db = DB::getInstance();
	}

	public function add($fields = array()) {
		if(!$this->_db->insert('track_types', $fields)) {
			throw new Exception("Error inserting new track type", 1);
		}
	}

	public function get($target_id = null) {
		if($target_id) {
			$field = (is_numeric($target_id)) ? 'db_id' : 'track_type_name';
			$get_data = $this->_db->get('track_types', array($field, '=', $target_id));
			if($get_data->count()) {
				$this->_data = $get_data->results();
				return true;
			}
		}
		return false;
	}

	public function getNameList() {
		// return an array of objects containing track type names and db_id's
		$name_list = $this->_db->get_columns(array('db_id', 'track_type_name'), 'track_types');
		if($name_list->count()) {
			$this->_data = $name_list->results();
			return true;
		}
		return false;
	}

	public function change($fields = array(), $db_id = null) {
		if(!$db_id) {
			throw new Exception("Error: need db_id to change a track type", 1);
		} else if(!$this->_db->update('track_types', $db_id, $fields)) {
				throw new Exception("Error changing the track layout", 2);
		}
	}

	public function remove($db_id = null) {
		if(!$db_id) {
			throw new Exception("Error: need db_id to remove a track type", 2);
		} else if(!$this->_db->delete('track_types', array('db_id', '=', $db_id))) {
			throw new Exception("Error removing track type with db_id = " . $db_id, 1);
		}
	}

	public function data() {
		return $this->_data;
	}

}
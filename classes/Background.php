<?php
class Background {
	private $_db,
			$_data;

	public function __construct() {
		$this->_db = DB::getInstance();
	}

	public function add($fields = array()) {
		if(!($this->_db->insert('backgrounds', $fields))) {
			throw new Exception("Error adding new background", 1);
		}
	}

	public function get($target_id = null) {
		if($target_id) {
			$field = (is_numeric($target_id)) ? 'db_id' : 'background_name';
			$get_data = $this->_db->get('backgrounds', array($field, '=', $target_id));
			if($get_data->count()) {
				$this->_data = $get_data->first();
				return true;
			}
		}
		return false;
	}

	public function getNameList() {
		// return an array of objects containing background names and db_id's
		$name_list = $this->_db->get_columns(array('db_id', 'background_name'), 'backgrounds');
		if($name_list->count()) {
			$this->_data = $name_list->results();
			return true;
		}
		return false;
	}

	public function change($fields = array(), $db_id = null) {
		if(!$db_id) {
			throw new Exception("Error: need db_id to change a background", 2);
		} else if(!$this->_db->update('backgrounds', $db_id, $fields)) {
			echo '<br>fields.length = ' . count($fields) . '<br>';
			foreach($fields as $key => $value) {
				echo '$key = $value <br>';
			}
			echo '<br>';
			throw new Exception("Error changing background", 3);
		}
	}

	public function remove($db_id = null) {
		if(!$db_id) {
			throw new Exception("Error: need db_id to remove a background", 4);
		} else if(!$this->_db->delete('backgrounds', array('db_id', '=', $db_id))) {
			throw new Exception("Error removing background with db_id:" . $db_id, 5);
		}
	}

	public function data() {
		return $this->_data;
	}
}
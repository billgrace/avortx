<?php
require_once 'core/avortx_init.php';

$user = new User();

if(!$user->isLoggedIn()) {
	Redirect::to('index.php');
}

if(Input::exists()) {
	if(Token::check(Input::get('token'))) {

		$validate = new Validate();
		$validation = $validate->check($_POST, array(
			'full_name' => array(
				'required' => true,
				'min' => 2,
				'max' => 50
			)
		));

		if($validation->passed()) {

			try {
				$user->update(array(
					'full_name' => Input::get('name')
				));

				Session::flash('home', 'Your details have been updated.');
				Redirect::to('index.php');

			} catch(Exception $e) {
				die($e->getMessage());
			}
		} else {
			foreach ($validation->errors() as $error) {
				echo $error, '<br>';
			}
		}
	}
}

?>

<form action="" method="post">
	<div class="field">
		<label for="full_name">Name</label>
		<input type="text" name="full_name" value="<?php echo escape($user->data()->full_name); ?>">

		<input type="submit" value="Update">
		<input type="hidden" name="token" value="<?php echo Token::generate(); ?>">
	</div>
</form>

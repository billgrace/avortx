<?php
require_once 'core/avortx_init.php';

if(Input::exists()) {
	if(Token::check(Input::get('token'))) {

		$validate = new Validate();
		$validation = $validate->check($_POST, array(
			'login_name' => array('required' => true),
			'password' => array('required' => true)
		));

		if($validation->passed()) {
			$user = new User();
			$remember = (Input::get('remember') === 'on') ? true : false;
			$login = $user->login(Input::get('login_name'), Input::get('password'), $remember);

			if($login) {
				Redirect::to('index.php');
			} else {
				echo '<p>Sorry, logging in failed.</p>';
				echo '<p>user: ' . Input::get('login_name') . ', password entered: ' . Input::get('password') . '</p>';
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
		<label for="login_name">Login name</label>
		<input type="text" name="login_name" id="login_name" autocomplete="off">
	</div>

	<div class="field">
		<label for="password">Password</label>
		<input type="password" name="password" id="password" autocomplete="off">
	</div>

	<div>
		<label for="remember">
			<input type = "checkbox" name="remember" id="remember"> Remember me
		</label>
	</div>

	<input type="hidden" name="token" value="<?php echo Token::generate(); ?>">
	<input type="submit" value="Log in">
</form>

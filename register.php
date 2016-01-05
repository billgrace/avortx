<?php
require_once 'core/avortx_init.php';

if(Input::exists()) {
	if(Token::check(Input::get('token'))) {
		$validate = new Validate();
		$validation = $validate->check($_POST, array(
			'login_name' => array(
				'required' => true,
				'numeric' => false,
				'min' => 2,
				'max' => 20,
				'unique' => 'users'),
			'password' => array(
				'required' => true,
				'min' => 6),
			'password_again' => array(
				'required' => true,
				'matches' => 'password'),
			'full_name' => array(
				'required' => true,
				'min' => 2,
				'max' => 50),
			'email_address' => array(
				'valid_email' => true,
				'numeric' => false,
				'max' => 255,
				'unique' => 'users')
		));

		if($validation->passed()) {
			$user = new User();

			$salt = Hash::salt(32);

			try {
				$user->create(array(
					'login_name' => Input::get('login_name'),
					'password' => Hash::make(Input::get('password'), $salt),
					'salt' => $salt,
					'full_name' => Input::get('full_name'),
					'register_date' => date('Y-m-d H:i:s'),
					'email_address' => Input::get('email_address'),
					'user_group' => 1
				));

				Session::flash('home', 'You have been registered and can now log in!');
				Redirect::to('index.php');

			} catch (Exception $e) {
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
		<label for="login_name">Login name</label>
		<input type="text" name="login_name" id="login_name" value="<?php echo  escape(Input::get('login_name')); ?>" autocomplete="off">
	</div>

	<div class="field">
		<label for="password">Choose a password</label>
		<input type="password" name="password" id="password">
	</div>

	<div class="field">
		<label for="password_again">Enter your password again</label>
		<input type="password" name="password_again" id="password_again">
	</div>

	<div class="field">
		<label for="full_name">Your full name</label>
		<input type="text" name="full_name" value="<?php echo escape(Input::get('full_name')); ?>" id="full_name">
	</div>

	<div class="field">
		<label for="email_address">Your email address</label>
		<input type="text" name="email_address" value="<?php echo escape(Input::get('email_address')); ?>" id="email_address">
		<p>(an email address is needed if you ever forget your login name or password)</p>
	</div>

	<input type="hidden" name="token" value="<?php echo Token::generate(); ?>">
	<input type="submit" value="Register">
</form>
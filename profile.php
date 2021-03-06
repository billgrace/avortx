<?php
require_once 'core/avortx_init.php';

if(!$username = Input::get('user')) {
	Redirect::to('index.php');
} else {
	$user = new User($username);
	if(!$user->exists()) {
		Redirect::to(404);
	} else {
		$data = $user->data();
	}
	?>

	<h3><?php echo escape($data->login_name); ?></h3>
	<p>Full name: <?php echo escape($data->full_name); ?></p>
	<?php
}
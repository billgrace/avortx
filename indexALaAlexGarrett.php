<?php
require_once 'core/avortx_init.php';

if(Session::exists('home')) {
	echo '<p>' . Session::flash('home') . '</p>';
}

$user = new User();
if($user->isLoggedIn()) {
?>
	<p>Hello <a href="profile.php?user=<?php echo escape($user->data()->login_name); ?>"><?php echo escape($user->data()->login_name); ?></a>!</p>

	<ul>
		<li><a href="update.php">Update details</a></li>
		<li><a href="changepassword.php">Change password</a></li>
		<li><a href="logout.php">Log out</a></li>
	</ul>
<?php

	if($user->hasPermission('admin')) {
		echo '<p>You are an administrator!</p>';
	}

} else {
	echo '<h1>You need to <a href="login.php">log in</a> or <a href="register.php">register</a></h1>';
}
?>

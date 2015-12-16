<?php
require_once 'core/avortx_init.php';

$user = new User();
$user->logout();

Redirect::to('index.php');

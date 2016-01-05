<?php
require_once 'core/avortx_init.php';

function leaveMessage( $words, $numb ) {
	$_db = DB::getInstance();
	$_db->logDiagnosticEvent( $words, $numb );
}

leaveMessage( "About to get the POST content", 1);
$request_text = $_POST['request'];
leaveMessage( "POST content: '" . $request_text . "'", 2);
echo "<p>Your request was: ".$request_text.", ta-da!</p>";
leaveMessage("About to echo Hiya", 3);
echo "<p>Hiya!</p>";
leaveMessage("Leaving request_handler.php", 4);
?>

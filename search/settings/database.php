<?php
	$database='sphider';
	$mysql_user = 'webmaster_fgl';
	$mysql_password = '62391j#!j';

	//non-public:
	// $mysql_host = 'fgl-sphider-db.cugdpksf2yw1.us-east-1.rds.amazonaws.com:3306';

	//public:
	$mysql_host = 'fgl-sphider.cugdpksf2yw1.us-east-1.rds.amazonaws.com:3306';

	//for use with phpstorm: $mysql_host='localhost:3306';

	//for use with mamp
	//$mysql_host='localhost:8889';

	$mysql_table_prefix = "";



	$success = mysql_pconnect ($mysql_host, $mysql_user, $mysql_password);
	if (!$success)
		die ("<b>Cannot connect to database, check if username, password and host are correct.</b>");
    $success = mysql_select_db ($database);
	if (!$success) {
		print "<b>Cannot choose database, check if database name is correct.";
		die();
	}
?>


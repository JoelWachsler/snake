<?php
if (isset($_POST[name]) && isset($_POST[score]) && $_POST[score] != "" && $_POST[name] != "") {
	if ($_POST[score] > 9000 || $_POST[score] == 1337) {
		$_POST[score] = 0;
	}

	$con=mysqli_connect("","dbname","password","table");
	// Check connection
	if (mysqli_connect_errno()) {
		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	
	$name = mysqli_real_escape_string($con,$_POST['name']);
	$score = mysqli_real_escape_string($con,$_POST['score']);
	$sql="INSERT INTO snake (name, score)
	VALUES
	('$name','$score')";

	if (!mysqli_query($con,$sql)) {
		die('Error: ' . mysqli_error($con));
	}
	echo 'true';

	mysqli_close($con);
} else {
	echo 'false';
}

?>

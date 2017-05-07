<?php
if (isset($_POST[name]) && isset($_POST[score]) && $_POST[score] != "" && $_POST[name] != "") {
	if ($_POST[score] > 9000 || $_POST[score] == 1337) {
		$_POST[score] = 0;
	}

	$con=mysqli_connect("","dbname","password","table");
	// Check connection
	if (mysqli_connect_errno())
	  {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	  }

	$sql="INSERT INTO snake (name, score)
	VALUES
	('$_POST[name]','$_POST[score]')";

	if (!mysqli_query($con,$sql))
	  {
	  die('Error: ' . mysqli_error($con));
	  }
	echo 'true';

	mysqli_close($con);
} else {
	echo 'false';
}

?>

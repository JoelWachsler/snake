<!DOCTYPE html>
<html>
<head>
	<title>Snake score</title>
	<style type="text/css">
		* {
			margin: 0;
			padding: 0;
		}
		body {
			background-color: rgb(46, 155, 138);
		}
		td {
			max-width: 200px;
			overflow: hidden;
		}
		.name {
			height: 15px;
		}
	</style>
</head>
<body>
	<?php
	$con=mysqli_connect("","joelwr","PW","joelwr");
	// Check connection
	if (mysqli_connect_errno())
	  {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	  }

	$result = mysqli_query($con,"SELECT * FROM snake ORDER BY score DESC LIMIT 15");

	echo "<table border='1'>
	<tr>
	<th>Name</th>
	<th>Score</th>
	</tr>";

	while($row = mysqli_fetch_array($result))
	  {
	  echo "<tr>";
	  echo "<td><div class=\"name\">" . $row['name'] . "</div></td>";
	  echo "<td>" . $row['score'] . "</td>";
	  echo "</tr>";
	  }
	echo "</table>";

	mysqli_close($con);
	?>
</body>
</html>




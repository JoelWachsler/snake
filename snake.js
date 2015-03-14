var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');
var sprite = new Image();	// Declaring our sprite
sprite.src = 'img/sprites.png';	// Giving location to our sprite
var fire = new Image();
fire.src = 'img/fire.gif';
var explode_img = new Image();
explode_img.src = 'img/explosion.gif';
ctx.font="15px Arial";

var isLeft = false, isRight = false, isUp = false, isDown = false;	// Declaring movement variables
var look = {left : {X: 0, Y: 0}, up : {X: 20, Y: 0}, right : {X: 40, Y: 0}, down : {X: 60, Y: 0}};	// Our different heads from sprite
var goodStuff = {0: {X: 20, Y: 20}, 1: {X: 40, Y: 20}, 3: {X: 80, Y: 20}};	// Good stuff from our sprite
var badStuff = {0: {X: 60, Y: 20}, 1: {X: 0, Y: 20}, 2: {X: 0, Y: 40}, 3: {X: 20, Y: 40}, 4: {X: 40, Y: 40}, 5: {X: 60, Y: 40}};	// Bad stuff from our sprite
var food = new Obj(0, 0, goodStuff[Math.round(Math.random())]);	// Making a new food Obj
var player = new Obj(200, 200, look['right'], 100);	// Our starting position of our character
var body = new Array();	// Bodyparts will be in this array
var score = new scoreObj;
var badFood;	// Making some space for the bad food
var turbo = false;	// Check if boost is enabled
var specialFood;	// An Obj for our special food
var specialTime;	// Special food text timer
var main;
var sendLimit = false;
var collission_obj = new Array();
var missiles = new Array();
var explosion_pos = new Array();
var game_active = true;
var game_text = "PAUSED";
var spawn_rate_missile = 10000;
var missile_speed_rate = 50;
var moved = false;
var no_cheeze = false;

$(document).keydown(function(e) {	// Events from the player when key down is pressed
	switch(String.fromCharCode(e.keyCode)) {
		case '%':
			if (!isRight && !moved || body.length < 1) turnFalseMovement(), isLeft = true, moved = true;
			break;
		case '&':
		if (!isDown && !moved || body.length < 1) turnFalseMovement(), isUp = true, moved = true;
			break;
		case '\'':
		if (!isLeft && !moved || body.length < 1) turnFalseMovement(), isRight = true, moved = true;
			break;
		case '(':
		if (!isUp && !moved || body.length < 1) turnFalseMovement(), isDown = true, moved = true;
			break;
		case 'P':
		!game_active ? game_active = true : game_active = false;
			break;
	}
	if (e.keyCode == 16 && player.Velocity != 10) player.NormalVelocity = player.Velocity, player.Velocity = 10;	// BOOST
});

$(document).keyup(function(e) {
	if (e.keyCode == 16) player.Velocity = player.NormalVelocity;	// BOOST
});

function turnFalseMovement() {
	isLeft = false;
	isRight = false;
	isUp = false;
	isDown = false;
}
start();
function start() {	// Lets start the game!
	mainLoop();
	tick();
	randomFood();
	setInterval(specialFood, 30000);
	missile_spawn();
}


function distance(obj1, obj2) {
	dis = 5000;
	pos;
	for(var i = 0; i < obj2.length; i++) {
		testDis = Math.sqrt(Math.pow(obj1.X - obj2[i].X, 2) + Math.pow(obj1.Y - obj2[i].Y, 2));
		if (testDis < dis) dis = testDis, pos = obj2[i];
	}
		
	return pos;
}

function calcRotation(obj1, obj2) {
	a = obj2.X - obj1.X;
	b = obj2.Y - obj1.Y;
	c = Math.sqrt(a*a+b*b);
	deg = Math.asin(a/c);
	if (obj1.Y < obj2.Y) deg = -deg + Math.PI;
	return deg;
}

function missile_spawn() {
	if (body.length > 0 && game_active) {
		// Random x and y outside the boundries
		rnd = random_pos();
		x = rnd[0];
		y = rnd[1];
		var new_missile = new Obj(x, y, badStuff[3]);
		// Lets activate the missile!
		new_missile.Active = true;
		new_missile.Rotation = calcRotation(player, new_missile);
		missiles.push(new_missile);
		heat_seek_missile(new_missile);
	}

	setTimeout(function(){missile_spawn()}, spawn_rate_missile);
}

function random_pos() {
	posses = {0: {0: canvas.width + 500, 1: canvas.height/2}, 1: {0: canvas.width/2, 1: canvas.height + 500}, 2: {0: -500, 1: canvas.height/2}, 3: {0: canvas.width/2, 1: -500}};
	rnd = Math.floor(Math.random()*4);
	return posses[rnd];
}

function heat_seek_missile(objs) {
	if (game_active) {
		target = distance(objs, body);
		objs.Rotation = calcRotation(target, objs);

		if (target.X != objs.X) target.X >= objs.X ? objs.X += 2 : objs.X -= 2;
		if (target.Y != objs.Y) target.Y >= objs.Y ? objs.Y += 2 : objs.Y -= 2;

		if (player.isColliding(objs)) gameOver("you got hit by a missile");
		for (var i = 0; i < body.length; i++)
			if (body[i].isColliding(objs)) boom(objs), gameOver("you got hit by a missile");

		for (var i = 0; i < collission_obj.length; i++)
			if (objs.isColliding(collission_obj[i])) objs.Active = false, boom(objs), collission_obj.splice(i, 1);

		for(var i = 0; i < missiles.length; i++)
			if (objs.isColliding(missiles[i]) && objs != missiles[i] && missiles[i].Active) objs.Active = false, missiles[i].Active = false, boom(objs), boom(missiles[i]);

		if (body.length > 15 && collission_obj.length <= 0) spawn_new();
	}
	if (objs.Active) setTimeout(function(){heat_seek_missile(objs)},missile_speed_rate);
}

function spawn_collission_obj(offset, first_or_second) {
	collission_obj = [];
	if (first_or_second == 0) {
		for (var i = 0; i < 20; i++)
			add_collission_obj(300 + i * player.Width, 100 + player.Height - offset),
			add_collission_obj(300 + i * player.Width, 440 + player.Height + offset);

		for(var i = 0; i < 8; i++)
			add_collission_obj(300 - offset, 140 + i * player.Height - offset),
			add_collission_obj(680 + offset, 300 + i * player.Height + offset);
	} else {
		for (var i = 0; i < 9; i++)
			add_collission_obj(300 + player.Width * i - offset, 300);
		for (var i = 10; i < 19; i++)
			add_collission_obj(300 + player.Width * i + offset, 300);

		for (var i = 0; i < 9; i++)
			add_collission_obj(canvas.width / 2 - player.Width, 120 + player.Height * i - offset);
		for (var i = 10; i < 19; i++)
			add_collission_obj(canvas.width / 2 - player.Width, 120 + player.Height * i + offset);
	}
	
	offset -= 2;
	if (offset >= 0)
		setTimeout(function(){spawn_collission_obj(offset, first_or_second)},20);
	for (var i = 0; i < collission_obj.length; i++)
			if (food.isColliding(collission_obj[i])) randomFood();
}
	


function boom(objs) {
	new_explosion = new Obj(objs.X, objs.Y);
	new_explosion.Explode = true;
	explosion_pos.push(new_explosion);

	setTimeout(function(){
		pos = explosion_pos.indexOf(new_explosion);
		explosion_pos.splice(pos, 1);
	},700);
}

function tick() {
	if (game_active) {
		player.Previous_X = player.X;
		player.Previous_Y = player.Y;
		if (isLeft) player.X -= player.Width;
		else if (isUp) player.Y -= player.Height;
		else if (isRight) player.X += player.Width;
		else if (isDown) player.Y += player.Height;
		moved = false;

		food_collission();
		collission_logic();

		for (var i = 0; i < collission_obj.length; i++)
			if (player.isColliding(collission_obj[i])) gameOver("you crashed into a wall");

		for (var i = 0; i < collission_obj.length; i++)
			for(var x = 0; x < body.length; x++)
				if (body[x].isColliding(collission_obj[i])) gameOver("your body got smashed by a wall");

		// Checking our body collision with head
		for (var i = 0; i < body.length; i++)
			if (player.isColliding(body[i]))
				clearInterval(),
				gameOver("Ate your own body!");

		// Some logic for the body
		for (var i = body.length; i > 1; i--) body[i-1].X = body[i-2].X, body[i-1].Y = body[i-2].Y;
		if (body != 0) body[0].X = player.Previous_X, body[0].Y = player.Previous_Y;
		$('#score').html(score.Score + score.SpecialScore);
	}
	
	setTimeout(tick, player.Velocity);
}

function collission_logic() {	// Check if snake is out of bounds
	if (player.X > canvas.width - player.Width) player.X = 0;
	if (player.X < 0) player.X = canvas.width - player.Width;
	if (player.Y > canvas.height - player.Height) player.Y = 0;
	if (player.Y < 0) player.Y = canvas.height - player.Height;
}

function food_collission() {
	if (player.isColliding(food) || player.isColliding(specialFood)) {	// Food collision check
		if (specialFood.Active && player.isColliding(specialFood)) specialFood = 0, score.SpecialScore += 15;	// Special food checker
		else food.Bad ? gameOver("You ate some bad food!") : score.Score+=2, randomFood();

		body[body.length] = new Obj(player.Previous_X, player.Previous_Y, {X: 80, Y: 0});	// Adding a new part to the body

		switch(body.length) { // A little leveling system
				case 5:
				player.Velocity /= 1.2;
			break;
				case 15:
				spawn_new();
				spawn_rate_missile -= 500;
				missile_speed_rate -= 5;
			break;
				case 20:
				spawn_rate_missile -= 500;
				missile_speed_rate -= 5;
			break;
		}
	}
}

function mainLoop() {
	if (game_active) {
		// Some logic
		if (isLeft) player.Sprite = look['left'];
		if (isUp) player.Sprite = look['up'];
		if (isRight) player.Sprite = look['right'];
		if (isDown) player.Sprite = look['down'];

		// Lets render!
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw missiles
		if (missiles.length > 0)
			for (var i = 0; i < missiles.length; i++)
				if (missiles[i].Active == true)
					ctx.font="15px Arial",
					drawSprite(missiles[i]);
		// Draw special food
		if (specialFood.Active)	// Drawing Text over special food of active
			ctx.fillText(specialTime,specialFood.X + specialFood.Width / 4,specialFood.Y-10),
			drawSprite(specialFood);
		// Drawing the food
		drawSprite(food);
		// Drawing the head
		drawSprite(player);
		// Drawing the body
		for (var i = 0; i < body.length; i++)
			drawSprite(body[i]);	
		// Draw objects to collide with
		if (collission_obj.length > 0)
			for (var i = 0; i < collission_obj.length; i++)
				drawSprite(collission_obj[i]);
		if (explosion_pos.length > 0)
			for(var i = 0; i < explosion_pos.length; i++)
				drawSprite(explosion_pos[i]);

	} else ctx.font="50px Arial", ctx.fillText(game_text,canvas.width / 2 - ctx.measureText(game_text).width / 2, canvas.height / 2 - 50);
	
	main = setTimeout(mainLoop, 1000/60);
}

function add_collission_obj(x, y) {
	collission_obj.push(new Obj(x, y, badStuff[1]));
}

function drawSprite(objs) {
	if (objs.Rotation != -1) {
		ctx.save();
		ctx.translate(objs.X, objs.Y);
		ctx.rotate(objs.Rotation);
		ctx.drawImage(sprite, objs.Sprite['X'], objs.Sprite['Y'], objs.Width, objs.Height, -objs.Width / 2, -objs.Height / 2, objs.Width, objs.Height);
	 	ctx.drawImage(fire,-9,-28);
		ctx.restore();
		if (objs.X > canvas.width || objs.X < 0 || objs.Y > canvas.height || objs.Y < 0) {
			ctx.font="20px Arial";
			if(objs.X > canvas.width)ctx.fillText(objs.X - canvas.width, canvas.width - ctx.measureText(objs.X).width, objs.Y);
				else if(objs.X < 0) ctx.fillText(objs.X*-1, 10, objs.Y);
					else if(objs.Y > canvas.height) ctx.fillText(objs.Y - canvas.height, objs.X, canvas.height - 10);
						else if(objs.Y < 0) ctx.fillText(objs.Y*-1, objs.X, 20);
			
		}
			
	}
	else if (objs.Explode)
		ctx.drawImage(explode_img,objs.X,objs.Y);
	else
		ctx.drawImage(sprite, objs.Sprite['X'], objs.Sprite['Y'], 20, 20, objs.X, objs.Y, 20, 20);
	
}

function randomPos(XorY) {	// Creating a random pos within the area of our container
	XorY == true ? pos = Math.round(Math.random()*canvas.width/player.Width)*player.Width - player.Width : pos = Math.round(Math.random()*canvas.height/player.Height)*player.Height - player.Height;
	if (!XorY && pos <= player.Height || XorY && pos <= player.Width) randomPos(XorY);
	return pos;
}

function randomFood() {	// Generate good or bad food
	no_cheeze = false;
	if ((Math.floor(Math.random()*15)) == 1 && body.length > 2)
		food.Bad = true,	// Shit we got some bad food!
		food.Sprite = badStuff[0];
	else
		food.Sprite = goodStuff[Math.round(Math.random())],
		food.Bad = false;

	food.X = randomPos(true);
	food.Y = randomPos(false);

	if (!spawn_collission(food)) randomFood();
	for (var i = 0; i < body.length; i++)
				if (food.isColliding(body[i])) randomFood();

	if (food.isColliding(specialFood) && specialFood.Active) randomFood();	// Check if we're colliding with special food
	if (food.Bad) setTimeout(randomFood, 5000);
}

function spawn_new() {
	rands = Math.round(Math.random());
	rands == 0 ? spawn_collission_obj(300, rands) : spawn_collission_obj(500, rands);
}

function spawn_collission(check_this) {
	if (player.isColliding(check_this) || check_this.X == canvas.width || check_this.Y == canvas.height) return false;
	for (var i = 0; i < body.length; i++)	// Check if object is colliding with snake body or head
		if (body[i].isColliding(check_this)) return false;

	for (var i = 0; i < collission_obj.length; i++)
		if (collission_obj[i].isColliding(check_this)) return false;

	return true;
}

function specialFood() {	// Init for special food
	if (body.length > 0 && !no_cheeze) {
		var pass = false;
		while(!pass) {	// Special food collision checker
			pass = true;
			specialFood = new Obj(randomPos(true), randomPos(false), goodStuff[3]);

			if (specialFood.isColliding(player)) pass = false;

			for (var i = 0; i < body.length; i++)
				if (specialFood.isColliding(body[i])) pass = false;

			for(var i = 0; i < collission_obj.length; i++)
				if (specialFood.isColliding(collission_obj[i])) pass = false;
		}
		specialFood.Active = true;
		specialTime = 10;
		special_food_counter();
		no_cheeze = true;
	}
}

function special_food_counter() {
	if (game_active) {
		specialTime--;
		if (specialTime <= 0) specialFood.Active = false;
	}
	if (specialFood.Active)
		setTimeout(function(){special_food_counter()}, 1000);
}

function gameOver(reason) {
	if (!sendLimit) {
		sendLimit = true;
		game_text = "GAME OVER";
		game_active = false;
		
		!readCookie("username") ? user = "Anonymous" : user = readCookie("username");

		var usr = prompt("Game over, " + reason + ", write your name to submit to highscore", user);
		document.cookie="username="+usr;
		send(usr, score.Score + score.SpecialScore);
	}
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function send(usr, scr) {
	var formData = {name:usr,score:scr}; //Array
	$.ajax({
	    url : "insert.php",
	    type: "POST",
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        location.reload();
	    }
	});
}

function Obj(x, y, spritePos, velocity) {
	this.Sprite = spritePos;
	this.X = x;
	this.Y = y;
	this.Width = 20;
	this.Height = 20;
	this.Previous_X;
	this.Previous_Y;
	this.Velocity = velocity;
	this.NormalVelocity;
	this.Bad = false;
	this.Active = false;
	this.Rotation = -1;
	this.Explode = false;

	this.isColliding = function(obj) {
		if (this.X + this.Width > obj.X && obj.X + obj.Width > this.X && this.Y + this.Height > obj.Y && obj.Y + obj.Height > this.Y) return true;
		return false;
	}
}

function scoreObj() {
	this.Score = 0;
	this.SpecialScore = 0;
}
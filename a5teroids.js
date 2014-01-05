(
var WIDTH = 800;
var HEIGHT = 600;

var ctx;
var canvas;
var asteroids = [];

var timestamp;
var oldtime;
var dt;

var Config = {
	asteroids: 3,
	sensitivity: 3,
	
	acceleration: 0.05,
	friction: 0.995,
	max_velocity: 4
}

function Vector(x_, y_){
	
	this.x = x_ || 0;
	this.y = y_ || 0;

}

Vector.prototype = {
	
	set: function(x_, y_){
		this.x = x_;
		this.y = y_;
	},
	
	add: function(v_){s
		this.x += v_.x;
		this.y += v_.y;
	},
	
	multiply: function(v_){
		this.x *= v_.x;
		this.y *= v_.y;
	},
	
	addS: function(s_){
		this.x += s_;
		this.y += s_;
	},
	
	multiplyS: function(s_){
		this.x *= s_;
		this.y *= s_;
	},
	
	normalize: function(l_){
		this.x = this.x / this.length();
		this.y = this.y / this.length();
		
		this.x = this.x * l_;
		this.y = this.y * l_;
		
	},
	
	length: function(){
		return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
	},
	
	rotation: function(){
		return Math.atan2(this.y, this.x);
	}
	
}


window.addEventListener('load', init, false);

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();


function init(){
	canvas = document.getElementById('space');
	ctx = canvas.getContext('2d');
	timestamp = +new Date();
	
	// give focus
	canvas.setAttribute('tabindex','0');
	canvas.focus();
	
	// spawn objects
	blaster = new Blaster();

	// generate asteroids
	for (var i=0; i < Config.asteroids; i++) {
		  asteroids.push(new Asteroid());
		};	
	
	// gogogo!
	runLoop();
	

}

function Blaster(){
	
	this.x = canvas.width/2;
	this.y = canvas.height/2;
	
	this.rotation = 0.01;
	this.velocity = new Vector(0.0, 0.0);
	this.acceleration = new Vector(0.0, 0.0);
	
}

Blaster.prototype = {

	draw: function(){
		//reposition if off-screen
		if (this.x > canvas.width){this.x = 0};
		if (this.x < 0){this.x = canvas.width};
		if (this.y > canvas.height){this.y = 0};
		if (this.y < 0){this.y = canvas.height};
		
		ctx.fillStyle = "white";
		ctx.save();
		ctx.translate(this.x, this.y);
	
		ctx.rotate(this.rotation);
	
		ctx.beginPath();
		ctx.moveTo(-20,+25);
		ctx.lineTo(0,-25);
		ctx.lineTo(20,25);
		ctx.lineTo(-20,25);
		ctx.fill();
	
		ctx.restore();
	},
	
	turnLeft: function(){
		this.rotation -= 0.1;
	},
	
	turnRight: function(){
		this.rotation += 0.1;		
	},
	
	accelerate: function(){
		
		this.acceleration.set(Config.acceleration/Math.cos(this.rotation-Math.PI/2),
						Config.acceleration/Math.sin(this.rotation-Math.PI/2))
		
		this.velocity.add(this.acceleration);
 		
		if (this.velocity.length() > Config.max_velocity){
			this.velocity.normalize(Config.max_velocity);
		}
	},
	
	update: function(){
		if (Key.isDown(Key.UP)) this.accelerate();
		if (Key.isDown(Key.LEFT)) this.turnLeft();
		if (Key.isDown(Key.RIGHT)) this.turnRight();
		
		
		ctx.save();
		ctx.translate(this.x, this.y);
		
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		
		ctx.restore();
		
	}

}



function Asteroid(x,y,velocity,form){
	
	// constructor
	this.x = x ||  Math.round(Math.random()*200+100);
	this.y = y ||  Math.round(Math.random()*200+100);
	this.velocity = velocity || Math.random()+0.5;
	this.direction = Math.random(2*Math.PI);
	
	this.form = form;
	
}

Asteroid.prototype = {
	draw: function(){
		var f = AsteroidForm[0];
		
		ctx.strokeStyle = "white";
		
		ctx.beginPath();
		ctx.moveTo(this.x + f[0][0], this.y + f[0][1]);	
		for(var i=1; i<f.length; i++){
		  ctx.lineTo(this.x + f[i][0] , this.y + f[i][1]);
		};
		ctx.lineTo(this.x + f[0][0], this.y + f[0][1]);
		ctx.stroke();
		
	},
	
	update: function(){
		this.x += (this.velocity * Math.cos(this.direction));
		this.y += (this.velocity * Math.sin(this.direction));
		
		//reposition if off-screen
		if (this.x > canvas.width){this.x = 0};
		if (this.x < 0){this.x = canvas.width};
		if (this.y > canvas.height){this.y = 0};
		if (this.y < 0){this.y = canvas.height};
		
	}

}

var AsteroidForm = [
	[
		[-10, 0],
		[-30, 5],
		[-20, 20],
		[-5 , 20],
		[20, 18],
		[25, 15],
		[30, 0],
		[10, -5],
		[20, -17],
		[2, -20],
		[-5, -15],
		[-20, -5],
		[-10, 0]
	],
	[
		[]	
	],
	[]
];

var Key = {
	
	_pressed: {},
	
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	
	isDown: function(keyCode){
		return this._pressed[keyCode];
	},
	
	onKeyDown: function (event) {
	  this._pressed[event.keyCode] = true;
	},
	
	onKeyUp: function (event){
		delete this._pressed[event.keyCode];
	}
};

function runLoop(time){
	
	dt = time - oldtime;
	oldtime = time;
	
	// clean up screen before each frame is drawn
	ctx.clearRect(0,0, canvas.width, canvas.height);
	
	// draw blaster
	blaster.update();
	blaster.draw();
	
	// draw asteroid
	for (var i=0; i < asteroids.length; i++) {
	  asteroids[i].update();
	  asteroids[i].draw();
	};
	
	// debugging stuff
	document.getElementById('debug').innerHTML = 
						"<table>" +
						"<tr><td>" + "Rotation: " + "</td><td>" + blaster.rotation + "</td></tr>" +
						"<tr><td>" + "<br /> Rotation-pi/2 " +  "</td><td>" + (blaster.rotation-Math.PI/2) + "</td></tr>" +
						"<tr><td>" + "<br /> acc/sin " + "</td><td>" + (Config.acceleration/Math.sin(blaster.rotation-Math.PI/2)) +"</td></tr>" +
						"<tr><td>" + "<br /> acc/cos " + "</td><td>" + (Config.acceleration/Math.cos(blaster.rotation-Math.PI/2)) +"</td></tr>" +
						"<tr><td>" + "<br /> sin(rotation-pi/2): " + "</td><td>" + (Math.sin(blaster.rotation-Math.PI/2)) +"</td></tr>" +
						"<tr><td>" + "<br /> cos(rotation-pi/2): " + "</td><td>" + (Math.cos(blaster.rotation-Math.PI/2)) +"</td></tr>" +
						"<tr><td>" + "<br /> Velocity x: " + "</td><td>" + blaster.velocity.x +"</td></tr>" +
						"<tr><td>" + "<br /> Velocity y: " + "</td><td>" + blaster.velocity.y +"</td></tr>" +
						"<tr><td>" + "<br /> Velocity length(): " + "</td><td>" + blaster.velocity.length(); +"</td></tr>" +
						"</table>"
	
	//controls();
	window.requestAnimFrame(runLoop, ctx.canvas);
}

window.addEventListener('keyup', function(event){ Key.onKeyUp(event);}, false);
window.addEventListener('keydown', function(event){ Key.onKeyDown(event);}, false);)
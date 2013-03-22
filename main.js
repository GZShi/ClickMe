function main() {
	var bigSize = 50;
	var bigRadius = 25;
	var smallSize = 20;
	var smallRadius = 10;
	var screenHeight;
	var screenWidth;
	var bigBoundX;
	var bigBoundY;
	var smallBoundX;
	var smallBoundY;
	var bigBallCount = 0;
	var bigBallArray = [];
	var score = 1100;
	var scoreTable;
	var pauseFlag = false;
	var control;
	var controlCounter = 0;
	var controlIntervalId;
	var info;
	var disqus;
	var disqusLoadFlag = false;
	var disqusDisplayFlag = false;
	var config;
	var settings;
	var gameMode = false; // true:classic  false:endless
	var gameModeBuf = false;
	var totalBall = 10;
	var totalBallBuf = 10;
	var countNew = 0;
	var classCount = 0;
	var nameId = 0;
	var restart;
	var restartFlag = false;

	function rgba(r, g, b, a) {
		return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
	}

	function appendNewNode(name, size, posX, posY, color) {
		var newDiv = document.createElement('div');
		var x = posX == null ? Math.floor(Math.random() * smallBoundX) : posX;
		var y = posY == null ? Math.floor(Math.random() * smallBoundY) : posY;
		var sound = Math.floor(Math.random()*8 + 1);
		newDiv.className = size;
		newDiv.id = name;
		if(size == 'small')
			newDiv.innerText = "123456789".split("")[sound];
		newDiv.style.background = color == null ? rgba(Math.floor(30+190*Math.random()), Math.floor(90+130*Math.random()), Math.floor(100+120*Math.random()), 0.3+Math.random()* 0.6) : color;
		newDiv.style.left = x + "px";
		newDiv.style.top = y + "px";
		(document.getElementsByTagName('body')[0]).appendChild(newDiv);
		var retval = new ball(x, y);
		if(size == 'big')
			bigBallArray.push(retval);
		retval.init(name, size, retval, sound);

	}

	function ball(initX, initY) {
		var obj;
		var position;
		var centerPos;
		var size;
		var status;
		var speed;
		var direction;
		var soundType;
		var intervalId;
		var liftTime = 50;
		var self;
		this.test = 0;

		function hitBigBall () {
			var tempBig;
			var radius = bigRadius + smallRadius;
			var dx, dy;
			var count = bigBallArray.length;
			for(var i = 0; i < count; ++i) {
				tempBig = bigBallArray[i].getCenter();
				dx = Math.abs(tempBig.x - centerPos.x);
				dy = Math.abs(tempBig.y - centerPos.y);
				if(dx > radius || dy > radius)
					continue;
				if(dx*dx + dy*dy <= radius*radius)
					return true;
			}
			return false;
		}

		this.run = function () {
			if(pauseFlag == true)
				return ;
			if(countNew > totalBall + 2) {	// 如果实际总数大于计划总数则会“自杀”
				--countNew;
				clearInterval(intervalId);
				obj.parentNode.removeChild(obj);
			}
			if(position.x <= 0 && Math.abs(direction) > Math.PI/2) {
				direction = direction <= 0 ? -(Math.PI + direction) : Math.PI - direction;
			} else if(position.x >= smallBoundX && Math.abs(direction) < Math.PI/2) {
				direction = direction <= 0 ? -(Math.PI + direction) : Math.PI - direction;
			}
			if(position.y <= 0 && direction < 0) {
				direction = direction <= 0 ? 0 - direction : Math.PI - direction;
			} else if(position.y >= smallBoundY && direction > 0) {
				direction = direction <= 0 ? -(Math.PI + direction) : 0 - direction;
			}

			position.x = position.x + Math.cos(direction) * speed;
			position.y = position.y + Math.sin(direction) * speed;
			obj.style.left = position.x + "px";
			obj.style.top  = position.y + "px";
			centerPos.x = position.x + smallRadius;
			centerPos.y = position.y + smallRadius;
			if(true == hitBigBall()) {
				// 停止运动
				classCount -= 1;
				if(gameMode == false) {
					countNew -= 1;
				}
				document.getElementById('SmallBall').innerText = "SmallBalls: " + classCount;
				clearInterval(intervalId);
				score += 100;
				scoreTable.innerText = "Your Score: " + score + "♪";
				size = 50;
				obj.className = 'big';
				obj.innerText = "";
				position.x = position.x - bigRadius + smallRadius;
				position.y = position.y - bigRadius + smallRadius;

				obj.style.left = position.x + "px";
				obj.style.top = position.y + "px";
				bigBallArray.push(self);
				intervalId = setInterval(lifeCountdown, 100);
				//music[Math.floor(Math.random()*9 + 1)].play();
				playSound(obj, soundType);
			}
			//if (times++ == 100)
			//	clearInterval(intervalId);
		}

		function playSound(parent, sound) {
			var newAudio = document.createElement('audio');
			newAudio.src = "ogg/" + sound + ".ogg";
			newAudio.autoplay = true;
			parent.appendChild(newAudio);
		}

		function disappear() {
			if(pauseFlag == true)
				return ;
			position.x += 1;
			position.y += 1;
			size -= 2;
			obj.style.height = size + "px";
			obj.style.width = size + "px";
			obj.style.left = position.x + "px";
			obj.style.top = position.y + "px";
			obj.style.borderRadius = Math.floor(size/2) + "px";
			obj.className = "disappear";
			if(--liftTime <= 0){
				clearInterval(intervalId);
				obj.parentNode.removeChild(obj);
			}
		}

		function lifeCountdown () {
			if(pauseFlag == true)
				return ;
			if(liftTime-- <= 0) {
				if(gameMode == false && bigBallArray.length == 1) {	// endless mode
					liftTime = 10;
					return;
				} else {
					clearInterval(intervalId);
					liftTime = 30;
					bigBallArray.shift();
					intervalId = setInterval(disappear, 20);
				}
			}
		}

		this.init = function (name, size, me, sound) {
			self = me;
			obj = document.getElementById(name);
			position = {
				x: initX,
				y: initY
			}
			direction = Math.random() * 2 * Math.PI - Math.PI;
			//direction = Math.PI/4;
			status = size;
			speed = 0.5 + Math.random();
			if(status == 'small')
			{
				centerPos = {
					x: initX + smallRadius,
					y: initY + smallRadius
				}
				intervalId = setInterval(this.run, 10);
				size = 20;
			}
			else if(status == 'big') {
				centerPos = {
					x: initX + bigRadius,
					y: initY + bigRadius
				}
				intervalId = setInterval(lifeCountdown, 100);
				size = 50;
			}
			soundType = sound;
			this.test = 19;
		}

		this.getPostion = function () {
			return {
				x: position.x,
				y: position.y
			}
		}
		this.getCenter = function () {
			return {
				x: centerPos.x,
				y: centerPos.y
			}
		}
	}

	function init () {
		var ids = 0;
		info = document.getElementById('info');
		scoreTable = document.getElementById("scoreTable");
		document.getElementById('ModeInfo').innerText = "Mode: " + (gameMode ? "Classic" : "Endless");
		screenWidth = document.body.clientWidth;
		screenHeight = document.body.clientHeight;
		bigBoundX = screenWidth - bigSize;
		bigBoundY = screenHeight - bigSize;
		smallBoundX = screenWidth - smallSize;
		smallBoundY = screenHeight - smallSize;

		function autoNew () {
			if(pauseFlag == true)
				return ;
			if(countNew >= totalBall) 
				return;
			var name = "hello" + nameId++;
			appendNewNode(name, 'small');
			countNew += 1;
			classCount = countNew;
			document.getElementById('SmallBall').innerText = "SmallBalls: " + countNew;
		}

		ids = setInterval(autoNew, 100);
		control = document.getElementById('control');
		disqus = document.getElementById('disqus');
		config = document.getElementById('config');
		settings = document.getElementById('settings');
		restart = document.getElementById('restart');
		document.getElementById('classicMode').checked = gameMode;
		document.getElementById('endlessMode').checked = !gameMode;
	}

	function adjust() {
		screenWidth = document.body.clientWidth;
		screenHeight = document.body.clientHeight;
		bigBoundX = screenWidth - bigSize;
		bigBoundY = screenHeight - bigSize;
		smallBoundX = screenWidth - smallSize;
		smallBoundY = screenHeight - smallSize;
	}

	init();

	window.onresize = adjust;
	document.getElementById('backmap').addEventListener('click', function createBigBall(event) {
		if(score < 1000)
			return ;
		if(pauseFlag == true)
			return ;
		var y = event.clientY - bigSize/2;
		var x = event.clientX - bigSize/2;
		var r = Math.floor(30+190*Math.random());
		var g = Math.floor(90+130*Math.random());
		var b = Math.floor(100+120*Math.random());
		score -= 1000;
		scoreTable.innerText = "Your Score: " + score + "♪";
		appendNewNode('big' + bigBallCount++, 'big', x, y, rgba(r, g, b, 0.6));
	}, false);

	document.getElementById('pause').addEventListener('click', function pauseAntimate(event) {
		if(pauseFlag == false) {
			pauseFlag = true;
			clearInterval(controlIntervalId);
			pause.innerText = "Close";
			config.innerText = "Config";
			controlIntervalId = setInterval(openControl, 10);
		} else {
			clearInterval(controlIntervalId);
			pause.innerText = "About";
			info.style.display = "none";
			disqus.style.display = "none";
			settings.style.display = "none";
			config.style.display = "none";
			restart.style.display = "none";
			document.getElementById('comment').style.display = "none";
			controlIntervalId = setInterval(closeControl, 10);
		}
	}, false);

	function openControl() {
		if(++controlCounter >= 30) {
			info.style.display = "";
			clearInterval(controlIntervalId);
			document.getElementById('comment').style.display = "";
			config.style.display = "";
			restart.style.display = "";
		}
		control.style.height = controlCounter * 13 + "px";
		control.style.width = controlCounter * 20 + "px";
	}

	function closeControl() {
		if(--controlCounter <= 0) {
			clearInterval(controlIntervalId);
			pauseFlag = false;
		}
		control.style.height = controlCounter * 13 + "px";
		control.style.width = controlCounter * 20 + "px";
	}

	document.getElementById('comment').addEventListener('click', function openDisqus(event) {
		if(disqusLoadFlag == false) {
			disqusLoadFlag = true;
			//loading
			(function() {
		        var js = document.createElement('script');
		        js.type = 'text/javascript';
		        js.async = true;
		        js.src = 'http://lovep.disqus.com/embed.js';
		        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(js);
		    })();
		}
		settings.style.display = "none";
		config.innerText = "Config";
		if(disqusDisplayFlag == false) {
			disqus.style.display = "";
			info.style.display = "none";
			disqusDisplayFlag = true;
		} else {
			disqus.style.display = "none";
			info.style.display = "";
			disqusDisplayFlag = false;
		}
	}, false);

	document.getElementById('config').addEventListener('click', function openSettings(event) {
		disqusDisplayFlag = false;

		if(settings.style.display == "none") {	// 呼出设置菜单
			info.style.display = "none";
			disqus.style.display = "none";
			settings.style.display = "";
			config.innerText = "Cancel";
		} else {	// 取消修改
			info.style.display = "";
			disqus.style.display = "none";
			settings.style.display = "none";
			config.innerText = "Config";
			document.getElementById('classicMode').checked = gameMode;
			document.getElementById('endlessMode').checked = !gameMode;
			document.getElementById('amount').value = "" + totalBall;
		}
	}, false);

	restart.addEventListener('click', function doRestart(event) {
		score = 1100;
		scoreTable.innerText = "Your Score: " + score + "♪";
		gameMode = document.getElementById('classicMode').checked == true ? true : false;
		document.getElementById('ModeInfo').innerText = "Mode: " + (gameMode ? "Classic" : "Endless");
		totalBall = parseInt(document.getElementById('amount').value);
	}, false);

	function autoReduceScore () {
		if(pauseFlag == true)
			return ;
		score -= 1;
		scoreTable.innerText = "Your Score: " + score + "♪";
	}
	setInterval(autoReduceScore, 300);
}

// 边想边写，代码略凌乱，命名很随意。。
// mailto:s@lovep.me
// 2013.3.28
// by GZShi

function main() {
	var bigSize = 50;
	var bigRadius = 25;
	var smallSize = 20;
	var smallRadius = 10;
	var minDistance = bigRadius + smallRadius;		
	var minDistance2 = minDistance * minDistance;	// 用于计算大球与小球是否碰撞
	var boundaryRight;		// 右边界 （针对小球半径而言）
	var boundaryBottom;		// 下边界 （同上）
	var bigBallCount = 0;	// 屏幕中大球数量
	var bigBallArray = [];	// 大球数组
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
	var totalBall = 100;
	var totalBallBuf = 100;
	var countNew = 0;
	var classCount = 0;
	var nameId = 0;
	var restart;
	var restartFlag = false;
	var baseDiv;

	function rgba(r, g, b, a) {
		return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
	}

	// 创建新的球对应的DOM节点
	function appendNewNode(name, size, posX, posY, color) {
		var newDiv = document.createElement('div');
		var x = posX == null ? Math.floor(Math.random() * boundaryRight) : posX;
		var y = posY == null ? Math.floor(Math.random() * boundaryBottom) : posY;
		var sound = Math.floor(Math.random()*8 + 1);
		newDiv.className = size;
		newDiv.id = name;
		if(size == 'small')	// FireFox不支持innerText属性
			newDiv.innerText = "123456789".split("")[sound];
		newDiv.style.background = color == null ? rgba(Math.floor(30+190*Math.random()), Math.floor(90+130*Math.random()), Math.floor(100+120*Math.random()), 0.3+Math.random()* 0.6) : color;
		newDiv.style.left = x + "px";
		newDiv.style.top = y + "px";
		baseDiv.appendChild(newDiv);
		var retval = new ball(x, y);
		if(size == 'big')
			bigBallArray.push(retval);
		retval.init(newDiv, retval, size, sound);

	}

	function init () {
		var ids = 0;
		baseDiv = document.getElementById('base');
		info = document.getElementById('info');
		scoreTable = document.getElementById("scoreTable");
		document.getElementById('ModeInfo').innerText = "Mode: " + (gameMode ? "Classic" : "Endless");
		boundaryRight = document.body.clientWidth - smallSize;
		boundaryBottom = document.body.clientHeight - smallSize;

		function autoNew () {
			if(pauseFlag == true)
				return ;
			if(countNew >= totalBall) 
				return;
			appendNewNode("hello" + nameId++, 'small');
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

	// 球类定义
	function ball(initX, initY) {
		var obj;
		var position;
		var centerPos;
		var size;
		var speed;
		var direction;
		var vector;
		var soundType;
		var intervalId;
		var liftTime = 50;
		var self;


		this.init = function (domObj, jsObj, type, sound) {
			self = jsObj;
			obj = domObj;
			position = {
				x: initX,
				y: initY
			}
			direction = Math.random() * 2 * Math.PI - Math.PI;
			vector = [Math.cos(direction), Math.sin(direction)];
			//direction = Math.PI/4;
			speed = 0.5 + Math.random();
			if(type == 'small')
			{
				centerPos = {
					x: initX + smallRadius,
					y: initY + smallRadius
				}
				intervalId = setInterval(this.run, 10);
				size = 20;
			}
			else if(type == 'big') {
				centerPos = {
					x: initX + bigRadius,
					y: initY + bigRadius
				}
				intervalId = setInterval(lifeCountdown, 100);
				size = 50;
			}
			soundType = sound;
		}

		function hitBigBall () {
			var count = bigBallArray.length;
			if (count <= 0)
				return ;
			centerPos.x = position.x + smallRadius;
			centerPos.y = position.y + smallRadius;
			var tempBig;
			var dx, dy;
			for(var i = 0; i < count; ++i) {
				tempBig = bigBallArray[i].getCenter();
				dx = Math.abs(tempBig.x - centerPos.x);
				dy = Math.abs(tempBig.y - centerPos.y);
				if(dx > minDistance || dy > minDistance)
					continue;
				if(dx*dx + dy*dy <= minDistance2)
					return true;
			}
			return false;
		}

		this.run = function () {
			if(pauseFlag == true)
				return ;
			if(countNew > totalBall) {	// 如果实际总数大于计划总数则会“自杀”
				--countNew;
				clearInterval(intervalId);
				obj.parentNode.removeChild(obj);
			}

			// 检测是否与打球有碰撞
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

				centerPos.x = position.x + smallRadius;
				centerPos.y = position.y + smallRadius;
				position.x = position.x - bigRadius + smallRadius;
				position.y = position.y - bigRadius + smallRadius;

				obj.style.left = position.x + "px";
				obj.style.top = position.y + "px";
				bigBallArray.push(self);
				intervalId = setInterval(lifeCountdown, 100);
				playSound(obj, soundType);
				return ;
			}

			// 撞到 x 墙
			if (position.x <= 0 || position.x >= boundaryRight) {
				vector[0] = -vector[0];
			} 
			// 撞到 y 墙
			if(position.y <= 0 || position.y >= boundaryBottom) {
				vector[1] = -vector[1];
			} 

			position.x = position.x + vector[0] * speed;
			position.y = position.y + vector[1] * speed;
			obj.style.left = position.x + "px";
			obj.style.top  = position.y + "px";
		}

		function playSound(parent, sound) {
			var newAudio = document.createElement('audio');
			//newAudio.src = "ogg/" + sound + ".ogg";
			newAudio.autoplay = false;
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


	function adjust() {
		boundaryRight = document.body.clientWidth - smallSize;
		boundaryBottom = document.body.clientHeight - smallSize;
	}

	init();

	window.onresize = adjust;
	baseDiv.addEventListener('click', function createBigBall(event) {
		if(score < -100000)
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

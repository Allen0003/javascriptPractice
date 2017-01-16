var mineInfo = [];
var minesTotal;
var aiFlag = true;
var recordAlreadyPass = [];
var oddTable = [];

// i need a whole table to record current information

function reflushAgain(id) {
	var screen = document.getElementById(id);
	while (screen.childNodes.length > 1) {
		screen.removeChild(screen.lastChild);
	}
	if (screen.children.length != 0) {
		screen.removeChild(screen.lastChild);
	}
}

function setMineNum() {
	reflushAgain("second");
	var second = document.getElementById("second");
	var num = $("#input option:selected").val(); // length and width

	var maxMineNum = (num * num) / 2

	var select2 = $("<select></select>").attr({
		"id" : 'minesTotal',
		"width" : '100px'
	});

	var option = $("<option></option>").attr({
		"value" : 'be choose',
		"disabled" : 'disabled',
		"selected" : 'selected',
		"display" : 'none'
	}).text('be choose');

	$(option).hide().appendTo(select2).fadeIn(300);

	for (var i = 3; i < maxMineNum; i++) {
		var option = $("<option></option>").attr({
			"value" : i
		}).text(i);
		$(option).hide().appendTo(select2).fadeIn(300);
	}

	$(select2).hide().appendTo($("#second")).fadeIn(300).on("change",
			function(event) {
				begin();
			});

}

function begin() {
	reflushAgain("screen");
	var num = $("#input").val();
	minesTotal = $("#minesTotal").val();
	for (var x = 0; x < num; x++) {
		mineInfo[x] = [];
		recordAlreadyPass[x] = [];
		oddTable[x] = [];
		for (var y = 0; y < num; y++) {
			mineInfo[x][y] = 0;
			recordAlreadyPass[x][y] = -1; // -1 is uncover area
			oddTable[x][y] = minesTotal / (num * num);
			// 100 ---> open 99 ----> 100%die
		}
	}
	for (var i = 0; i < minesTotal; i++) {
		setMine(num, mineInfo);
	}
	setScreen(num);
}

function setScreen(num) {

	for (var i = 0; i < num; i++) {
		var wid = num * 22 + num * 10;
		var enclose = $("<div></div>").css({
			"height" : '22px',
			"width" : wid + "px"
		});

		$("#screen").append(enclose).fadeIn(300);

		for (var j = 0; j < num; j++) {
			var divField = $("<div></div>").addClass("convered").attr({
				"id" : i + "," + j
			}).on("click", function() {
				pressDiv(this, num);
				// Initiates an AJAX request on click
				$.get("");
			}).hide().appendTo(enclose).fadeIn(1000);
		}
	}
}

function setMine(num, mineInfo) {
	var mineX = Math.floor(Math.random() * 11) % num;
	var mineY = Math.floor(Math.random() * 11) % num;

	if (mineInfo[mineX][mineY] == 0) {
		mineInfo[mineX][mineY] = 1;
	} else {
		setMine(num, mineInfo);
	}
}

function pressDiv(obj, num) {
	var xy = new Array();

	xy = $(obj).attr('id').split(",");

	var x = xy[0];
	var y = xy[1];

	recordAlreadyPass[x][y] = getNumberOfMine(x, y, num);
	oddTable[x][y] = 1;

	if (mineInfo[x][y] == 1) {
		$(obj).removeClass("convered").addClass("discovered").text("X").off(
				'click');
		alert("byr");
		if (!aiFlag) { // ai choose
			alert("you win");
		} else {
			alert("try it again!");
		}
		aiFlag = false;
		begin();
	} else {
		$(obj).removeClass("convered").addClass("discovered").off('click')
				.text(getNumberOfMine(x, y, num));
	}

	if (aiFlag) { // start AI
		wait(500);
		setTimeout(function() {
			startAI(num, recordAlreadyPass);
		}, 503);
	}
	aiFlag = true;
}

function startAI(num, recordAlreadyPass) {

	aiFlag = false;
	var joint = aiChooseXY(num, recordAlreadyPass);
	var temp = document.getElementById(joint);
	pressDiv($(temp), num);
}

function aiChooseXY(num, recordAlreadyPass) {
	// First step: scan whole table
	// renew oddTable;
	for (var i = 0; i < num; i++) {
		for (var j = 0; j < num; j++) {
			if (recordAlreadyPass[i][j] != -1) { // on discover areas
				var odd = (recordAlreadyPass[i][j] / getDenominator(i, j,
						recordAlreadyPass, num));
				addOddTable(i, j, recordAlreadyPass, num, odd);
			}
		}
	}

	var min = 1; // 100% explode
	var x, y;

	for (var i = 0; i < num; i++) {
		for (var j = 0; j < num; j++) {
			if (oddTable[i][j] < min) {
				min = oddTable[i][j];
				x = i;
				y = j;
			}
		}
	}

	if (min < 1) {
		return (x + "," + y).toString().trim();
	}

	var x = Math.floor(Math.random() * 11) % num;
	var y = Math.floor(Math.random() * 11) % num;

	if (recordAlreadyPass[x][y] == -1) {
		return (x + "," + y).toString().trim();
	} else {
		aiChooseXY(num, recordAlreadyPass);
	}
}

function addOddTable(x, y, recordAlreadyPass, num, odd) {

	if (!isOutsetWall(x - 1, y - 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x - 1][y - 1])) {
		if (oddTable[x - 1][y - 1] != 0) {
			oddTable[x - 1][y - 1] = odd;
		}
	}// 1
	if (!isOutsetWall(x, y - 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x][y - 1])) {
		if (oddTable[x][y - 1] != 0) {
			oddTable[x][y - 1] = odd;
		}
	}// 2
	if (!isOutsetWall(x + 1, y - 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x + 1][y - 1])) {
		if (oddTable[x + 1][y - 1] != 0) {
			oddTable[x + 1][y - 1] = odd;
		}
	}// 3
	if (!isOutsetWall(x - 1, y, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x - 1][y])) {
		if (oddTable[x - 1][y] != 0) {
			oddTable[x - 1][y] = odd;
		}
	}// 4
	if (!isOutsetWall(x + 1, y, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x + 1][y])) {
		if (oddTable[x + 1][y] != 0) {
			oddTable[x + 1][y] = odd;
		}
	}// 5
	if (!isOutsetWall(x - 1, y + 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x - 1][y + 1])) {
		if (oddTable[x - 1][y + 1] != 0) {
			oddTable[x - 1][y + 1] = odd;
		}
	}// 6
	if (!isOutsetWall(x, y + 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x][y + 1])) {
		if (oddTable[x][y + 1] != 0) {
			oddTable[x][y + 1] = odd;
		}
	} // 7
	if (!isOutsetWall(x + 1, y + 1, num, recordAlreadyPass)
			&& (odd == 0 || odd > oddTable[x + 1][y + 1])) {
		if (oddTable[x + 1][y + 1] != 0) {
			oddTable[x + 1][y + 1] = odd;
		}
	} // 8
}

function getDenominator(x, y, recordAlreadyPass, num) {
	var temp = 0;
	if (!isOutsetWall(x - 1, y - 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x - 1][y - 1] == -1) {
		temp++;
	}// 1
	if (!isOutsetWall(x, y - 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x][y - 1] == -1) {
		temp++;
	}// 2
	if (!isOutsetWall(x + 1, y - 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x + 1][y - 1] == -1) {
		temp++;
	}// 3
	if (!isOutsetWall(x - 1, y, num, recordAlreadyPass)
			&& recordAlreadyPass[x - 1][y] == -1) {
		temp++;
	}// 4
	if (!isOutsetWall(x + 1, y, num, recordAlreadyPass)
			&& recordAlreadyPass[x + 1][y] == -1) {
		temp++;
	}// 5
	if (!isOutsetWall(x - 1, y + 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x - 1][y + 1] == -1) {
		temp++;
	}// 6
	if (!isOutsetWall(x, y + 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x][y + 1] == -1) {
		temp++;
	} // 7
	if (!isOutsetWall(x + 1, y + 1, num, recordAlreadyPass)
			&& recordAlreadyPass[x + 1][y + 1] == -1) {
		temp++;
	} // 8
	return temp;
}

function isOutsetWall(x, y, num, recordAlreadyPass) {
	// confirm that is div discovered, too
	if (parseInt(x, 10) < 0 || parseInt(y, 10) < 0 || parseInt(x, 10) == num
			|| parseInt(y, 10) == num) { // is wall?
		return true;
	} else if (recordAlreadyPass[x][y] != -1) {
		return true;
	} else {
		return false;
	}
}

function getNumberOfMine(x, y, num) {
	var aroundNum = 0;

	x = parseInt(x, 10);
	y = parseInt(y, 10);

	aroundNum = examMine(x - 1, y - 1, num) + examMine(x, y - 1, num)
			+ examMine(x, y + 1, num) + examMine(x + 1, y, num)
			+ examMine(x - 1, y, num) + examMine(x + 1, y - 1, num)
			+ examMine(x - 1, y + 1, num) + examMine(x + 1, y + 1, num);
	return aroundNum;
}

function examMine(x, y, num) {
	var temp = 0;
	if (parseInt(x, 10) < 0 || parseInt(y, 10) < 0 || parseInt(x, 10) == num
			|| parseInt(y, 10) == num) {
		temp = 0;
	} else if (mineInfo[x][y] == 1) {
		temp = 1;
	}
	return temp;
}

// TODO easy the code
function wait(time) {
	$body = $("body");
	$(document).on({
		ajaxStart : function() {
			$body.addClass("loading");
		},
		ajaxStop : function() {
			$body.removeClass("loading");
		}
	});

	var _ajax = $.ajax;

	_ajax.call($, $.extend(true, {}, {
		xhr : function() {
			return {
				open : function() {
				},
				send : function() {
					var process = (function(that) {
						return function() {
							return (function() {
								this.readyState = 4;
								var onReady = this.onreadystatechange;
								onReady.call(this, 'timeout');
							}).apply(that);
						};
					})(this);
					this.responseTimer = setTimeout(process, time);
				},
			};
		}
	}));
}

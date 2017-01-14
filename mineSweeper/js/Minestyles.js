var isSafari = navigator.userAgent.search("Safari") > -1;// Google瀏覽器是用這核心

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
	var maxMineNum;
	var num = document.getElementById("input").value; // 長跟寬

	maxMineNum = (num * num) / 2
	var select2 = document.createElement("select");
	select2.setAttribute("id", "minesTotal");

	if (isSafari) {
		select2.setAttribute("onchange", "begin();");
		select2.style.width = "100px";
	} else {
		select2.style.setAttribute("cssText", "width: 100px;");
		select2.onchange = function() {
			begin();
		}; // for IE
	}

	var option = document.createElement("option");
	option.setAttribute("value", "");
	option.innerHTML = "be choose";
	option.disabled = true;
	option.selected = true;

	if (isSafari) {
		option.style.display = "none";
	} else {
		option.style.setAttribute("display", "none;");
	}

	$(option).hide().appendTo(select2).fadeIn(300);

	for (var i = 3; i < maxMineNum; i++) {
		var option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = i;
		$(option).hide().appendTo(select2).fadeIn(300);
	}

	$(select2).hide().appendTo(second).fadeIn(300);
}

function begin() {
	reflushAgain("screen");
	var num = document.getElementById("input").value;
	minesTotal = document.getElementById("minesTotal").value;
	for (var x = 0; x < num; x++) {
		mineInfo[x] = [];
		recordAlreadyPass[x] = [];
		oddTable[x] = [];
		for (var y = 0; y < num; y++) {
			mineInfo[x][y] = 0;
			recordAlreadyPass[x][y] = -1; // -1 is uncover area
			oddTable[x][y] = minesTotal / (num * num); // 100 ---> open 99
														// ----> 100%die
		}
	}
	for (var i = 0; i < minesTotal; i++) {
		setMine(num, mineInfo);
	}

	setScreen(num);
}

function setScreen(num) {
	var screen = document.getElementById("screen");

	for (var i = 0; i < num; i++) {
		var enclose = document.createElement("div");
		screen.appendChild(enclose);
		var wid = num * 22 + num * 10;
		if (isSafari) {
			enclose.style.height = "22px";
			enclose.style.width = wid + "px";
		} else {
			enclose.style.setAttribute("cssText", "height:22px ; width:" + wid
					+ "px; ");
		}

		for (var j = 0; j < num; j++) {

			var divField = document.createElement("div");
			if (isSafari) {
				divField.style.height = "22px";
				divField.style.width = wid + "px";
				divField.setAttribute("id", i + "," + j);

				divField.style.cursor = "pointer";

				divField.style.borderstyle = "outset";
				divField.style.float = "left";
				divField.style.borderwidth = "5px";
				divField.style.borderbordercolor = "gray";
				divField.style.borderbackgroundcolor = "gray";
				// divField.setAttribute("onclick", "pressDiv(this.id,num);" );
				// *************
			} else {
				divField.style
						.setAttribute(
								"cssText",
								"height:22px ; width:22px; cursor:pointer; border-style:outset; float:left;  border-width:5px; border-color:gray ;background-color: gray ; ");
				// divField.style.setAttribute("cssText", "height:22px ;
				// width:"+wid+"px; ");
				divField.setAttribute("id", i + "," + j);
				divField.onclick = function() {
					pressDiv(this.id, num);
				}; // for IE
			}

			$(divField).hide().appendTo(enclose).fadeIn(1000);

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

function pressDiv(id, num) {

	var xy = new Array();
	xy = id.split(",");

	var x = xy[0];
	var y = xy[1];

	recordAlreadyPass[x][y] = getNumberOfMine(x, y, num);
	oddTable[x][y] = 1;
	var show = document.getElementById(id);
	if (mineInfo[x][y] == 1) {
		show.innerHTML = "X";
		show.style
				.setAttribute(
						"cssText",
						"height:22px ; width:22px; cursor:pointer; border-style:inset; float:left;  border-width:5px; border-color:gray ;background-color: white ; ");
		alert("byr");
		if (!aiFlag) { // ai choose
			alert("ok u win the stupid ai , whatever if u feel happey that's u choose");
		} else {
			alert("asshole, you're never gonna no sense to play the game there ain't no way that you'll win");
		}
		aiFlag = false;
		begin();
	} else {
		show.style
				.setAttribute(
						"cssText",
						"height:22px ; width:22px; cursor:pointer; border-style:inset; float:left;  border-width:5px; border-color:gray  ; background-color: white ; ");
		show.innerHTML = getNumberOfMine(x, y, num);

	}

	if (aiFlag) { // start AI
		wait(1000);
		setTimeout(function() {
			startAI(num, recordAlreadyPass);
		}, 1003);
	}
	aiFlag = true;
}

function startAI(num, recordAlreadyPass) {

	aiFlag = false;
	var joint = "";
	joint = aiChooseXY(num, recordAlreadyPass);
	if (typeof joint == "undefined") { // 不知道為甚麼的bug
		startAI(num, recordAlreadyPass);
	}
	pressDiv(joint, num);
}

function aiChooseXY(num, recordAlreadyPass) {
	// first step is scan whole table
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

	var x, y;

	x = Math.floor(Math.random() * 11) % num;
	y = Math.floor(Math.random() * 11) % num;

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

function isOutsetWall(x, y, num, recordAlreadyPass) { // confirm is open , too
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

function wait(time) {
	$(function() {
		$body = $("body");
		$(document).on({
			ajaxStart : function() {
				$body.addClass("loading");
			},
			ajaxStop : function() {
				$body.removeClass("loading");
			}
		});
		// Initiates an AJAX request on click
		$("#screen").on("click", function() {
			$.get("/mockjax");
		});
		(function($) {
			var _ajax = $.ajax, mockHandler;
			// Trigger a jQuery event
			// Check if the data field on the mock handler and the request
			// match. This
			// can be used to restrict a mock handler to being used only when a
			// certain
			// set of data is passed to it.
			function isMockDataEqual(mock, live) {
				// var identical = true;
				// Test for situations where the data is a querystring (not an
				// object)
				$.each(mock, function(k) {
				});
				return true;
			}
			// Process the xhr objects send operation
			function _xhrSend(mockHandler, requestSettings) {
				// This is a substitute for < 1.4 which lacks $.proxy
				var process = (function(that) {
					return function() {
						return (function() {
							// The request has returned
							this.readyState = 4;
							// jQuery 2.0 renamed onreadystatechange to onload
							var onReady = this.onreadystatechange
									|| this.onload;
							// jQuery < 1.4 doesn't have onreadystate change for
							// xhr
							if ($.isFunction(onReady)) {
								onReady.call(this,
										mockHandler.isTimeout ? 'timeout'
												: undefined);
							}
						}).apply(that);
					};
				})(this);
				if (requestSettings.async === false) {
					// strictly equal
					process();
				} else {
					this.responseTimer = setTimeout(process,
							mockHandler.responseTime || 50);
				}
			}
			// Construct a mocked XHR Object
			function xhr(mockHandler, requestSettings) {
				return {
					open : function() {
					},
					send : function() {
						_xhrSend.call(this, mockHandler, requestSettings);
					},
				};
			}
			// The core $.ajax replacement.
			function handleAjax(url) {
				var mockRequest, requestSettings;
				// Extend the original settings for the request
				requestSettings = $.ajaxSettings;
				// Iterate over our mock handlers (in registration order) until
				// we find
				// one that is willing to intercept the request
				(function(mockHandler, requestSettings) {
					mockRequest = _ajax.call($, $.extend(true, {}, {
						// Mock the XHR object
						xhr : function() {
							return xhr(mockHandler, requestSettings);
						}
					}));
				})(mockHandler, requestSettings);

				return mockRequest;
			}
			$.extend({
				ajax : handleAjax
			});
			$.mockjax = function(settings) {
				mockHandler = settings;
			};
		})(jQuery);
		$.mockjax({
			url : "/mockjax",
			responseTime : time
		});
	});
}

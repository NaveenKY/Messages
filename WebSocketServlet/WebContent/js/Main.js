/**
 * 
 */

Notification.requestPermission();

var ws, selectedUser, userName, selectedUserTile;

function next(e) {
	userName = document.getElementById("userName").value;
	document.getElementById("invalid-username").innerText="";
	if(userName === null || userName.length === 0) {
		document.getElementById("invalid-username").innerText="Please enter valid User Name!!";
	} else {
		document.getElementById("new-user").style.display = "none";
		document.getElementById("message-window").style.display = "block";
		document.getElementById("user-window").style.display = "block";
		startMessaging(userName);
	}
}

function startMessaging(userName) {
	ws = new WebSocket("ws://localhost:8080/Messages/message?userId=" + userName);
	
	ws.onopen = function() {
		console.log("Here");
	};
	
	ws.onmessage = function(message) {
		var data = JSON.parse(message.data);
		if (data.type === 'USER_LIST') {
			document.getElementById("user-window").innerHTML = "";
			var users = Object.keys(data.data);
			users.forEach(function(user) {
				if (userName !== user) {
					var divElem = document.createElement("div");
					divElem.className = "user-tile";
					var $userTile = "<p>" + data.data[user] + "</p>";
					divElem.innerHTML = $userTile;
					divElem.value = data.data[user];
					document.getElementById("user-window").appendChild(divElem);
					document.getElementById("user-window").appendChild(document.createElement("br"));
					divElem.addEventListener("click", function(e) {
						if(selectedUserTile) {
							selectedUserTile.classList.remove("user-tile-selected");
						}
						document.getElementById("sendMessage").disabled=false;
						selectedUser = e.currentTarget.value;
						selectedUserTile = e.currentTarget;
						e.currentTarget.classList.add("user-tile-selected");
					});
				}
			});
		} else if (data.type === 'NEW_MESSAGE') {
			notifyMe(data.data.message);
			document.getElementById("msgArea").textContent += data.data.message + "\n";
		}
	};
}

function notifyMe(message) {
	if (!("Notification" in window)) {
		console.log("This browser does not support system notifications");
	} else if (Notification.permission === "granted") {
		new Notification(message);
	} else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function(permission) {
			if (permission === "granted") {
				new Notification(message);
			}
		});
	}
};

function postToServer() {
	document.getElementById("invalid-msg").innerText = "";
	if(document.getElementById("msg").value === null || document.getElementById("msg").value.length === 0) {
		document.getElementById("invalid-msg").innerText = "Please type message to send!!";
	} else {
		var newMessage = new Object();
		newMessage.type = "NEW_MESSAGE";
		newMessage.data = new Object();
		newMessage.data.to = selectedUser;
		newMessage.data.message = document.getElementById("msg").value;
		ws.send(JSON.stringify(newMessage));
		document.getElementById("msg").value = "";
		document.getElementById("msgArea").textContent += " - You : \n" + newMessage.data.message + "\n";
	}
}

function closeConnect() {
	ws.close();
}
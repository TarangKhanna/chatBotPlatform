// client side config
var socket = io.connect();
// to see if user is typing
var typing = false;
var timeout = undefined;
var userCount = 0;
var currentUser = '';
var array = [];

var prevNotification;
function timeoutFunction(){
  typing = false;
  socket.emit("typing", {isTyping: false, person: currentUser});
}

socket.on("isTyping", function(data) {
  if (data.isTyping) {
    if ($("#"+data.person+"").length === 0) {
      $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i>" + data.person + " is typing...</small></li>");
      timeout = setTimeout(timeoutFunction, 5000);
    }
  } else {
    $("#"+data.person+"").remove();
  }
});

function switchRoom(room) {
    socket.emit('switchRoom', room);
}

socket.on('updaterooms', function(rooms, current_room) {

    $('#roomSelect').empty();
    $.each(rooms, function(key, value) {
      if(value == current_room){
        $('#roomSelect').append('<div>' + value + '</div>');
      }
      else {
        $('#roomSelect').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
      }
    });
});


function addMessage(msg, name) {

  var text=msg;
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var text1=text.replace(exp, "<a href='$1'>$1</a>");
  var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;

  msg = text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>')

  if(currentUser != name) {
    $("#chatEntries").append('<div class="message"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
  } else {
    $("#chatEntries").append('<div class="messageSelf"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
  }

  $('#chatEntries').animate({
      scrollTop: $("#chatEntries").offset().bottom
  }, 2000);

  // scroll automatically when new message arrives
  var $cont = $('#chatEntries');
  $cont[0].scrollTop = $cont[0].scrollHeight;

  $('#messageInput').keyup(function(e) {
      if (e.keyCode == 13) {
          // $cont.append('<p>' + $(this).val() + '</p>');
          $cont[0].scrollTop = $cont[0].scrollHeight;
          $(this).val('');
      }
  })
}

function sendMessage() {
    if ($('#messageInput').val() != "")
    {
        var msg = $('#messageInput').val();
        socket.emit('message', msg);
        // addMessage($('#messageInput').val(), "Me"); // replace Me with current user

        $('#messageInput').val(''); // clear
    }
}

// add room
function addNewRoom() {
    if ($('#roomInput').val() != "")
    {
        var roomName = $('#roomInput').val();
        socket.emit('addRoom', roomName);
        $('#roomInput').val(''); // clear
    }
}

function setName(isSignIn) {
    if ($("#nameInput").val() != "" && $("#passwordInput").val() != "")
    {
		$.modal.close();
		socket.emit('setName', $("#nameInput").val());
		socket.emit('setUser', {username: $("#nameInput").val(), password: $("#passwordInput").val(), isSignIn: isSignIn});
		socket.on('nameStatus', function(data){
			if(data == "ok")
			{
				// user entered room -- make light colored
				socket.emit('enteredRoom', "User " + $("#nameInput").val() + " entered the room");

				// addMessage("User " + $("#nameInput").val() + " entered room", "Me");
			    currentUser = $("#nameInput").val();
		    	array.push(currentUser);
		   		//console.log(array);
		        $('#chatControls').show();
		        // $('#nameInput').hide();
		        // $('#signUp').hide();
		  // 		  $('#signIn').hide();
		        $("#welcomeParagraph").show();
		        $("#welcomeParagraph").html('<div class="Welcome"><p> Hello! ' + $("#nameInput").val() + '. Welcome to our CS408 Proj.</p></div>');
		    // $("#userName").html('<div class="User in room"><p> ' + $("#nameInput").val() + '</p></div>');
			}
			else if(data == "error")
			{
				alert("Name Already Taken");
				$('#nameForm').modal({escapeClose: false, clickClose: false, showClose: false});
			}
			else if(data == "wrongPassword")
			{
				alert("Wrong password");
				$("#nameForm").modal({escapeClose: false, clickClose: false, showClose: false});
			}
		})

    // scroll automatically when new message arrives
    var $cont = $('#room');
    $cont[0].scrollTop = $cont[0].scrollHeight;

    $('#room').keyup(function(e) {
        if (e.keyCode == 13) {
            // $cont.append('<p>' + $(this).val() + '</p>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $(this).val('');
        }
    })
  }
}


// added custom method to String
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

socket.on('message', function(data) {
    addMessage(data['message'], data['name']);
    console.log(data);
    // notifyMe(data['name'],data['message']);
});

socket.on('nbUsers', function(msg) {
    console.log(msg.nb);
    $("#nbUsers").html(msg.nb);
});

socket.on('usersInRoom', function(msg){
    $("#usersInRoom").empty(); // clear, users might disconnect, and its appending
    $("#usersInRoom").append("Users in room: <br/>")
    for(i = 0; i < msg.un.length; i++){
      $("#usersInRoom").append("- " + msg.un[i] + "<br/>");
    }
    // $("#updates").append("------------");
});


// push notifications
function notifyMe(user,message) {
  if(currentUser != user) { // do not notify user sending the message ofc
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      // If okay let's create a notification
      var options = {
          body: message,
          dir : "ltr"
      };
      var notification = new Notification(user + " Sent a message",options);

    }
    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // Whatever the user answers, we make sure we store the information
        if (!('permission' in Notification)) {
          Notification.permission = permission;
        }
        // If the user is okay, let's create a notification
        if (permission === "granted") {
          var options = {
                  body: message,
                  dir : "ltr"
          };
          var notification = new Notification(user + " Sent a message",options);
        }
      });
    }
    // Do nothing if user denies notification
  }
}

// init

$(function() {
    // $('html, body').css({
    //   'overflow': 'hidden',
    //   'height': '100%'
    // });
    // Below line needs to print a button for all available rooms
    //$("#hud").append('<button type="submit" data-toggle="modal" data-target="#nameForm">CHANGE USER</button><button type="submit" data-toggle="modal" data-target="#roomForm">CREATE NEW ROOM WITHOUT PASSWORD</button><form style="margin: 0; padding: 0;">CREATE ROOM WITH PASSWORD:<input style="display: inline;"type="text" name="roomPass"><input type="submit" value="Create Room"></form>');
    drawHud();
    // Below line needs to print a button for all available rooms
    getAllRooms();
    $("#chatControls").hide();
    $("#messageInput").keypress(function(e) {
		// alert("typing");
	 	 if (e.which !== 13) {
		    if (typing === false && $("#messageInput").is(":focus")) {
		      typing = true;
		      socket.emit("typing", {isTyping: true, person: currentUser});

		    } else {
		      clearTimeout(timeout);
		      timeout = setTimeout(timeoutFunction, 5000);
		    }
		} else {
			sendMessage();
		}
	});

    $('#nameForm').modal({escapeClose: false, clickClose: false, showClose: false});
    $("#signUp").click(function() {setName(0)});
    $("#signIn").click(function() {setName(1)});
    
    $("#createRoom").click(function() {addNewRoom();});
    $("#").click(function() {setName()});
    $("#submit").click(function() {sendMessage();});
    $("#welcomeParagraph").hide();
});

function getAllRooms() {

    var i = 5;

    // while(i > 0){
    //   $("#roomSelect").append('<button type="submit">ROOM NAME HERE</button>');
    //   i--;
    // }
}

function joinRoom(){
    // send request to server to join new rooms
    // Probably using socket.io

}

function drawHud() {
    // $("#right").append('<button type="submit" data-toggle="modal" data-target="#roomForm">CREATE NEW ROOM WITHOUT PASSWORD</button><form style="margin: 0; padding: 0; ">CREATE ROOM WITH PASSWORD:<input style="display: inline;"type="text" name="roomPass"><input type="submit" value="Create Room"></form>');
}

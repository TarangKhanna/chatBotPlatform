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


function addMessage(msg, name) {
    if(currentUser != name) {
      $("#chatEntries").append('<div class="message"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
    } else {
      $("#chatEntries").append('<div class="messageSelf"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
    }
    console.log("SCROLL");
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
        socket.emit('message', $('#messageInput').val());
        // addMessage($('#messageInput').val(), "Me"); // replace Me with current user
        $('#messageInput').val(''); // clear
    }
}

function setName(isSignIn) {
    if ($("#nameInput").val() != "")
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
		        $("#welcomeParagraph").html('<div class="Welcome"><p> Hello! ' + $("#nameInput").val() + '. Welcome to Emomix.</p></div>');   
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

socket.on('emotion', function(data) {
  addEmotion(data['emotion'], data['name']);
});


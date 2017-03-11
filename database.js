/*
#Database Code

emomix.firebaseIO.com is the URL of our Firebase database

##Structure of Database
In our database we have:
1) a list of users
2) a list of chat rooms

The list of users is for checking if the person signing in already exists. 

	User{
		name
		password
		rooms[]
	}

The chat rooms will hold an object called room_info

	Room_Info{
		room name
		room emotion
	}

The chat rooms will also hold the chat messages

	Message{
		sender name
		sender message
		sender emotion
		sender date
	}

##Operations
1. Create account
	a) Check if username is already taken, if so, return error
	b) If username is not taken, .push() the new user into list
2. Sign into account
	a) Check if username exists, if not, return error
	b) Check if password matches, if not, return error
	c) Else, load the chat rooms into the UI
	d) Set firebase URL directory to current user
3. Create new room
	a) Go to the current user's room[] and push() the new room
4. Add users to room
	a) Search for user(s), load their rooms[] and push() the room
	b) Should result in an immediate change for the other users too
5. Select room
	a) Removes the current room selected
	b) Get the ID of the new room selected
	c) Search for the ID of the new room
	d) Load the new room's info + all messages
6. Exit room (as in leave the group chat)
	a) If last person, delete the room
	b) Go to the person's room[] and pop() the room ID
7. Search users
	a) Returns the list of users
8. Send message (to current room)
	a) pushes to current room
*/
var testVar = 1;

module.exports = {
	test: test,
	testVar: testVar,
	signup: signup,
	signin: signin,
	createChatroom: createChatroom,
	addUsersToChatroom: addUsersToChatroom,
	enterChatroom: enterChatroom,
	myRooms: myRooms,
	currentRoom: currentRoom,
	/*
	removeChatroom: removeChatroom,
	searchUsers: searchUsers,*/
	sendMessage: sendMessage
};

var Firebase = require("firebase");
//Pointer to Firebase (needs to update if we move to a different object)
var firebase_url = "https://emomix.firebaseIO.com/roomlist";
var username = "none";
var firebase_ref = new Firebase(firebase_url);
var userlist_ref = new Firebase("https://emomix.firebaseio.com/userlist");
var roomlist_ref = new Firebase("https://emomix.firebaseio.com/roomlist");
var currentRoom;
var myRooms = [];

function test()
{
	//var test1 = "Charlie";
	//var test2 = "password";
	//var test3 = [];
	//console.log("database module is connected!");
	//var newUser = new Object;
	//newUser[test1] = {password: test2, rooms: test3};
	//var id = firebase_ref.child("userlist").set(newUser);
	var searchName = new Firebase("https://emomix.firebaseio.com/userlist").once('value', queryForUser);
	if(searchName == null)
		console.log("2: user not found");
	else
		console.log("2: user found");
}

function queryForUser(snapshot)
{
	console.log("1: snapshot.val = " + snapshot.val());
	var snap = snapshot.val();
	var char = snap["Charlie"];
	var pass = char["password"];
	console.log("1.1: snapshot.child.val = " + pass);
	return snapshot.val();
}

/*
1. Create account
	a) Check if username is already taken, if so, return false
	b) If username is not taken, add the new user into list and then return true
Pet Peeve #1 with Javascript: The only way to prevent asynchrony is with callbacks. Let's say I have a function that does two actions where the second
action is dependent on the first. The only way to guarantee it is to turn both actions into functions and then chain them together. Talk about unnecessary overuse of the stack!
*/
function signup(username, password, func)
{
	return userlist_ref.once('value', function(snapshot)
	{
		//first check if the username exists
		if(!snapshot.child(username).exists())
		{
			console.log("Creating new user " + username);
			//create new object
			var newUser = new Object();
			var defaultRoom = {'-KFwxfEIgyC_z6omvB0P': "CS Majors Only"};
			newUser = {password: password, rooms: defaultRoom};
			//newUser[username] = {password: password, rooms: []};
			userlist_ref.child(username).set(newUser);
			func(username, password, true);
		}
		//if it doesn't, add the new user!
		else//return error
		{
			console.log("Username already exists");
			func(username, password, false);
		}
	});
}

/*
2. Sign into account
	a) Check if username exists, if not, return error
	b) Check if password matches, if not, return error
	c) Else, load the chat rooms into the UI
	d) Set firebase URL directory to current user
*/
function signin(username, password, func)
{
	var returnVal;
	userlist_ref.once("value", function(snapshot)
	{
		//if the username exists
		if(snapshot.child(username).exists())
		{
			//extracts fields from object
			var user = snapshot.val();
			user = user[username];
			//check pass
			if(password == user["password"])
			{
				console.log("password" + password + "==" + user["password"]);
				//extract room array then push it to the myRooms global variable
				//might want to make myRooms
				var roomArr = user["rooms"];
				if(roomArr != undefined)
				{
					var numRooms = roomArr.length;
					if(numRooms != undefined)
					{
						for(var i = 0; i < numRooms; i++)
						{
							myRooms.push(roomArr[i]);
						}
						console.log("numRooms = " + numRooms);
					}
					else
					{
						myRooms.push(roomArr);
					}
					func("success", myRooms);
				}
				else
					func("no rooms");
			}
			else
			{
				console.log("password" + password + "!=" + user["password"]);				
				func("invalid password");
			}
		}
		else
		{
			console.log("username not found");
			func("username not found");
		}
	});
}
/*
3. Create new room
	a) Create new room in database
	b) Also go to the current user's room[] and push() the new room

	Room_Info{
		room name
		room emotion
	}

	Message{
		sender name
		sender message
		sender emotion
		sender date
	}
*/
function createChatroom(username, name_of_room)
{
	createChatroomCallback(firebase_ref.push({
		Meta:{
			name: name_of_room,
			emotion: "Neutral",
			count: 0
		},
		Messages:{
			"0":{
				name: "Watson",
				message: "Welcome!",
				emotion: "Happy",
				date: new Date().getTime()
			}
		}
	}), username, name_of_room);
}

// function switchRoom(switchTo) {
	// currentRoom = switchTo;
// }

function createChatroomCallback(new_ref, username, name_of_room)
{
	//get user's room field and add to it
	var room_ID = new_ref["path"];
	room_ID = room_ID["u"];
	console.log(room_ID[1]);
	room_ID = room_ID[1];
	//console.log(firebase_url + "/userlist/" + username + "/rooms/" + room_ID);
	new Firebase(userlist_ref + "/" + username + "/rooms/" + room_ID).set(name_of_room);
	//update array with the room
	myrooms.push({room_ID: room_ID, name_of_room: name_of_room});
}

/*
4. Add users to room
	a) Search for user(s), load their rooms[] and push() the room
	b) Should result in an immediate change for the other users too
*/

function addUsersToChatroom(users, room)
{
	var room_ID = room.room_ID;
	var name_of_room = room.name_of_room;
	var numUsers = users.length;
	for(var i = 0; i < numUsers; i++)
	{
		//get user's room field and add to it
		//console.log(firebase_url + "/userlist/" + username + "/rooms/" + room_ID);
		new Firebase(userlist_ref + "/" + users[i] + "/rooms/" + room_ID).set(name_of_room);
	}
}

/*
5. Select room
	a) Removes the current room selected
	b) Get the ID of the new room selected
	c) Search for the ID of the new room
	d) Load the new room's info + all messages
*/
function enterChatroom(room, func)
{
	var room_ID = room;
	currentRoom = room_ID;
	console.log("current room better be fucking defined here = " + currentRoom);
	//remove previous callback
	firebase_ref.off();
	//update pointer to the room
	firebase_ref = new Firebase(firebase_url + "/" + room_ID + "/Messages");
	//reattach callback
	firebase_ref.on("child_added", function(snapshot)
		{
			var msg = snapshot.val();
			var name = msg.name;
			var text = msg.message;
			var emotion = msg.emotion;
			func(name, text, emotion);
		});
}

function onCallback(snapshot, func)
{
	var msg = snapshot.val();
	var name = msg.name;
	var text = msg.message;
	var emotion = msg.emotion;
	func(name, text, emotion);
	//console.log("name = " + name + "\t\ntext = " + text + "\t\nemotion = " + emotion);
}

function displayChat(name, text, emotion)
{
	console.log("Name = " + name);
	console.log("Text = " + text);
	console.log("Emotion = " + emotion);
}

/*
6. Exit room (as in leave the group chat)
	a) If last person, delete the room
	b) Go to the person's room[] and pop() the room ID

*/
function removeChatroom(room)
{

}

/*
7. Search users
	a) Returns the list of users
*/
function searchUsers()
{
	
}

/*
8. Send message (to current room)
	a) pushes to current room
*/
function sendMessage(user, message, emotion)
{
	firebase_ref.off();
	console.log("Current room = ", currentRoom);
	roomlist_ref = new Firebase("https://emomix.firebaseio.com/roomlist/" + currentRoom);
	roomlist_ref.child("Meta").child("count").once("value", function(snapshot)
	{
		var count = snapshot.val();
		count++;
		roomlist_ref.child("Meta").child("count").set(count);
		roomlist_ref.child("Messages").push({
					name: user,
					message: message,
					emotion: emotion,
					date: new Date().getTime()
				}
		);
	});
}
function loadcontent() {

  var opening = document.getElementById('roombar');
  var side = document.getElementById('userbar');
  var main = document.getElementById('mainpage');
  var ucontent = 'userbar<br \>User 1 - in chatroom<br \>User 2 - in chatroom<br \>User 3 - in chatroom<br \>User 1 - in chatroom<br \>User 2 - in chatroom<br \>User 3 - in chatroom<br \>User 1 - in chatroom<br \>User 2 - in chatroom<br \>User 3 - in chatroom<br \>';
  var rcontent = 'roombar<br \>Room 1 - not empty -<button type="button" class="btn">Enter</button><br \>Room 2 - empty -<button type="button" class="btn">Enter</button><br \>Room 3 - in chatroom<br \>';
  var mcontent = 'Mainpage';


  userbar.innerHTML = ucontent;
  roombar.innerHTML = rcontent;
  mainpage.innerHTML = mcontent;

  // RESET COUNTERS
  content = '';
  counter = 0;




}

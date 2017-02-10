function checkmessage() {

  // check validity of message before POST

  var string = document.getElementsById("chat");
  var len = string.length;
  const MAXLEN = 1024;

  if (len < 1) {
    // send error to user
  }
  else if (len > MAXLEN) {
    // send error to user
  }
  else {
    // POST message here
  }


}

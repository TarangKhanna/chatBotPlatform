function checkMessage() {

  // check validity of message before POST

  var string =  $("#chat")[0].value; //document.getElementsById("chat");
  var len = string.length;
  const MAXLEN = 1024;

  alert("String: " + string + "\nLength: " + len);

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

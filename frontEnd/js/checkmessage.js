function checkMessage() {

  // check validity of message before POST

  var string =  $("#chat")[0].value; //document.getElementsById("chat");
  var len = string.length;
  const MAXLEN = 1024;

  alert("String: " + string + "\nLength: " + len);

  if (len < 1) {
    // send error to user
    alert("Your message does not seem to contain anything.\nPlease enter a message to send.");
  }
  else if (len > MAXLEN) {
    // send error to user
    alert("Your message seems to contain too much.\nPlease enter a shorter message to send.");
  }
  else {
    // POST message here
  }


}

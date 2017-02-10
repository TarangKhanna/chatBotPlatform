$(document).ready(function(){
  //alert("here");
})

function login(){
  var uname = $('#loginUsername')[0].value;
  var pswd = $('#loginPassword')[0].value;

}

function guestSignin(){
  var info = $('#guestUsername')[0].value;

}

function signUp(){
  var uname = $("#username")[0].value;
  var email = $("#email")[0].value;
  var pswd = $("#pswd")[0].value;
}

function forgotPswd(){

}

function createAcct(){
  window.location.href = "account.html";
}

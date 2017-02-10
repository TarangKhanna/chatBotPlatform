// $(document).ready(function() {
//
// })



function login() {
    var uname = $('#loginUsername')[0].value;
    var pswd = $('#loginPassword')[0].value;

    // do login things here

    window.location.href = "chathub.html";
}

function guestSignin() {
    var info = $('#guestUsername')[0].value;

    // do sign in things here

    window.location.href = "chathub.html";
}

function signUp() {
    var uname = $("#username")[0].value;
    var email = $("#email")[0].value;
    var pswd = $("#pswd")[0].value;

    // do signup things

    window.location.href = "chathub.html";
}

function forgotPswd() {
    window.location.href = "forgot.html";
}

function recover() {
    var email = $("#email")[0].value;
}

function createAcct() {
    window.location.href = "account.html";
}

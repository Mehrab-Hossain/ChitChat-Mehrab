const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");
const activeChat = document.getElementById("123");
const boxChat = document.getElementById("chatbox");
const backArrow = document.getElementById("back-arrow");

const bt1 = document.getElementById("bt1");
const bt2 = document.getElementById("bt2");

const formSignup = document.getElementById("form-mb-signup");
const formSignIn = document.getElementById("form-mb-signin");

console.log("x1");
if (signUpButton) {
  signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
    console.log("x");
  });
}
if (signInButton) {
  signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
  });
}

if (bt1) {
  bt1.addEventListener("click", () => {
    bt2.classList.remove("active-bt");
    bt1.classList.add("active-bt");
    formSignIn.classList.remove("in-active-form");
    formSignup.classList.add("in-active-form");
  });
}
if (bt2) {
  bt2.addEventListener("click", () => {
    bt1.classList.remove("active-bt");
    bt2.classList.add("active-bt");

    formSignup.classList.remove("in-active-form");
    formSignIn.classList.add("in-active-form");
  });
}
if (activeChat) {
  activeChat.addEventListener("click", () => {
    console.log("hello");
    //boxChat.classList.add("active-chatbox");
    console.log(document.documentElement.clientWidth);
    boxChat.style.display = "block";
  });
}
if (backArrow) {
  backArrow.addEventListener("click", () => {
    console.log("hello");
    //boxChat.classList.add("active-chatbox");
    boxChat.style.display = "none";
  });
}

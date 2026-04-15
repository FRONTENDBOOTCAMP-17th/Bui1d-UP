document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn").addEventListener("click", () => {
    window.location.href = "../account/login/login.html";
  });

  document.getElementById("signupBtn").addEventListener("click", () => {
    window.location.href = "../account/signup/signup.html";
  });

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "./";
  });
});

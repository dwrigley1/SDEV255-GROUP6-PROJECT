console.log("script .js loaded") // debug statement

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}`);
    if (!response.ok) {
        throw new Error(response.status);
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      console.log("Login success:", data.token);
      window.location.href = "https://dwrigley1.github.io/SDEV255-GROUP6-PROJECT/index.html";
    })
  });
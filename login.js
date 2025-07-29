// pretty much just pulled the login functionality from a previous version of script.js & 
// added it to this login.js file
// login.html -> login.js ; index.html -> script.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.warn("Login form not found");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}`);
      if (!response.ok) {
        alert("Login failed, try again.");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Login error:", err);
      alert("Unknown Failure");
    }
  });
});

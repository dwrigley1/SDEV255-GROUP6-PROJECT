console.log("script .js loaded")

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.error("Login form not found");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}`);
      if (!response.ok) {
        throw new Error("Login failed with status " + response.status);
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      console.log("Login success:", data.token);

      window.location.href = "https://dwrigley1.github.io/SDEV255-GROUP6-PROJECT/index.html";

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + err.message);
    }
  });
});


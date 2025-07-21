/* This is the script that will actually connect the login button to the backend */

// new async function //

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}`);
  if (!response.ok) {
      throw new Error("Login failed with status " + response.status);
    }
    const data = await response.json();
    console.log("Login success:", data);
  });
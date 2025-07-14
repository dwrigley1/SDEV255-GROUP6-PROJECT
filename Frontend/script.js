document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}`)
    .then(res => res.json())
    .then(data => {
      console.log("Login success:", data);
    })
    .catch(err => {
      console.error("Login failed:", err);
    });
});
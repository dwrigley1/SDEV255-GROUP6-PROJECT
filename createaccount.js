document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const user = {
      first_name: document.querySelector("#fname").value,
      last_name: document.querySelector("#lname").value,
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value,
      role: document.querySelector("#role").value,
    };

    try {
      const response = await fetch("https://sdev255-group6-project.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert("Account successfully created!");
        window.location.href = "login.html";
      } else {
        const err = await response.text(); // or .json() depending on backend
        console.error("Backend error:", err);
        alert("Unsuccessful :'( ");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("If you're seeing this, something broke :( ");
    }
  });
});


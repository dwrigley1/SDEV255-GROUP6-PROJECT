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
      const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/${email}/${password}/${first_name}/${last_name}/${role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Account successfully created!");
      } else {
        const err = await response.json();
        alert("Unable to create account - " + err.message);
      }
    }
  );
});

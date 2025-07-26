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

    const url = `https://sdev255-group6-project.onrender.com/api/login/${user.first_name}/${user.last_name}/${user.email}/${user.password}/${user.role}`;

    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert("Account successfully created!");
      } else {
        const errText = await response.text();
        console.error("Server error:", errText);
        alert("Unsuccessful");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("If you're seeing this, something is broken :(");
    }
  });
});



/**
 * 
 * ${fname}/${lname}/${email}/${password}/${role} 
 const user = {
      first_name: document.querySelector("#fname").value,
      last_name: document.querySelector("#lname").value,
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value,
      role: document.querySelector("#role").value,
    };
    **/
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const fname = document.querySelector("#fname").value;
    const lname = document.querySelector("#lname").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const role = document.querySelector("#role").value;

    const user = {
      first_name: fname,
      last_name: lname,
      email: email,
      password: password,
      role: role,
    };
    
      const response = await fetch(`https://sdev255-group6-project.onrender.com/api/login/`, {
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
console.log("script.js loaded"); // debugging

if (typeof CryptoJS === "undefined") {
  alert("CryptoJS failure."); // debugging
}

let role = "student"; // default fallback
let creatorId = null;

window.onload = async function () {
  const token = localStorage.getItem("token");

// changing frontend to match backend

  if (!token) {
    console.warn("No token found — redirecting to login");
    //window.location.href = "login.html"; // commented out, possible infinite loop
    return;
  }

  try {
    const user = parseToken(token);
    role = user.role;
    creatorId = user.id;
  } catch (err) {
    console.error("Token decryption failed", err);
    alert("Your session is invalid. Please log in again.");
    localStorage.removeItem("token");
    if (!window.location.href.includes("login.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  if (role === "teacher") {
    showTeacherUI();

    const form = document.getElementById("createCourseForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const course = {
          name: document.getElementById("name").value,
          subject: document.getElementById("subject").value,
          credits: document.getElementById("credits").value,
          description: document.getElementById("description").value,
          token:token
        };

        try { 
          const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(course),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`POST failed: ${response.status}`, errorText);
            return;
          }

          console.log("Course successfully created");
          location.reload();
        } catch (err) {
          console.error("Fetch crashed:", err);
        }
      });
    }
  } else {
    showStudentUI();
  }

  const courseSection = document.getElementById("courseSection");
  const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/0");
  const courses = await response.json();

  courses.forEach(course => {
    const card = renderCourseCard(course, role);
    courseSection.appendChild(card);
  });
};

function parseToken(token) {
  console.log("parse token function triggered");
  const bytes = CryptoJS.AES.decrypt(token, "dakota_hulk_fingus");
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  const obj = Object.fromEntries(decrypted.split(",").map(p => p.split(":")));
  return obj;
}

function addToCart(courseName) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(courseName);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(courseName + ' added to shopping cart!');
}

function showTeacherUI() {
  document.getElementById("teacherControls").style.display = "block";
}

function showStudentUI() {
  document.getElementById("teacherControls").style.display = "none";
}

function renderCourseCard(course, role) {
  const card = document.createElement("div");
  card.className = "course-card";

  const header = document.createElement("h4");
  header.textContent = `${course.id} - ${course.subject} - ${course.credits} Credit Hours`;

  const prereqElem = document.createElement("div");
  if (course.prerequisites) {
    prereqElem.innerHTML = `<h4>Prerequisites - ${course.prerequisites}</h4>`;
  }

  const desc = document.createElement("p");
  desc.textContent = course.description;

  card.appendChild(header);
  card.appendChild(prereqElem);
  card.appendChild(desc);

  if (role === "student") {
    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.onclick = () => addToCart(`${course.id} - ${course.subject}`);
    card.appendChild(btn);
  } else if (role === "teacher") {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteCourse(course.id);

    card.appendChild(editBtn);
    card.appendChild(delBtn);
  }

  return card;
}

async function deleteCourse(courseId) {
  const token = localStorage.getItem("token");
  if (!confirm("Delete course?")) return;
  await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${token}/${courseId}`, {
    method: "DELETE"
  });
  location.reload();
}
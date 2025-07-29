let role = "student"; // default fallback
let creatorId = null;
const user_id = sessionStorage.getItem("user_id"); // new const variable

window.onload = async function () {
  const token = localStorage.getItem("token");

  try {
    const user = parseToken(token);
    role = user.role;
    creatorId = user.id;
  } catch (err) {
    console.error("Token decryption failed", err);
    alert("token issue");
    localStorage.removeItem("token");
    if (!window.location.href.includes("login.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  if (role === "teacher") showTeacherUI();
  document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#addBtn").addEventListener("click", addCourse);
  document.querySelector("#deleteBtn").addEventListener("click", deleteCourse);
  document.querySelector("#editBtn").addEventListener("click", editCourse);
});

const user_id = sessionStorage.getItem("user_id"); // new const variable


// add a course //
async function addCourse(){
    const course = {
        courseId: document.querySelector("#courseId").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#creditHours").value,
        description: document.querySelector("#description").value,
        creator_id: user_id
    }
    
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${user_id}`,{
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(course)
    })
    if(response.ok){
        const results = await response.json()
        alert("Added course" + results._id)
        document.querySelector("form").reset() // reset the form after adding a course
    }
    else{
        document.querySelector("#error").innerHTML = "Cannot add course" // alerts the user of an error
    }
}

// delete a course //
async function deleteCourse(){
    const course = {
        courseId: document.querySelector("#courseId").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#creditHours").value,
        description: document.querySelector("#description").value,
        creator_id: user_id
    }
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${course.courseId}`,{
        method: "DELETE",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(course)
    })
    if(response.ok){
        const results = await response.json()
        alert("Deleted course" + results._id)
        document.querySelector("form").reset() // resets form after deletion
    }
    else{
        document.querySelector("#error").innerHTML = "Cannot delete course" // error alert to user
    }
}

//edit a course //
async function editCourse(){
    const course = {
        courseId: document.querySelector("#courseId").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#creditHours").value,
        description: document.querySelector("#description").value,
        creator_id: user_id
    }
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${course.courseId}/${user_id}`,{
        method: "PUT",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(course)
    })
    if(response.ok){
        const results = await response.json()
        alert("Edited course" + results._id)
        document.querySelector("form").reset()
    }
    else if(!ok.response){
        document.querySelector("#error").innerHTML = "Cannot edit course"
    }
    else showStudentUI();
}
  

  const courseSection = document.getElementById("courseSection");
  const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/0");
  const courses = await response.json();

  courses.forEach(course => {
    const card = renderCourseCard(course, role);
    courseSection.appendChild(card);
  });

  const form = document.getElementById("createCourseForm");
  if (form && role === "teacher") {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const course = {
        courseId: document.getElementById("courseId").value,
        subject: document.getElementById("subject").value,
        creditHours: document.getElementById("creditHours").value,
        prerequisites: document.getElementById("prerequisites").value,
        description: document.getElementById("description").value,
      };

      await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });

      location.reload();
    });
  }
};

function parseToken(token) {
  console.log("parse token function triggered"); // debugging
  const bytes = CryptoJS.AES.decrypt(token, "dakota_hulk_fingus");
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  const obj = Object.fromEntries(decrypted.split(",").map(p => p.split(":")));
  return obj;
}

function addToCart(courseName) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(courseName);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(courseName + ' added to cart!');
}

function showTeacherUI() {
  document.getElementById("teacherControls").style.display = "block";
} // teacher interface

function showStudentUI() {
  document.getElementById("teacherControls").style.display = "none";
} // student interface

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
  if (!confirm(" Delete Course?")) return;
  await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${token}/${courseId}`, {
    method: "DELETE"
  });
  location.reload();
}

if (typeof CryptoJS === "undefined") {
  alert("CryptoJS failed to load."); // debugging
}

var role; // global var due to redeclaration issues
let creatorId = null;

window.onload = async function () {
  const token = localStorage.getItem("token");
  console.log("Logged in as a ", role); // debugging

  if (!token) {
    console.warn("No token found");
    return;
  }

  try {
    const user = parseToken(token);
    role = user.role;
    creatorId = user.id;

    if (role === "teacher") { // redirects teacher users to createcourse.html 
      window.location.href = "createcourse.html";
      return;
    }
  } catch (err) {
    console.error("Token decryption failed:", err);
    alert("Invalid session. Please log in again.");
    localStorage.removeItem("token");
    return;
  }

  // load specific UI based on role
  if (role === "teacher") {
    showTeacherUI();
  } else {
    showStudentUI();
  }

  // Load courses
  const courseSection = document.getElementById("courseSection");
  try {
    const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/");
    const courses = await response.json();

    courses.forEach(course => {
      const card = renderCourseCard(course, role);
      courseSection.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading courses:", err);
  }
};

function parseToken(token) {
  if (!token) throw new Error("Missing token");
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
  const cartLink = document.getElementById("shoppingCartLink");
  if (cartLink) cartLink.style.display = "none";

  const editLink = document.getElementById("courseEditLink");
  if (editLink) editLink.style.display = "inline";

  const teacherControls = document.getElementById("teacherControls");
  if (teacherControls) teacherControls.style.display = "block";
}

function showStudentUI() {
  const cartLink = document.getElementById("shoppingCartLink");
  if (cartLink) cartLink.style.display = "inline";

  const editLink = document.getElementById("courseEditLink");
  if (editLink) editLink.style.display = "none";

  const teacherControls = document.getElementById("teacherControls");
  if (teacherControls) teacherControls.style.display = "none";
}

function renderCourseCard(course, role) {
  const card = document.createElement("div");
  card.className = "course-card";

  const header = document.createElement("h4");
  header.textContent = `${course.name} - ${course.credits} Credit Hours`; // ✅ Use `name`, not `id` or `subject`

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
    btn.onclick = () => addToCart(course.name); // course.name
    card.appendChild(btn);
  } else if (role === "teacher") {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    
    // edit courses...???

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteCourse(course._id); // _id for deletion

    card.appendChild(editBtn);
    card.appendChild(delBtn);
  }

  return card;
}


async function deleteCourse(courseId) {
  const token = localStorage.getItem("token");
  if (!confirm("Delete course?")) return;

  try {
    await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${token}/${courseId}`, {
      method: "DELETE"
    });
    location.reload();
  } catch (err) {
    console.error("Failed to delete course:", err);
  }
}

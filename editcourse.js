document.addEventListener("DOMContentLoaded", () => {
  loadCourses();
  document.getElementById("courseSelect").addEventListener("change", populateForm);
  document.getElementById("updateBtn").addEventListener("click", updateCourse);
});

let courseList = [];

async function loadCourses() {
  const select = document.getElementById("courseSelect");
  select.innerHTML = `<option value="">Select a course</option>`;

  try {
    const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/");
    courseList = await response.json();

    courseList.forEach(course => {
      const option = document.createElement("option");
      option.value = course._id;
      option.textContent = course.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load courses:", err);
    select.innerHTML = `<option value="">Error loading courses</option>`;
  }
}

function populateForm() {
  const courseId = document.getElementById("courseSelect").value;
  const selected = courseList.find(c => c._id === courseId);

  if (!selected) return;

  document.getElementById("courseId").value = selected._id;
  document.getElementById("name").value = selected.name;
  document.getElementById("subject").value = selected.subject;
  document.getElementById("credits").value = selected.credits;
  document.getElementById("description").value = selected.description;
}

async function updateCourse() {
  const courseId = document.getElementById("courseId").value;
  const token = localStorage.getItem("token");

  if (!courseId || !token) {
    document.getElementById("error").textContent = "Missing token or course ID.";
    return;
  }

  const courseChanges = {
    name: document.getElementById("name").value,
    subject: document.getElementById("subject").value,
    credits: document.getElementById("credits").value,
    description: document.getElementById("description").value
  };

  try {
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, courseChanges })
    });

    if (response.ok) {
      alert("Course updated successfully!");
    } else {
      const errorText = await response.text();
      console.error("Update failed:", errorText);
      document.getElementById("error").textContent = "Failed to update course.";
    }
  } catch (err) {
    console.error("Error updating course:", err);
    document.getElementById("error").textContent = "Error updating course.";
  }
}

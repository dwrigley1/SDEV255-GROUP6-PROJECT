document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");

  if (!courseId) {
    document.getElementById("error").textContent = "Missing course ID.";
    return;
  }

  document.getElementById("courseId").value = courseId;
  loadCourse(courseId);

  document.getElementById("updateBtn").addEventListener("click", () => updateCourse(courseId));
});

async function loadCourse(id) {
  try {
    const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/");
    const courses = await response.json();
    const course = courses.find(c => c._id === id);

    if (!course) {
      document.getElementById("error").textContent = "Course not found.";
      return;
    }

    document.getElementById("name").value = course.name;
    document.getElementById("subject").value = course.subject;
    document.getElementById("credits").value = course.credits;
    document.getElementById("description").value = course.description;
  } catch (err) {
    console.error("Error loading course:", err);
    document.getElementById("error").textContent = "Error loading course.";
  }
}

async function updateCourse(courseId) {
  const token = localStorage.getItem("token");

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
      alert("Course updated!");
      window.location.href = "index.html";
    } else {
      const error = await response.text();
      console.error("Update failed:", error);
      document.getElementById("error").textContent = "Failed to update course.";
    }
  } catch (err) {
    console.error("Update error:", err);
    document.getElementById("error").textContent = "Error updating course.";
  }
}

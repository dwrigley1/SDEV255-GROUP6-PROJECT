document.addEventListener("DOMContentLoaded", () => {
  loadCourses();
  document.getElementById("deleteBtn").addEventListener("click", deleteSelectedCourse);
});

async function loadCourses() {
  const dropdown = document.getElementById("courseDropdown");
  dropdown.innerHTML = `<option value="">Select a course</option>`;

  try {
    const response = await fetch("https://sdev255-group6-project.onrender.com/api/courses/");
    const courses = await response.json();

    courses.forEach(course => {
      const option = document.createElement("option");
      option.value = course._id;
      option.textContent = `${course.name} (${course.credits} credits)`;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load courses:", err);
    dropdown.innerHTML = `<option value="">Failed to load courses</option>`;
  }
}

async function deleteSelectedCourse() {
  const courseId = document.getElementById("courseDropdown").value;
  const token = localStorage.getItem("token");

  if (!courseId) {
    document.getElementById("error").textContent = "Please select a course.";
    return;
  }

  if (!confirm("Are you sure you want to delete this course?")) return;

  try {
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      alert("Course deleted.");
      loadCourses(); // reload the dropdown
    } else {
      const errorText = await response.text();
      console.error("Delete failed:", errorText);
      document.getElementById("error").textContent = "Failed to delete course.";
    }
  } catch (err) {
    console.error("Error deleting course:", err);
    document.getElementById("error").textContent = "Error deleting course.";
  }
}

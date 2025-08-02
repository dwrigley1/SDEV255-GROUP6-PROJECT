document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#addBtn").addEventListener("click", addCourse);
  document.querySelector("#deleteBtn").addEventListener("click", deleteCourse);
  document.querySelector("#editBtn").addEventListener("click", editCourse);
});


// add a course //
async function addCourse(){
    const token = localStorage.getItem("token"); // need to pass token for auth purposes
    const course = {
        name: document.querySelector("#name").value,
        subject: document.querySelector("#subject").value,
        credits: document.querySelector("#credits").value,
        description: document.querySelector("#description").value,
        token
    }

    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(course)
    });

    if (response.ok) {
        alert("Added course!");
        document.querySelector("form").reset();
    } else {
        document.querySelector("#error").innerHTML = "Cannot add course";
    }
}

// Delete a course by ID
async function deleteCourse() {
    const token = localStorage.getItem("token"); // need to pass token for auth purposes

  if (!confirm("Are you sure you want to delete this course?")) return;

  const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({token})
  });

  if (response.ok) {
    alert("Course deleted successfully!");
    document.querySelector("form").reset();
  } else {
    document.querySelector("#error").innerHTML = "Cannot delete course.";
  }
}

// Edit a course by ID
async function editCourse() {
  const _id = document.querySelector("#courseId").value;
  
  const courseChanges = {
    name: document.querySelector("#name").value,
    subject: document.querySelector("#subject").value,
    credits: document.querySelector("#credits").value,
    description: document.querySelector("#description").value
  };

  const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token, courseChanges })
  });

  if (response.ok) {
    alert("Course updated successfully!");
    document.querySelector("form").reset();
  } else {
    document.querySelector("#error").innerHTML = "Cannot edit course.";
  }
}
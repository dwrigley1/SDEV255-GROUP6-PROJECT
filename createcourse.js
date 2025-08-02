document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#addBtn").addEventListener("click", addCourse);
  document.querySelector("#deleteBtn").addEventListener("click", deleteCourse);
  document.querySelector("#editBtn").addEventListener("click", editCourse);
});

// const user_id = sessionStorage.getItem("user_id"); // new const variable
const _id = localStorage.getItem("token"); // need to pass token for auth purposes
//const creator_id = creator_id



// add a course //
async function addCourse(){
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
        body: JSON.stringify(token, course)
    });

    if (response.ok) {
        alert("Added course!");
        document.querySelector("form").reset();
    } else {
        document.querySelector("#error").innerHTML = "Cannot add course";
    }
}

// Delete a course by ID
// ${courseId}
async function deleteCourse() {
  const courseId = document.querySelector("#courseId").value;

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
  const courseId = document.querySelector("#courseId").value;

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
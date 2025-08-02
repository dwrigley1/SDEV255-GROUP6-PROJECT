document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#addBtn").addEventListener("click", addCourse);
  document.querySelector("#deleteBtn").addEventListener("click", deleteCourse);
  document.querySelector("#editBtn").addEventListener("click", editCourse);
});

// const user_id = sessionStorage.getItem("user_id"); // new const variable
const token = localStorage.getItem("token"); // need to pass token for auth purposes



// add a course //
// creator_id: user_id
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
        body: JSON.stringify(course)
    });

    if (response.ok) {
        alert("Added course!");
        document.querySelector("form").reset();
    } else {
        document.querySelector("#error").innerHTML = "Cannot add course";
    }
}

// delete a course //
async function deleteCourse(){
    const courseId = document.querySelector("#courseId").value;
    const course = {
        courseId: document.querySelector("#name").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#credits").value,
        description: document.querySelector("#description").value,
        creator_id: user_id
    }
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${course.courseId}`,{
        method: "DELETE",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({token})
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
    const courseId = document.querySelector("#courseId").value;
    const courseChanges = {
        courseId: document.querySelector("#name").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#credits").value,
        description: document.querySelector("#description").value,
        creator_id: user_id
    }
    const response = await fetch(`https://sdev255-group6-project.onrender.com/api/courses/${course.courseId}/${user_id}`,{
        method: "PUT",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({token, courseChanges})
    })
    if(response.ok){
        const results = await response.json()
        alert("Edited course" + results._id)
        document.querySelector("form").reset()
    }
    else{
        document.querySelector("#error").innerHTML = "Cannot edit course"
    }
}


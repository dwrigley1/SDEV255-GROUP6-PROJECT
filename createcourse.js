document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#addBtn").addEventListener("click", addCourse);
  document.querySelector("#deleteBtn").addEventListener("click", deleteCourse);
  document.querySelector("#editBtn").addEventListener("click", editCourse);
});

const user_id = sessionStorage.getItem("user_id"); // new const variable


// add a course //
async function addCourse(){
    const course = {
        courseId: document.querySelector("#name").value,
        subject: document.querySelector("#subject").value,
        creditHours: document.querySelector("#credits").value,
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
        body: JSON.stringify(course)
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


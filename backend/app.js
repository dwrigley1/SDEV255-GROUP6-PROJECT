//Requirements
const express = require("express");
var cors= require('cors');
const app = express();
app.use(express.json())
app.use(cors());
const router = express.Router();






//login and validation
router.get('/login/:username/:password',function(req,res){
   const {username,password} = req.params
    try{
    //select  DB for usernames where theres a match


    
    let result = "Student" // result will fetch and return the accesslevel of user 
    res.send(`Username: ${username},Password: ${password}, \n Exists as ${result}`)
    }
    catch(e){
    
        console.log(e)
        res.sendStatus(404)
    
    }
});


//create user

router.post('/create/:teacherID/:username/:password',function(req,res){
   const {teacherID,username,password} = req.params
    try{
    //insert into DB



    res.send(`Username: ${username},Password: ${password}, \n created by ${teacherID}`)
    
}
    catch(e){
    
        console.log(e)
        res.sendStatus(404)
    
    }
});




//courses
router.get('/courses/:userName',function(req,res){
    const {userName}= req.params;
    try{
        //login function checking db

        let result = "Nothing atm"// this will be fetching from db and checking what user left to complete
        res.json(`Courses:${result}`);

    }catch(e){
        console.log(e)
        res.sendStatus(404)

    }
});

router.put('/courses/:userName',function(req,res){
    const completedCourses = req.body

    try{
        //inserts completed courses to user
        console.log(completedCourses)
        res.send(200)
    }catch(e){
        console.log(e)
        res.send(403)

    }
})







//cart

router.post('/cart/:userName/:orderNum/:courseID',function(req,res){
    const {userName,orderNum,courseID}= req.params
    
    try{
        //create cart


        //Example of how it would work
        let cart = {Courses:[]}
        //add to cart
        cart.Courses.push(`${courseID}`);
        //returns json of current cart
        res.json({username:`${userName}`, orderNum: `${orderNum}`, Cart:`${cart["Courses"]}`})

    }catch(e){
        res.send(`Massive error ${e}`)


    }
})


router.get('/cart/:username/:orderNum',function(req,res){
    const {userName,orderNum} = req.params
    try{
    let result = "result of parsing"//Fetch orderNum
    res.json({result:`${result}`})
    }catch(e){
        console.log(e)
        res.sendStatus(404)

    }
})


router.put('/cart/:userName/:orderNum',function(req,res){
    const {userName,orderNum} = req.params
    const data = req.body
    try{
        
     
            
        for (let i=0;i++;data.length){
        if (Object.keys(data)[i] in columns){
            column_key = Object.values(data)
            
        }}

        console.log(Object.keys(data))
        res.send(data)
        
        
    }catch(e){
        console.log(e)
        res.sendStatus(403)


    }
})



router.delete('/cart/:username/:orderNum',function(req,res){
    const {userName,orderNum} = req.params
    try{



    }catch(e){
        console.log(e)
        res.sendStatus(403)

    }
})






app.use("/api",router)
app.listen(3000)
//backend logic requirements for stage 2 – A login system should be implemented
// – Authorization should be differentiated between students and teachers
// Teachers should be able to add and drop courses to the available classes listing
// Students should be able to add courses to their schedule
// Students should be able to drop classes from their schedule



//Requirements
const CryptoJS = require("crypto-js"); 
const mongoose = require("mongoose");
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
var cors= require('cors');
const path =require('path');
const fs = require('fs').promises;
const fsb = require('fs');
const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');
const axios = require('axios');
const { env } = require("process");
require('dotenv').config();

//Load env

const SECRET_KEY = process.env.SECRET_KEY
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

console.log("Secret Key: "+SECRET_KEY)
 
console.log(CLIENT_ID);
console.log(CLIENT_SECRET);
console.log(REDIRECT_URL)


//middleware
const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost',
    'https://dwrigley1.github.io/SDEV255-GROUP6-PROJECT',
    'https://dwrigley1.github.io',
    'https://sdev255-group6-project.onrender.com',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.static("backend"))
app.use(session({
    secret:'secret-key',
    resave:false,
    saveUninitialized:true
}))
const router = express.Router();

//DB
const connecttoDB = require("./DB/db");
const { User, Course , Cart, Enrollment} = require("./DB/models");
connecttoDB()

//checks if fb exists





//OAuth
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// Get user information
async function getUserInfo(accessToken) {
  const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}


router.get('/test_page', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
}); 

//Call this when validating 
router.get('/auth/google', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
  
  res.redirect(authUrl);
});
 
router.get('/session', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);

    req.session.tokens = tokens;
    const userInfo = await getUserInfo(tokens.access_token);
    req.session.user = userInfo;
    console.log(req.session.user)
    res.json(req.session)

    //This is what the json looks like of a validated user

        //     {
        //   "cookie": {
        //     "originalMaxAge": null,
        //     "expires": null,
        //     "httpOnly": true,
        //     "path": "/"
        //   },
        //   "tokens": {
        //     "access_token": "#",
        //     "refresh_token": "#",
        //     "scope": "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        //     "token_type": "Bearer",
        //     "id_token": "#",
        //     "expiry_date": 1752793881082
        //   },
        //   "user": {
        //     "sub": "#",
        //     "name": "Sky Savage",
        //     "given_name": "Sky",
        //     "family_name": "Savage",
        //     "picture": "https://lh3.googleusercontent.com/a/ACg8ocIhzMIA1ACzAzNiU1dwYX5KYAN2v4ELpCxj0foMSW22fmh-0Q=s96-c",
        //     "email": "skysavage55@gmail.com",
        //     "email_verified": true
        //   }
        // }



    // this is the redirect back to page
    //res.redirect('/index');
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).send('Authentication failed');
  }
});




//end of Oauth




//auth
router.post("/auth/:minAuth", async function(req,res)
    {
        try
            {
                console.log("user Attempting to be authenticated")
                const{minAuth} = req.params
                
                if(minAuth == "student" ||minAuth =="teacher")
                    {
                        console.log("minimum auth is "+minAuth)
                        const bytes = CryptoJS.AES.decrypt(req.body.token, SECRET_KEY);
                        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                        //comment out before submitting
                        console.log("Decrypted Token:", decryptedToken);
                        //
                        const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                        const{id,email,password,role} = (new_params)
                        if(!id || !email || !password ||!role)
                            {
                                console.log("Missing info in token")
                                res.status(503).send({error:"Missing id/email/password/role"})
                                return
                            }
                        else
                            {
                                const queryUser = await User.findOne({email:email})
                                
                                    
                                    if(!queryUser)
                                        {
                                            res.status(501).send({error:err})
                                            return
                                        }
                                    else if(queryUser)
                                        {
                                            console.log("Queried user: "+JSON.stringify(queryUser))
                                            if(queryUser.role!=role)
                                                {
                                                    console.log(`DB role: ${queryUser.role} != Provided Role :${role}`)
                                                    res.status(400).send({error:"Dont lie"})
                                                    return
                                                }
                                            else if(minAuth=="teacher" && role!="teacher")
                                                {
                                                    console.log(`MinAuth :${minAuth} != Role: ${role}`)
                                                    res.status(500).send({auth:false})
                                                    return
                                                }
                                            else
                                                {
                                                    console.log(console.log(`MinAuth :${minAuth} != Role: ${role}`))
                                                    console.log(`User: ${id} is approved for content`)
                                                    res.status(200).send({auth:true})
                                                    return
                                                }
                                        }
                            }


                        

                    }else
                        {
                            console.log("URL param isnt student or teacher");
                            res.status(500).send("Url param isn't correct");
                            return;
                        }




            }
        catch(err)
            {
                console.log(err)
                res.status(500).send({error:err})
                return

            }
    })





//login and validation
router.get('/login/:email/:password',async function(req,res)
    {
        // how to decrypt the token
        // const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
        // const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        // console.log("Decrypted Token:", decryptedToken);
        
        const {email,password} = req.params
            try
                { 
                    
                    console.log(`${email}:${password}`)
                    const queryStmt = await User.findOne({email:email,password:password})
                        
                            console.log("Callback function for login querystatment is starting")
                            if (!queryStmt)
                                {
                                    console.log(`Oh man there was an error :${err}`)
                                    res.status(500).send({error:err})
                                    return
                                }
                            else if (queryStmt)
                                {
                                    completedQuery = JSON.stringify(queryStmt)
                                    console.log(`${JSON.stringify(queryStmt)} was found for ${queryStmt._id}`)
                                    const token = `id:${queryStmt._id},email:${queryStmt.email},password:${queryStmt.password},role:${queryStmt.role}`;
                                    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
                                    res.status(200).send({token:encryptedToken,role:queryStmt.role})
                                    return
                                }
                            else
                                { 
                                    console.log("Nothing was there")
                                    res.sendStatus(404)
                                    return
                                }    
                
            }
            catch(e)
                {
                    console.log(e)
                    res.status(500).send({error:e})
                    return
                }
    });




//create user

router.post('/login',async function(req,res)
    {
    
        const {email,password,first_name,last_name,role} = req.body
        // Example of how to format post request for creating user 
        // `       {
        //             
        //             "email":"fingus22@example.com",
        //             "password":"password1234",
        //             "first_name":"bill",
        //             "last_name":"burr",
        //              "role":"teacher"
        //         }`
            try
                {
                    //insert statment
                    console.log(`${email}:${password}:${first_name},${last_name} inserting into users`)
                    //const created_id = db.run("SELECT COUNT(id) From users")
                    const newUser = new User(
                        {
                            email:email,
                            password:password,
                            first_name:first_name,
                            last_name:last_name,
                            role:role
                        })
                    const createUser = await newUser.save()   
                    if (!createUser)
                        {
                            console.error("Error inserting user:",)
                            res.status(500).send({error:"Wasn't able to insert"})
                            return
                        }
                    else 
                        {
                            console.log("Success!")
                            res.sendStatus(200);
                            return
                        };         
                }
            catch(e)
                {
                    console.log(e)
                    res.sendStatus(404)
                    return
                }
    });

router.put('/login',async function(req,res)
    {
        const {token}= req.body
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        const changes = req.body
        // struture for puts are {column:value}
       console.log(changes)
        try
            {         
                console.log("User is being updated")
                const update = await User.updateOne({email:email,password:password},changes)   
                if(!update)
                    {
                        console.log("Error when updating check changes");
                        res.status(500).send("Error when updating check changes sent");
                        return;
                    }
                else
                    {
                        console.log("updated: "+ update);
                        console.log(`If it existed it changed`);
                        res.sendStatus(200);
                        return;
                            }
            }   
        catch(e)
            {
                console.log(e)
                res.status(500).send(e);
                return;
            }
    })

router.delete('/login',async function(req,res)
    {
        const {token} = req.body
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        try
            {
                const deleted = await User.deleteOne({email:email,password:password})
                
                    
                        if(!deleted)
                            {
                                console.log("User wasnt deleted")
                                res.status(500).send({error:"User wasn't deleted"})
                                return;
                            }
                        else if(deleted)
                            {
                                console.log("user deleted")
                                res.sendStatus(200);
                                return;
                            }    
                    
            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:e})
                return;
            }
    })




//courses

router.post('/courses',async function(req,res)
    {
        const {token}= req.body;
        console.log(token)
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        console.log(id,email+"Are present in token")
        //const queryStmt = db.prepare(`SELECT u.id FROM users as u WHERE u.id= ? AND u.role = teacher `)
        const {name, description, subject, credits} = req.body
        if(!name || !description ||!subject || !credits){res.status(500).send({"error":"Missing name/description/subject/credits"});return;}
        try
            {

                //checks if user is a teacher
                console.log("Checking if user is teacher now")
                const isTeacher = await User.findOne({email:email,password:password,role:"teacher"})
                    
                        //if not teacher
                        if(!isTeacher)
                            {
                                console.log("User didnt pass the check")
                                res.status(500).send({error:"Couldnt find user info that was of the teacher role."})
                                return;
                            }
                            //if teacher then creates course
                        else if(isTeacher)
                            {
                                console.log("User is teacher and now inserting into courses")
                                const createdCourse = await Course.insertOne({name:name, description:description, subject:subject, credits:credits,creator_id:id})
                                    if(!createdCourse)
                                        {
                                            console.log("Course wasnt created there was an error")
                                            res.status(500).send({error:"Course couldn't be created"})
                                            return;
                                        }
                                    else if (createdCourse)
                                        {
                                            console.log("Course successfully created: "+createdCourse._id)
                                            res.status(200).send({"Pass":"Yea"})
                                            return;
                                        }
                                
                            }    
                    
            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:err})
                return;
            }
    })


router.get('/courses/',async function(req,res)
    {
        
        try
            { 
                console.log("Starting /courses")
                //login function checking db
                const queryStmt= await Course.find({})
                    
                        console.log("Searched through potential courses")
                        if(!queryStmt)
                            {
                                console.log("couldnt find any courses")
                                res.status(500).send({error:"No courses with found with query"})
                                return
                            }
                        else if (queryStmt)
                            {
                                console.log("Sending all course queryStmts now")
                                res.status(200).send(queryStmt)
                                return
                            }
                        else
                            {
                                console.log("Nothing to seee here")
                                res.status(404).send("Nothing was found")
                                return
                            }
                    
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return;
            }
    });









router.post('/coursesList/',async function(req,res)
    {
        const {token}= req.body;
        console.log(token+ " for coursesList")
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        try
            { 
                //login function checking db
                console.log("returning all instances of userid in enrollment and returning classes now for :"+id)
                console.log("is id valid object id: "+mongoose.isValidObjectId(id))
                const EnrolledCourses = await Enrollment.aggregate([
                    {
                        $match:{"user_id":new mongoose.Types.ObjectId(id)}
                    },
                    {
                        $lookup: {
                        from: 'courses', // collection name in MongoDB
                        localField: 'course_id',
                        foreignField: '_id', 
                        as: 'CourseDetails'
                        }
                    },
                    {
                        $unwind: '$CourseDetails'
                    }
                    
                    ])
    
                    { 
                        if(!EnrolledCourses)
                            {
                                console.log("could get enrolled classes")
                                res.status(500).send({error:"Couldn't find enrolled classes"})
                                return
                            }
                        else if (EnrolledCourses)
                            {
                                console.log("Sending results:"+JSON.stringify(EnrolledCourses))
                                res.status(200).send(EnrolledCourses)
                                return
                            }
                        else
                            {
                                console.log("Nothing to seee here")
                                res.status(404).send({error:"Nothing was found for users"})
                                return
                            }
                    
            }}
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return;
            }
    });



router.put('/courses/:coursesID',function(req,res)
    {
        
        //coursesID put in the url 
        const {coursesID} = req.params
        const {token} = req.body
        console.log(token+ " for put for /courses")
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        
        //what will be changed goes here
        //assuming structure will be {column:value}
        const {courseChanges}= req.body;


        try
            {
                //update courses
                console.log("changes are being made right now to  courses")
                console.log(`Value: ${Object.values(courseChanges)[0]} \n ${coursesID}`)
                const updatedCourse = Course.updateOne({_id:coursesID})
                        if (!updatedCourse)
                            {
                                console.log("Couldn't update course")
                                res.status(500).send({error:err})
                                return
                            }
                        else if (updatedCourse)
                            {
                        
                                console.log("course updated")
                                res.send(200)
                                return
                            }
                    
            }
        catch(e)
            {
                console.log(e)
                res.send(403)
                return
            }
    })

 router.delete('/courses/:coursesID',async function(req,res)
    {
        const {coursesID} = req.params
        
        try
            {
                console.log("Deleting courseID")
                const deleteCourse = await Course.deleteOne({_id:coursesID})
                    
                if (!deleteCourse)
                    {
                        console.log("Couldn't delete course")
                        res.status(500).send({error:"Couldn't delete course"})
                        return
                    }
                else if (deleteCourse)
                    {
                        console.log("course has been deleted")
                        res.send(200)
                        return
                    }
                        

            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:e})
                return
            }
    })



router.get('/cart',async function(req,res)
    {
        
        

        try
            {
                //let result = "result of parsing"//Fetch orderNum
                console.log("getting cart with user_id and order_num now.")
                const item = await Cart.find({})
                if(!item)
                    {
                        console.log("couldnt find anything")
                        return res.sendStatus(500)
                    }
                else if(item)
                    {
                        console.log("Everything worked out amazing")
                        res.status(200).send(queryStmt)
                        return
                    }
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return
            }
    })


//cart
router.post('/cart',async function(req,res)
    {
        //coursesID are assumed to be taken in as array stuctured as {coursesID:["1","2"]}
        const {token,coursesID} = req.body
        console.log("creating cart with order num: "+orderNum)
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        
        try
            { 
                //create cart    
                let errors = []
                let inserted = 0
                console.log("trying to create order in /cart")
                for (const courseID of coursesID)
                    {
                        console.log(`coursesID elements :${courseID}`)
                        const createdCart = await Cart.insertOne({user_id:id,course_id:courseID})  
                        if (!createdCart)
                            {
                                console.log(`Error creating item`)
                                errors.push("err");
                            }
                        else if (createdCart)
                            {
                                console.log(courseID+" Sucessfully inserted")
                                inserted += 1;        
                            }
                    }     
                if (errors.length>0)
                    {
                        console.log(errors+" was the cause for issue")
                        return res.status(500).send({error:errors})
                    }
                else
                    {
                        console.log("Everything worked out just fine and cart was created")
                        return res.sendStatus(200)   
                    }
            }   
        catch(e)
            {
                console.log(e)
                return res.status(500).send({error:e})
            } 
    })


router.post('/getCart/:orderNum',async function(req,res)
    {
        const {orderNum} = req.params
        const {token} = req.body
        console.log("/getCart started by: "+token)
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        try
            {
                //let result = "result of parsing"//Fetch orderNum
                console.log("getting cart with user_id and order_num now.")
                const item = await Cart.find({user_id:id,order_num:orderNum})
                if(!item)
                    {
                        console.log("couldnt find anything")
                        return res.sendStatus(500)
                    }
                else if(item)
                    {
                        console.log("Everything worked out amazing")
                        res.status(200).send(queryStmt)
                        return
                    }
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return
            }
    })


router.put('/cart/:orderNum/:courseID',async function(req,res)
    {
        const {orderNum,courseID} = req.params
        const {token,changes} = req.body
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
      

        try
            {   
                console.log("Editing cart now with changes:" + JSON.stringify(changes))
                const updatedCart = await Cart.updateOne({_id:orderNum,course_id:courseID},changes)
                
                if(!updatedCart)
                    {
                        console.log("Updated didn't go through")
                         res.status(503).send({error:"errorloging changes"})
                         return;

                    }
                else if (updatedCart)
                    {
                        console.log("Cart should be updated");
                        res.sendStatus(200)
                        return;

                    }

            }   
        catch(e)
            {
                console.log(e)
                return res.status(500).send({errors:e})
            }
    })


router.delete('/cart/:orderNum',async function(req,res)
    {
        const {orderNum} = req.params
        const {token} = req.body
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
        try
            {
                console.log("Starting deletion of cart")
                const deletedCart = await Cart.deleteMany({_id:orderNum})
                    {
                        if(!deletedCart)
                            {
                                console.log(err)
                                //sends a json of the issue and a 500 status
                                res.status(500).send({error:err})
                                return
                            }
                        else if (deletedCart)
                            {
                                console.log("sucessfully done")
                                res.send(200)
                                return
                            }
                    
                    }
                }
    catch(e)
        {
            console.log(e)
            res.sendStatus(403)
            return
        }
})
 
//Enrollment
router.post("/enroll",async function(req,res)
// needs body params of {"user_id":"user_id_goes_here", "courseID":"courseID_goes_here"}
    {
        try
            {
                const {token,courseID} = req.body
                const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    } 
                if(!id|| !courseID){res.status(500).send({"Error":"Missing user_ID / courseID"});return}
                console.log("enrolling user now! of"+courseID+"for user "+id)
                const enroll = await Enrollment.insertOne({user_id:id,course_id:courseID})
                    
                        if(!enroll)
                            {
                                console.log("Couldnt enroll")
                                res.status(505).send("Couldnt enroll")
                                return
                            }
                        else
                            {
                                console.log("User is enrolled in the classes now")
                                res.status(200).send({"Status":"Success"})
                                return
                            }
                    
            }
        catch(err)
            {
                console.log(err)
                res.status(500).send(err)
                return
            }
        })



router.post("/checkEnroll",async function(req,res)
// Needs a body param of 
//    {user_id:"user_id_goes_here"}
    {
        try
            {
                const {token} = req.body
                const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
                console.log("checking enrollment now")
                const enrolled= await Enrollment.find({user_id:id})
                    
                if(!enrolled)
                    {
                        console.log("Error finding enrollment")
                        res.status(500).send("Error finding enrollment");
                        return
                    } 
                else if(enrolled)
                    {
                        console.log("Found classes that user is enrolled in")
                        res.status(200).send(enrolled)
                        return
                    }
                else
                    {
                        res.status(404).send("Nothing to see here")
                        return
                    }
                    
            }
        catch(err)
            {
                console.log(err)
                res.send(err)
                return
            }

    })


router.put("/enroll/:courseID",async function(req,res)
    {
        {
        //Any changes goes in the req.body
        const {courseID} = req.params
        const {token,changes} = req.body
        console.log("Changes:" +changes)
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }

                console.log("begining update")
                try
            { 
                const updateEnroll = await Enrollment.updateOne({user_id:id,course_id:courseID},changes)
                if(!updateEnroll)
                    {
                        console.log("couldn't update")
                        res.status(500).send({error:"Update didnt go through"})
                        return;
                    }
                else if (updateEnroll)
                    {
                        console.log("Updated course"+courseID)
                        res.sendStatus(200)
                        return;

                    }
        
          
            }   
        catch(e)
            {
                console.log(e)
            }
    }})



    
//Dont use yet
router.delete("/enroll",async function(req,res)
    {
        try
            {
                const {token,course_id} = req.body
                const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
                const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
                //Make sure to send as course_id

                console.log(`deleting ${id}: from Course_id${course_id}`)
                const deleteEnroll = await Enrollment.deleteOne({user_id:id,course_id:course_id})
                    {
                        if(!deleteEnroll)
                            {
                                console.log("couldnt delete")
                                res.status(500).send({error:"Couldnt delete"})
                                return
                            }
                        else if (deleteEnroll)
                            {
                                console.log("enrollment was deleted")
                                res.sendStatus(200)
                                return
                            }
                        }
                    
            }
        catch(err)
            {
                console.log(err)
                res.status(500).send(err)
                return
            }
    })



app.use("/api",router)

port = (process.env.PORT||3000)

app.listen(port,()=>{console.log(`Server running on ${port}`)})

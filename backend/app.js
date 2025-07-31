//backend logic requirements for stage 2 – A login system should be implemented
// – Authorization should be differentiated between students and teachers
// Teachers should be able to add and drop courses to the available classes listing
// Students should be able to add courses to their schedule
// Students should be able to drop classes from their schedule



//Requirements
const CryptoJS = require("crypto-js"); 
const crypto = require('crypto');
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
var cors= require('cors');
const path =require('path');
const fs = require('fs').promises;
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
const fp_db = './backend_db.db'
//checks if fb exists
if (fs.existsSync(fp_db)) {
  console.log('Database exists. Connecting...');
} else {
  console.log('Database does not exist. Creating a new one...');
}
//If error here delete out ,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
const db = new sqlite3.Database('./backend_db.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{if(err){console.log(err)}else{console.log("Connected to sqlite database")}})
const fp_schema = path.join(__dirname,"/DB/schema.sql")
const fp_seed = path.join(__dirname,"/DB/seed.sql")

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


//initialize DB Only call on startup
router.get("/initialize",async function(req,res)
    {
        try
            {
                
                const sql = await fs.readFile(fp_schema,"utf8");
                console.log("starting up schema")
                await new Promise((resolve,reject)=>
                    {
                        db.exec(sql,function(err)
                            {
                                if (err)
                                    {
                                        console.log(err)
                                        reject(err);
                                        
                                    }
                                else
                                    {
                                        console.log("resolved schema")
                                        resolve();
                                        
                                    }
                            })
                    
                    })
        console.log("Reading seed")
        const sql2 = await fs.readFile(fp_seed,"utf8");
        
        await new Promise((resolve,reject)=>
            {
                db.exec(sql2,function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                reject(err);
                                res.sendStatus(500)
                                return
                            }
                        else
                        {
                            console.log("resolving seed")
                            resolve();
                            console.log("db initialized")
                            res.sendStatus(200)
                            return
                        }
                    })
                // db.get("SELECT * FROM users",(err,rows)=>
                // {
                //     if(err)
                //     {
                //         console.log(`The error is here ${err}`)
                //     }
                //     else if (rows)
                //     {
                //         console.log(JSON.stringify(rows))
                //     }
                
                // })
            })
        } 
        catch(e)
        {
            console.log(e)
            res.sendStatus(500)
            return

        }



    })


//auth
router.post("/auth/:minAuth",function(req,res)
    {
        try
            {
                const{minAuth} = req.params.minAuth

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
                        const queryStmt = db.get('SELECT * FROM users WHERE email = ? AND password = ?',[email,password],function (err,row)
                        {
                            if(err)
                                {
                                    res.status(501).send({error:err})
                                    return
                                }
                            else if(row)
                                {
                                    if(row.role!=role)
                                        {
                                            console.log(`DB role: ${row.role} != Provided Role :${role}`)
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
                                            console.log(`${id} is approved for content`)
                                            res.status(200).send({auth:true})
                                            return
                                        }
                                }


                        })

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
router.get('/login/:email/:password',function(req,res)
    {
        // how to decrypt the token
        // const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
        // const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        // console.log("Decrypted Token:", decryptedToken);
        
        const {email,password} = req.params
            try
                { 
                    
                    console.log(`${email}:${password}`)
                    const queryStmt = db.get('SELECT * FROM users WHERE email = ? AND password = ?',[email,password],(err,row)=>
                        {
                            console.log("Callback function for login querystatment is starting")
                            if (err)
                                {
                                    console.log(`Oh man there was an error :${err}`)
                                    res.status(500).send({error:err})
                                    return
                                }
                            else if (row)
                                {
                                    console.log(`${JSON.stringify(row)} was found`)
                                    const token = `id:${row.id},email:${row.email},password:${row.password},role:${row.role}`;
                                    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
                                    res.status(200).send({token:encryptedToken,role:row.role})
                                    return
                                }
                            else
                                { 
                                    console.log("Nothing was there")
                                    res.sendStatus(404)
                                    return
                                }    
                    })
            }
            catch(e)
                {
                    console.log(e)
                    res.status(500).send({error:e})
                    return
                }
    });




//create user

router.post('/login',function(req,res)
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
                    const insertStmt = db.prepare('INSERT INTO users (email,password,first_name,last_name,role) values (?,?,?,?,?)')
                    insertStmt.run(email,password,first_name,last_name,role,function(err)
                        { 
                            if (err)
                                {
                                    console.error("Error inserting change:",err)
                                    res.status(500).send({error:err})
                                    return
                                }
                            else 
                                {
                                    console.log("Success!")
                                    res.sendStatus(200);
                                    return
                                };
                            //frees up reasources and commits
                            insertStmt.finalize();
                        })
                }
            catch(e)
                {
                    console.log(e)
                    res.sendStatus(404)
                    return
                }
    });

router.put('/login',function(req,res)
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
                let errors = []
                let updated = 0
                //console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i,Object.keys(changes)[i])
                        db.run(`UPDATE users SET ${Object.keys(changes)[i]}= ? WHERE email = ?`,[Object.values(changes)[i],email],(err)=>
                            { 
                                if(err)
                                    {
                                        console.log(err);
                                        res.status(500).send(err);
                                        return;
                                    }
                                else
                                    {
                                        console.log("test", updated)  
                                    }
                            })
                            
                    }
                console.log(`If it existed it changed`)
                res.sendStatus(200)
                return

            }   
        catch(e)
            {
                console.log(e)
                res.status(500).send(e);
                return;
            }
    })

router.delete('/login',function(req,res)
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
                db.run(`DELETE FROM users WHERE ID =?`,[id],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return;
                            }
                        else
                            {
                                console.log("user deleted")
                                res.sendStatus(200)
                                return
                            }    
                    })
            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:e})
                return;
            }
    })




//courses

router.post('/courses',function(req,res)
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
                db.run(`SELECT u.id FROM users as u WHERE u.id= ? AND u.role = "teacher" `,id,function(err)
                    {
                        //if not teacher
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return;
                            }
                            //if teacher then creates course
                        else
                            {
                                console.log("User is teacher and now inserting into courses")
                               const insertStmt= db.prepare('INSERT INTO courses ( name, description, subject, credits, creator_id) values (?,?,?,?,?)')
                                insertStmt.run( name, description, subject, credits, id,function(err)
                                {
                                    if(err)
                                        {
                                            console.log(err)
                                            res.status(500).send({error:err})
                                            return;
                                        }
                                    else
                                        {
                                            console.log("Course successfully created")
                                            res.status(200).send({"Pass":"Yea"})
                                            return;
                                        }
                                })
                            }    
                    })
            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:err})
                return;
            }
    })


router.get('/courses/',function(req,res)
    {
        
        try
            { 
                console.log("Starting /courses")
                //login function checking db
                db.all('SELECT id, name , description,subject,credits FROM courses',function(err,row)
                    { 
                        console.log("Searched through potential courses")
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return
                            }
                        else if (row)
                            {
                                console.log("Sending all course rows now")
                                res.status(200).send(row)
                                return
                            }
                        else
                            {
                                console.log("Nothing to seee here")
                                res.status(404).send("Nothing was found")
                                return
                            }
                    })
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return;
            }
    });









router.post('/coursesList/',function(req,res)
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
                console.log("returning all instances of userid in enrollment and returning classes now")
                db.all('SELECT A.name, A.description, A.subject, A.credits FROM courses as A FULL JOIN enrollment as B on B.course_id = A.id WHERE B.user_id = ?',[id],function(err,row)
                    { 
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return
                            }
                        else if (row)
                            {
                                console.log("Sending results:"+row)
                                res.status(200).send(row)
                                return
                            }
                        else
                            {
                                console.log("Nothing to seee here")
                                res.status(404).send({error:"Nothing was found for users"})
                                return
                            }
                    })
            }
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
                db.run(`UPDATE courses SET ${Object.keys(courseChanges)} = ? WHERE id = ? and creator_id = ?`,[Object.values(courseChanges)[0],coursesID,id],function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return
                            }
                        else
                            {
                        
                                console.log(courseChanges)
                                res.send(200)
                                return
                            }
                    })
            }
        catch(e)
            {
                console.log(e)
                res.send(403)
                return
            }
    })

 router.delete('/courses/:coursesID',function(req,res)
    {
        const {coursesID} = req.params
        
        try
            {
                console.log("Deleting courseID")
                db.run(`DELETE FROM courses WHERE id =? `,[coursesID],function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                                return
                            }
                        else
                            {
                                console.log("courses have been deleted")
                                res.send(200)
                                return
                            }
                    })

            }
        catch(e)
            {
                console.log(e)
                res.status(500).send({error:e})
                return
            }
    })






//cart
router.post('/cart/:orderNum',function(req,res)
    {
        const {orderNum}= req.params
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
                const insertStmt = db.prepare(`INSERT INTO cart (user_id,course_id,order_num) VALUES (?,?,?,?)`)
                for (const courseID of coursesID)
                    {
                
                        //console.log(`I :${i}`)
                        //console.log(`coursesID ${coursesID.length}`)
                        console.log(`coursesID elements :${courseID}`)
                    
                        insertStmt.run([orderNum,id,courseID,orderNum],function(err)
                            {
                                if (err)
                                    {
                                        console.log(`Error SQL: ${err}`)
                                        errors.push(err);
                                    }
                                else
                                    {
                                        console.log(courseID+" Sucessfully inserted")
                                        inserted += 1;        
                                    }

                        
                                console.log(inserted+errors.length==coursesID.length);
                                if (inserted+errors.length == coursesID.length)
                                    {
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
                            })
                    }

            }   
        catch(e)
            {
                console.log(e)
                return res.status(500).send({error:e})
            } 
    })


router.post('/getCart/:orderNum',function(req,res)
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
                db.all("SELECT * FROM cart WHERE user_id = ? AND order_num = ?",[user_id,orderNum],function(err,row)
                {
                    if(err)
                        {
                            console.log(err)
                            return res.sendStatus(500)
                        }
                    else
                        {
                            console.log("Everything worked out amazing")
                            res.status(200).send(row)
                            return
                        }
                })
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
                return
            }
    })


router.put('/cart/:orderNum',function(req,res)
    {
        const {orderNum} = req.params
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
            {   let errors = []
                let updated = 0
                console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                console.log("Editiing cart now")
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i)
                        db.run(`UPDATE cart SET ${Object.keys(changes)[i]}= ? WHERE user_id = ? and order_num= ?`,[Object.values(changes)[i],id,orderNum],function(err)
                            { 
                                if(err)
                                    {
                                        console.log(err)
                                        errors.push(err)
                                    }
                                else
                                    {
                                        console.log("Updated: ", updated)
                                        updated += 1;
                                    }
                            })
                            
                    }
                console.log(`Updated: ${updated}:Errors ${errors.length}`)
                if (updated+errors.length==Object.keys(changes).length-1)
                    {
                        if (errors.length>0)
                            {
                                console.log(errors)
                                return res.status(500).send({errors:errors})
                            }
                        else
                        {
                            console.log("Successful in changing cart")
                            return res.sendStatus(200)
                        }
                    } 

            }   
        catch(e)
            {
                console.log(e)
                return res.status(500).send({errors:e})
            }
    })


router.delete('/cart/:orderNum',function(req,res)
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
                db.run('DELETE FROM cart WHERE user_id = ? AND order_num= ?',[id,orderNum],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                //sends a json of the issue and a 500 status
                                res.status(500).send({error:err})
                                return
                            }
                        else
                            {
                                console.log("sucessfully done")
                                res.send(200)
                                return
                            }
                    })
            }
    catch(e)
        {
            console.log(e)
            res.sendStatus(403)
            return
        }
})
 
//Enrollment
router.post("/enroll",function(req,res)
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
                console.log("enrolling user now!")
                db.run("INSERT into enrollment(user_id,course_id) values (?,?)",[id,courseID],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.status(505).send(err)
                                return
                            }
                        else
                            {
                                console.log("User is enrolled in the classes now")
                                res.status(200).send({"Status":"Success"})
                                return
                            }
                    })
            }
        catch(err)
            {
                console.log(err)
                res.status(500).send(err)
                return
            }
        })



router.post("/checkEnroll",function(req,res)
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
                console.log("ID: "+id)
                if(!id){res.status(500).send({"Error":"Missing ID ,cant do anything with no id"})}
                db.all("SELECT * from enrollment WHERE user_id = ?",[id],function(err,row)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send(err);return
                            } 
                        else if(row)
                            {
                                console.log("Found classes that user is enrolled in")
                                res.status(200).send(row)
                                return
                            }
                        else
                            {
                                res.status(404).send("Nothing to see here")
                                return
                            }
                    })
            }
        catch(err)
            {
                console.log(err)
                res.send(err)
                return
            }

    })


router.put("/enroll",function(req,res)
    {
        {
        //Any changes goes in the req.body
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
            {   let errors = []
                let updated = 0
                console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                console.log("Changing enroll now")
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i)
                        db.run(`UPDATE enrollment SET ${Object.keys(changes)[i]}= ? WHERE user_id = ?`,[Object.values(changes)[i],user_id],function(err)
                            { 
                                if(err)
                                    {
                                        console.log(err)
                                        errors.push(err)
                                    }
                                else
                                    {
                                        console.log("updated", updated)
                                        updated += 1;
                                    }
                            })
                            
                    }
                console.log(`Updated: ${updated}:Errors ${errors.length}`)
                if (updated+errors.length==Object.keys(changes).length-1)
                    {
                        if (errors.length>0)
                            {
                                console.log("Change of enrollment failed")
                                return res.status(500).send({errors:errors})
                            }
                        else
                        {
                            console.log("Change of enrollment worked")
                            return res.sendStatus(200)
                        }
                    } 
            }   
        catch(e)
            {
                console.log(e)
            }
    }})



    
//Dont use yet
router.delete("/enroll",function(req,res)
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
                db.run("DELETE FROM enrollment WHERE user_id = ? AND course_id= ?",[id,course_id],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send(err)
                                return
                            }
                        else
                            {
                                console.log("enrollment was deleted")
                                res.sendStatus(200)
                                return

                            }
                    })
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

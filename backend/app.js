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

//console.log("Secret Key: "+SECRET_KEY)

console.log(CLIENT_ID);
console.log(CLIENT_SECRET);
console.log(REDIRECT_URL)


//middleware
const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://dwrigley1.github.io/SDEV255-GROUP6-PROJECT',
    'https://dwrigley1.github.io',
    'https://sdev255-group6-project.onrender.com'
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
const db = new sqlite3.Database('./backend_db.db',(err)=>{})
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
                            }
                        else
                        {
                            console.log("resolving seed")
                            resolve();
                            res.sendStatus(200)
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
                console.log("Decrypted Token:", decryptedToken);
                const new_params = Object.fromEntries(decryptedToken.split(",").map(pair=>pair.split(":")))
                const{id,email,password,role} = (new_params)
                if(!id || !email || !password ||!role)
                    {
                        res.status(503).send({error:"Missing id/email/password/role"})
                        return
                    }
                else
                    {
                        const queryStmt = db.get('SELECT * FROM users WHERE email = ? AND password = ?',[email,password],function (err,row)
                        {
                            if(err)
                                {
                                    res.send(501).send({error:err})
                                }
                            else if(row)
                                {
                                    if(row.role!=role)
                                        {
                                            console.log(`DB role: ${row.role} != Provided Role :${role}`)
                                            res.send(400).send({error:"Dont lie"})
                                        }
                                    else if(minAuth=="teacher" && role!="teacher")
                                        {
                                            console.log(`MinAuth :${minAuth} != Role: ${role}`)
                                            res.send(501).send({auth:false})
                                        }
                                    else
                                        {
                                            console.log(`${id} is approved for content`)
                                            res.send(200).send({auth:true})
                                        }
                                }


                        })

                    }




            }
        catch(err)
            {


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
                                }
                            else if (row)
                                {
                                    console.log(`${JSON.stringify(row)} was found`)
                                    const token = `id:${row.id},email:${row.email},password:${row.password},role:${row.role}`;
                                    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
                                    res.status(200).send({token:encryptedToken})
                                }
                            else
                                {
                                    console.log("Nothing was there")
                                    res.sendStatus(404)
                                }    
                    })
            }
            catch(e)
                {
                    console.log(e)
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
                                }
                            else 
                                {
                                    console.log("Success!")
                                    res.sendStatus(200);
                                };
                            //frees up reasources and commits
                            insertStmt.finalize();
                        })
                }
            catch(e)
                {
                    console.log(e)
                    res.sendStatus(404)
                }
    });

router.put('/login/:email/',function(req,res)
    {
        const {email}= req.params
        const changes = req.body
        // struture for puts are {column:value}
       console.log(changes)
        try
            {   let errors = []
                let updated = 0
                //console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i,Object.keys(changes)[i])
                        db.run(`UPDATE users SET ${Object.keys(changes)[i]}= ? WHERE email = ?`,[Object.values(changes)[i],email],(err)=>
                            { 
                                if(err)
                                    {
                                        console.log(err)
                                        res.status(500).send(err)
                                    }
                                else
                                    {
                                        console.log("test", updated)  
                                    }
                            })
                            
                    }
                console.log(`If it existed it changed`)
                res.sendStatus(200)

            }   
        catch(e)
            {
                console.log(e)
            }
    })

router.delete('/login/:ID',function(req,res)
    {
        const {ID} = req.params
        try
            {
                db.run(`DELETE FROM users WHERE ID =?`,[ID],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                            }
                        else
                            {
                                res.sendStatus(200)
                            }    
                    })
            }
        catch(e)
            {
                console.log(e)
            }
    })




//courses

router.post('/courses/:userID',function(req,res)
    {
        const {userID}= req.params;
        //const queryStmt = db.prepare(`SELECT u.id FROM users as u WHERE u.id= ? AND u.role = teacher `)
        const {name, description, subject, credits} = req.body
        if(!name || !description ||!subject || !credits){res.status(500).send({"error":"Missing name/description/subject/credits"})}
        try
            {

                //checks if user is a teacher
                db.run(`SELECT u.id FROM users as u WHERE u.id= ? AND u.role = "teacher" `,userID,function(err)
                    {
                        //if not teacher
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                            }
                            //if teacher then creates course
                        else
                            {
                               const insertStmt= db.prepare('INSERT INTO courses ( name, description, subject, credits, creator_id) values (?,?,?,?,?)')
                                insertStmt.run( name, description, subject, credits, userID,function(err)
                                {
                                    if(err)
                                        {
                                            console.log(err)
                                            res.status(500).send({error:err})
                                        }
                                    else
                                        {
                                            res.sendStatus(200)
                                        }
                                })
                            }    
                    })
            }
        catch(e)
            {
                console.log(e)
            }
    })


router.get('/courses/:userID',function(req,res)
    {
        const {userID}= req.params;
        try
            { 
                //login function checking db
                db.all('SELECT A.name, A.description, A.subject, A.credits FROM courses as A FULL JOIN enrollment as B on B.course_id = A.id WHERE B.user_id = ?',[userID],function(err,row)
                    { 
                        if(err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                            }
                        else if (row)
                            {
                                res.status(200).send(row)
                            }
                        else
                            {
                                console.log("Nothing to seee here")
                            }
                    })
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
            }
    });



router.put('/courses/:coursesID/:userID',function(req,res)
    {
        
        //coursesID put in the url 
        const {userID,coursesID} = req.params
        
        //what will be changed goes here
        //assuming structure will be {column:value}
        const {courseChanges}= req.body;


        try
            {
                //update courses
                console.log(`Value: ${Object.values(courseChanges)[0]} \n ${coursesID}`)
                db.run(`UPDATE courses SET ${Object.keys(courseChanges)} = ? WHERE id = ? and creator_id = ?`,[Object.values(courseChanges)[0],coursesID,userID],function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                            }
                        else
                            {
                        
                                console.log(courseChanges)
                                res.send(200)
                            }
                    })
            }
        catch(e)
            {
                console.log(e)
                res.send(403)
            }
    })

 router.delete('/courses/:coursesID',function(req,res)
    {
        const {coursesID} = req.params
        try
            {
                db.run(`DELETE FROM courses WHERE id =? `,[coursesID],function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                res.status(500).send({error:err})
                            }
                        else
                            {
                                res.send(200)
                            }
                    })

            }
        catch(e)
            {
                console.log(e)
            }
    })






//cart
router.post('/cart/:user/:orderNum/',function(req,res)
    {
        const {user,orderNum}= req.params
        //coursesID are assumed to be taken in as array stuctured as {coursesID:["1","2"]}
        const {coursesID} = req.body
        
        try
            { 
                //create cart    
                let errors = []
                let inserted = 0
                const insertStmt = db.prepare(`INSERT INTO cart (user_id,course_id,order_num) VALUES (?,?,?,?)`)
                for (const courseID of coursesID)
                    {
                
                        //console.log(`I :${i}`)
                        //console.log(`coursesID ${coursesID.length}`)
                        console.log(`coursesID elements :${courseID}`)
                    
                        insertStmt.run([orderNum,user,courseID,orderNum],function(err)
                            {
                                if (err)
                                    {
                                        console.log(`Error SQL: ${err}`)
                                        errors.push(err);
                                    }
                                else
                                    {
                                        inserted += 1;        
                                    }

                        
                                console.log(inserted+errors.length==coursesID.length);
                                if (inserted+errors.length == coursesID.length)
                                    {
                                        if (errors.length>0)
                                            {
                                                return res.status(500).send({error:errors})
                                            }
                                        else
                                            {
                                                return res.sendStatus(200)   
                                            }
                                    } 
                            })
                    }

            }   
        catch(e)
            {
                console.log(e)
            } 
    })


router.get('/cart/:user_id/:orderNum',function(req,res)
    {
        const {user_id,orderNum} = req.params
        try
            {
                //let result = "result of parsing"//Fetch orderNum
                db.all("SELECT * FROM cart WHERE user_id = ? AND order_num = ?",[user_id,orderNum],function(err,row)
                {
                    if(err)
                        {
                            console.log(err)
                            return res.sendStatus(500)
                        }
                    else
                        {
                            res.json(row)
                        }
                })
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
            }
    })


router.put('/cart/:user_id/:orderNum',function(req,res)
    {
        const {user_id,orderNum} = req.params
        const changes = req.body
      

        try
            {   let errors = []
                let updated = 0
                console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i)
                        db.run(`UPDATE cart SET ${Object.keys(changes)[i]}= ? WHERE user_id = ? and order_num= ?`,[Object.values(changes)[i],user_id,orderNum],function(err)
                            { 
                                if(err)
                                    {
                                        errors.push(err)
                                    }
                                else
                                    {
                                        console.log("test", updated)
                                        updated += 1;
                                    }
                            })
                            
                    }
                console.log(`Updated: ${updated}:Errors ${errors.length}`)
                if (updated+errors.length==Object.keys(changes).length-1)
                    {
                        if (errors.length>0)
                            {
                                return res.status(500).send({errors:errors})
                            }
                        else
                        {
                            return res.sendStatus(200)
                        }
                    } 

            }   
        catch(e)
            {
                console.log(e)
            }
    })


router.delete('/cart/:user/:orderNum',function(req,res)
    {
        const {user,orderNum} = req.params
        try
            {
                db.run('DELETE FROM cart WHERE user_id = ? AND order_num= ?',[user,orderNum],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                //sends a json of the issue and a 500 status
                                res.status(500).send({error:err})
                            }
                        else
                            {
                                res.send(200)
                            }
                    })
            }
    catch(e)
        {
            console.log(e)
            res.sendStatus(403)
        }
})

//Enrollment
router.post("/eroll",function(req,res){





})



router.get("/enroll",function(req,res){





})
router.put("/eroll",function(req,res){





})

router.delete("/eroll",function(req,res){





})




app.use("/api",router)

port = 3000

app.listen(port,()=>{console.log(`Server running on ${port}`)})

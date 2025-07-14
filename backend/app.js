//Requirements
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
var cors= require('cors');
const app = express();
const fs = require('fs').promises;
const path =require('path');
app.use(express.json())
app.use(cors());
const router = express.Router();
const db = new sqlite3.Database('./backend_db.db',(err)=>{})
const fp_schema = path.join(__dirname,"/DB/schema.sql")
const fp_seed = path.join(__dirname,"/DB/seed.sql")

console.log(fp_schema)

router.get("/initalize",async function(req,res)
    {
        try{
        const sql = await fs.readFile(fp_schema,"utf8");
        
        await new Promise((resolve,reject)=>
            {
                db.exec(sql,function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                reject(err);
                                res.sendStatus(500)
                            }
                        else
                            {
                                resolve();
                                res.sendStatus(200)
                            }
                    })
            
                })
        const sql2 = await fs.readFile(fp_seed,"utf8");
        
        await new Promise((resolve,reject)=>
            {
                db.exec(sql,function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                reject(err);
                                res.sendStatus(500)
                            }
                        else
                        {
                            resolve();
                            res.sendStatus(200)
                        }
                    })
            })
        }
        catch(e)
        {
            console.log(e)

        }



    })





//login and validation
router.get('/login/:email/:password',function(req,res)
    {
        
        const {email,password} = req.params
            try
                {
                    //Example query for login check
                    console.log(`${email}:${password}`)
                    const queryStmt = db.get('SELECT * FROM users WHERE email = ? AND password = ?',[email,password],function (err,row)
                        {
                            if (err)
                                {
                                    console.log(`Oh man there was an error :${err}`)
                                    res.sendStatus(500).json({error:err})
                                }
                            else if (row)
                                {
                                    console.log(row.first_name)
                                    res.sendStatus(200)
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
    
        const {id,email,password,first_name,last_name,role} = req.body
        // Example of how to format post request for creating user 
        // `       {
        //             "id":"4"
        //             "email":"fingus22@example.com",
        //             "password":"password1234",
        //             "first_name":"bill",
        //             "last_name":"burr",
        //              "role":"teacher"
        //         }`




            try
                {
                    //insert statment
                    console.log(`${email}:${password}:${first_name},${last_name}`)
                    const insertStmt = db.prepare('INSERT INTO users (id,email,password,first_name,last_name,role) values (?,?,?,?,?,?)')
                    insertStmt.run(4,email,password,first_name,last_name,role,function(err)
                        { 
                            if (err)
                                {
                                    console.error("Error inserting change:",err)
                                    res.sendStatus(500).json({error:err})
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
       
        try
            {   let errors = []
                let updated = 0
                console.log(`${Object.keys(changes)[0]}:${Object.values(changes)[0]}`)
                for (let i=0;i<=Object.keys(changes).length-1;i++)
                    {
                        console.log(i)
                        db.run(`UPDATE users SET ${Object.keys(changes)[i]}= ? WHERE email = ?`,[Object.values(changes)[i],email],function(err)
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
                                return res.sendStatus(500).json({errors:errors})
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

router.delete('/login/:ID',function(req,res)
    {
        const {ID} = req.params
        try
            {
                db.run(`DELETE FROM user WHERE ID =?`,[userID],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.sendStatus(500).json({error:err})
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
                                res.sendStatus(500).json({error:err})
                            }
                        else if (row)
                            {
                                res.json(row)
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



router.put('/courses/:coursesID',function(req,res)
    {
        //coursesID put in the url 
        const {coursesID} = req.params

        //what will be changed here
        //assuming structure will be {column:value}
        const completedCourses = req.body

        try
            {
                //inserts completed courses to user
                console.log(`Value: ${Object.values(completedCourses)[0]} \n ${coursesID}`)
                db.run(`UPDATE courses SET ${Object.keys(completedCourses)} = ? WHERE id = ?`,[Object.values(completedCourses)[0],coursesID],function(err)
                    {
                        if (err)
                            {
                                console.log(err)
                                res.sendStatus(500).json({error:err})
                            }
                        else
                            {
                        
                                console.log(completedCourses)
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
                                res.sendStatus(500).json({error:err})
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
                const insertStmt = db.prepare(`INSERT INTO cart (id,user_id,course_id,order_num) VALUES (?,?,?,?)`)
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
                                                return res.sendStatus(500).json({error:errors})
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
                                return res.sendStatus(500).json({errors:errors})
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
                                res.sendStatus(500).json({error:err})
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



app.use("/api",router)
app.listen(3000)
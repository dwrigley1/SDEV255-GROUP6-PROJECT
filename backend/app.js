//Requirements
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
var cors= require('cors');
const app = express();
app.use(express.json())
app.use(cors());
const router = express.Router();
const db = new sqlite3.Database('./test.db',(err)=>{})






//login and validation
router.get('/login/:username/:password',function(req,res)
    {
        const {username,password} = req.params
            try
                {
                    //Example query for login check
                    const queryStmt = db.get('SELECT * FROM users WHERE first_name = ? AND last_name = ?',[username,password],function (err,row)
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

router.post('/login/:first_name/:last_name',function(req,res)
    {
        const {first_name,last_name} = req.params
        const {email} = req.body
            try
                {
                    //insert statment
                    const insertStmt = db.prepare('INSERT INTO users (first_name,last_name,teacher,email) values (?,?,?,?)')
                    insertStmt.run(first_name,last_name,0,email,function(err)
                        {
                            if (err)
                                {
                                    console.error("Error inserting data:",err)
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

router.put('/login/:ID/',function(req,res)
    {
        const {ID}= req.params
        const {changes} =req.body
        // struture for puts are {column:value}

        try
            {
                db.run(`UPDATE user SET ${JSON.keys(changes)}= ? WHERE ID = ?`,[JSON.values(changes),ID],function(err)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.sendStatus(500).json({error:err})
                            }
                        else
                            {
                                res.sendStatus(200);
                            }
                    })
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
                db.all('SELECT A.Name, A.description, A.credit_hours FROM courses as A FULL JOIN student_completed_courses as B on B.courseID = A.CourseID WHERE B.ID = ?',[userID],function(err,row)
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
                db.run(`UPDATE courses SET ${Object.keys(completedCourses)} = ? WHERE courseID = ?`,[Object.values(completedCourses)[0],coursesID],function(err)
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
                db.run(`DELETE FROM courses WHERE courseID =? `,[coursesID],function(err)
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
                const insertStmt = db.prepare(`INSERT INTO cart (orderNum,ID,courseID) VALUES (?,?,?)`)
                for (const courseID of coursesID)
                    {
                
                        //console.log(`I :${i}`)
                        //console.log(`coursesID ${coursesID.length}`)
                        console.log(`coursesID elements :${courseID}`)
                    
                        insertStmt.run([orderNum,user,courseID],function(err)
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


router.get('/cart/:username/:orderNum',function(req,res)
    {
        const {userName,orderNum} = req.params
        try
            {
                let result = "result of parsing"//Fetch orderNum
                res.json({result:`${result}`})
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(404)
            }
    })


router.put('/cart/:userName/:orderNum',function(req,res)
    {
        const {userName,orderNum} = req.params
        const data = req.body
        try
            {    
                for (let i=0;i++;data.length)
                    {
                        if (Object.keys(data)[i] in columns)
                        {
                            column_key = Object.values(data)
                        }
                    }
                console.log(Object.keys(data))
                res.send(data)
            }
        catch(e)
            {
                console.log(e)
                res.sendStatus(403)
            }
    })


router.delete('/cart/:user/:orderNum',function(req,res)
    {
        const {user,orderNum} = req.params
        try
            {
                db.run('DELETE FROM cart WHERE ID =? AND orderNum = ?',[user,orderNum],function(err)
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
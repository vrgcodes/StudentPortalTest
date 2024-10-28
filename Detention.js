const express = require("express");
const morgan = require("morgan");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
const PDFDocument = require('pdfkit');
const request = require('request');



dotenv.config({path:'./.env'}) //Allows access to the .env file which has all the key information stored

const app = express();
const port = 8080;
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({ //Creation of a connection to the database
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT 
});



connection.connect((err)=>{
    if(err){
        console.log(err.message)
    }
    console.log(connection.state);
});

   
const verifyToken = (req, res, next)=>{ //Code to verify JWT
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token==null) return res.status(401).send({message:"No token provided"})
    const decoded = jwt.decode(token)
    if (!decoded){
        return res.status(401).send({message:"Invalid token"})
    }
    if (decoded.exp<Math.floor(Date.now()/1000)){
        return res.status(401).send({message: "Token expired"})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        
        if (err) return res.status(403).send({message: "Failed to authenticate token"})

        //If token is verified, the following information about the user is provided

        req.userName = user.name;
        req.userClassA = user.class;
        req.userPosition = user.status;

        next()
    })

}

const generateAccessToken = (user)=>{ //Function to generate an access token
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET ,{expiresIn:'20s'})
}

const formatDate = (date)=>{ //Formats dates received from the client-side so that they can be stored in the database
    const dateF = new Date(date);
    const year = dateF.getFullYear();
    const month = String(dateF.getMonth() + 1).padStart(2, '0'); // Months are zero indexed
    const day = String(dateF.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;

}

let quote;


var category = 'happiness';
request.get({
  url: 'https://api.api-ninjas.com/v1/quotes?category=' + category,
  headers: {
    'X-Api-Key': process.env.API_KEY
  },
}, function(error, response, body) {
  if(error) return console.error('Request failed:', error);
  else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
  else {const data = JSON.parse(body)
    quote = data[0].quote
  };
});


app
    .use(morgan("dev"))
    .use(express.static("public"))
    .use(bodyParser.urlencoded({extended:false}))
    .use(bodyParser.json())

    .post('/login', (req, res)=>{ //Login handler
        const{mail, pass} = req.body;
        let passC = pass.replace(/^"(.+(?="$))"$/, '$1') //Regex check to remove any double quotes from the password received for storage in database
        

        const sql = `SELECT * FROM login_info WHERE Email = ${mail}`;

        connection.query(sql, async (err, results)=>{
            if (err){
                res.status(500).json({error:err.message});
            }
            if(results.length===0){
                res.json({match:false})
            }
            else{
                const isMatch = await bcrypt.compare(passC, results[0].Password) //Compares the stored encrypted password with the input password
                if (isMatch && results[0].Status !=="TBD"){ //Only if the the login details match and the user has been approved the following is performed
                    const user = {name:results[0].Name, status:results[0].Status, class:results[0].classAllocation} //User object created
                    const accessToken = generateAccessToken(user) //Access token created
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn:'1y'}) //Refresh token created
                    const sql = `INSERT INTO refreshtokens (Refresh_Token) VALUES (?)`; //Inserts the refresh token for the user into the refresh token database for later retrieval
                    connection.query(sql, [refreshToken])
                    if (user.status == 'Admin'){
                        res.json({match:true, accessToken:accessToken, refreshToken:refreshToken, priority:true}); //Sends the following data back to the client-side JS
                    }
                    else{
                        res.json({match:true, accessToken:accessToken, refreshToken:refreshToken, priority:false}); //Sends the following data back to the client-side JS

                    }
                }
                else{
                    res.json({match:false})
                }
            }
        })

    })

    .post('/logout', (req,res)=>{ //Logout handler
        const token = req.body
        const sql1 = `DELETE FROM refreshtokens WHERE Refresh_Token = ?`
        connection.query(sql1,[token], (err, results)=>{
            if(err){
                console.log(err)
            }
        })
    })
 

    .post('/register', async (req, res)=>{ //Registration handler
        const{name, mail, pass} = req.body;
        const hash = await bcrypt.hash(pass, 13) //Password encrypton

        const sql = `INSERT INTO login_info (Name, Email, Password) VALUES (?, ?, ?)`;

        connection.query(sql, [name, mail, hash], (err, results)=>{
            if (err){
                res.status(500).json({error:err.message});
            }
            else{
                res.json({match:true});

                }
        })
    })

    .get('/user-data', verifyToken, (req,res)=>{ //Provides the user details with the client-side
        res.json({
            fullName: req.userName,
            userStatus: req.userPosition,
            classAllocation: req.userClassA
        })
    })

    .post('/token', (req,res)=>{ //Refresh token authentication handler
        const refreshToken = req.body.refresh
        if(refreshToken == null )return res.status(401).send({message:"No token provided"})
        const sql = `SELECT * FROM refreshtokens WHERE Refresh_Token = "${refreshToken}"`;
        connection.query(sql, (err, results)=>{
            if(err)return res.status(500).json({error:err.message, match:false})
            if(!(results.length>0)) return res.status(403).send({message:"Refresh token does not exist.",match:false})
            
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
                if(err) return res.status(403).json({error:err.message})
                const accessToken = generateAccessToken({name:user.name, status: user.status, class:user.class}) //If refresh token is verified, it will create another access token
                res.json({accessToken:accessToken, userID:user, match:true}) //Provides the user object and access token back to the client-side to allow the user to be logged in
            })
        })
    })

    .get('/students', (req,res)=>{ //Provides the student names and classes for the autofill functions
        const sql = `SELECT * FROM students`;
        let students = []
        let classes = []
        connection.query(sql, (err, results)=>{
            if(err)return res.status(500).json({error:err.message})
            results.forEach(element => {
                students.push(element.Full_Name)
                classes.push(element.Class)
            });
            res.json({name:students, class:classes})
        })
    })

    .post('/addUniform', (req, res)=>{ //Provision of uniform violation handler
        const{name, cLass, authority} = req.body;
        let today = new Date()
        today.toISOString().split('T')[0].substring(0,10)

        const sql = `INSERT INTO uniform (Date, Name, Class, Prefect_Teacher) VALUES (?, ?, ?, ?)`;

        connection.query(sql, [today, name, cLass, authority], (err, results)=>{
            if (err){
                res.status(500).json({error:err.message});
            }
            else{
                res.json({match:true});

                }
        })

        //Adds the violation to the respective counter table for automatic movement into higher level punishments

        const sql1 = `SELECT COUNT(Name) FROM uniform WHERE Name = ? `;
        connection.query(sql1, [name], (err, results)=>{
            const count = results[0]['COUNT(Name)']
            if(count===1){
                const sql2 = `INSERT INTO uniform_counter (Name, Class, No_of_Violations) VALUES (?, ?, ?)`;
                connection.query(sql2, [name, cLass, count], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
            }
            
            else{ //If count exceeds 3, moved to the next punishment level
                if(Number.isInteger(count/3) && count!==0){
                    const sql4 = `INSERT INTO lunch_detention (Date, Name, Class, Reason, Prefect_Teacher) VALUES (?,?,?,?,?)`
                    connection.query(sql4, [today, name, cLass, "Multiple uniform violations", authority], (err, results)=>{
                        if (err){
                            console.log(err)
                        }
                    })
                    const sql7 = `INSERT INTO dt_counter (Name, Class, No_of_Detentions) VALUES (?, ?, ?)`;
                    connection.query(sql7, [name, cLass, 1], (err, results)=>{
                        if (err){
                            console.log(err)
                        }
                    })
                }
                //Updates counter in the respective table if count is not 1
                const sql3 = `UPDATE uniform_counter SET No_of_Violations = No_of_Violations + 1 where Name = ?`
                connection.query(sql3, [name], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
                
            }
        })
    })

    .post('/removeUniform', (req, res)=>{ //Removal of uniform violation handler
        const{name, cLass, date} = req.body;
        let dateToUse = new Date(date);
        let firstMatch, secondMatch = false;
        dateToUse.toISOString().split('T')[0].substring(0,10)
        const sql1 = `SELECT COUNT(Name) FROM uniform WHERE Name = ? AND Class = ? AND Date = ?`;
        connection.query(sql1, [name, cLass, date], (err, results)=>{
            if (err){
                console.log(err)
            }
            if(results[0]['COUNT(Name)']!==0){ //If more than one uniform violation, deletes that specific entry
                const sql2 = `DELETE FROM uniform WHERE Name = ? AND Class = ? AND Date = ?`
                connection.query(sql2, [name, cLass, date], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                     else{
                        firstMatch = true
                     }
                })
                if(results[0]['COUNT(Name)']===1){ //If only one uniform violation, deletes that person from the database
                 const sql4 = `DELETE FROM uniform_counter WHERE Name = ?`
                 connection.query(sql4, [name], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                     else{
                        secondMatch = true
                     }
                })
                }
                else{
                 const sql3 = `UPDATE uniform_counter SET No_of_Violations = No_of_Violations - 1 where Name = ?` //Decrements the counter
                 connection.query(sql3, [name], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                 })
                }
                
             }
            if((firstMatch&&secondMatch) || (firstMatch&&not(secondMatch))){
                res.json({match:true})
            }
        })
    })

    .get('/viewUniform', (req, res)=>{ //Viewing uniform violations handler
        const sql = `SELECT * FROM uniform ORDER BY Date DESC`
        connection.query(sql, (err, results)=>{
            if(err){
                console.log(err)
            }

            //Creation of a PDF document
            const doc = new PDFDocument(
                {layout:'landscape'}
            );
            const buffers = []
            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', ()=>{
                const pdfData = Buffer.concat(buffers)
                res.setHeader('Content-Length', pdfData.length)
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', 'inline; filename="data.pdf"')     
                res.send(pdfData)
            })
            doc.fontSize(22).text('Uniform Violations:', { align: 'center' , underline:true, bold:true}).moveDown();
            doc.font('Helvetica-Bold').fontSize(12);
            const headers = ['Date', 'Name', 'Class', 'Teacher/Prefect'];
            const tableRows = [headers].concat(results.map(row => [formatDate(row.Date), row.Name, row.Class, row.Prefect_Teacher]));
            const columnWidths = [150, 200, 150, 150]; 
            const startY = doc.y + 10;
            const startX = doc.x + 10;

            doc.font('Helvetica-Bold');
            tableRows[0].forEach((header, i) => {
                doc.text(header, startX + (i * columnWidths[i]), startY);
            });

            currentY += 20;  // Move down after headers

            // Draw rows with text wrapping for each cell
            doc.font('Helvetica');
            for (let i = 1; i < tableRows.length; i++) {
                const row = tableRows[i];
                let rowHeight = 0;

                // Calculate the height of each cell in the row
                row.forEach((cell, j) => {
                    const cellHeight = doc.heightOfString(cell, {
                        width: columnWidths[j]
                    });
                    rowHeight = Math.max(rowHeight, cellHeight);
                });

                // Draw each cell in the row, and wrap text if needed
                row.forEach((cell, j) => {
                    doc.text(cell, startX + (j * columnWidths[j]), currentY, {
                        width: columnWidths[j],
                        lineBreak: true
                    });
                });

                currentY += rowHeight + 10; // Move down by the tallest cell's height, with added padding
            }
        
            doc.end();
        })
    })


    .post('/addDetention', (req, res)=>{
        const{name, cLass, reason, authority} = req.body;
        let today = new Date()
        today.toISOString().split('T')[0].substring(0,10)

        const sql = `INSERT INTO lunch_detention (Date, Name, Class, Reason, Prefect_Teacher) VALUES (?, ?, ?, ?, ?)`;

        connection.query(sql, [today, name, cLass, reason, authority], (err, results)=>{
            if (err){
                res.status(500).json({error:err.message});
            }
            else{
                res.json({match:true});

                }
        })

        const sql1 = `SELECT COUNT(Name) FROM lunch_detention WHERE Name = ? `;
        connection.query(sql1, [name], (err, results)=>{
            const count = results[0]['COUNT(Name)']
            if(count===1){
                const sql2 = `INSERT INTO dt_counter (Name, Class, No_of_Detentions) VALUES (?, ?, ?)`;
                connection.query(sql2, [name, cLass, count], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
            }
            
            else{
                if(Number.isInteger(count/3) && count!==0){
                    const sql4 = `INSERT INTO saturday_detention (Date, Name, Class, Reason, Prefect_Teacher) VALUES (?,?,?,?,?)`
                    connection.query(sql4, [today, name, cLass, "Multiple detentions", authority], (err, results)=>{
                        if (err){
                            console.log(err)
                        }
                    })
                    const sql7 = `INSERT INTO saturday_dt_counter (Name, Class, No_of_Saturday_Detentions) VALUES (?, ?, ?)`;
                    connection.query(sql7, [name, cLass, 1], (err, results)=>{
                        if (err){
                            console.log(err)
                        }
                    })
                }
                const sql3 = `UPDATE dt_counter SET No_of_Detentions = No_of_Detentions + 1 where Name = ?`
                connection.query(sql3, [name], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
                
            }
        })
    })

    .post('/removeDetention', (req, res)=>{
        const{name, cLass, date} = req.body;
        let dateToUse = new Date(date);
        let firstMatch, secondMatch = false
        dateToUse.toISOString().split('T')[0].substring(0,10)
        const sql1 = `SELECT COUNT(Name) FROM lunch_detention WHERE Name = ? AND Class = ? AND Date = ?`;
        connection.query(sql1, [name, cLass, date], (err, results)=>{
            if (err){
                console.log(err)
            }
            if(results[0]['COUNT(Name)']!==0){
                const sql2 = `DELETE FROM lunch_detention WHERE Name = ? AND Class = ? AND Date = ?`
                connection.query(sql2, [name, cLass, date], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                     else{
                        firstMatch = true
                     }
                })
                if(results[0]['COUNT(Name)']===1){
                 const sql4 = `DELETE FROM dt_counter WHERE Name = ?`
                 connection.query(sql4, [name], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                     else{
                        secondMatch = true
                     }
                })
                }
                else{
                 const sql3 = `UPDATE dt_counter SET No_of_Detentions = No_of_Detentions - 1 where Name = ?`
                 connection.query(sql3, [name], (err, results)=>{
                     if (err){
                         console.log(err)
                     }
                 })
                }
                
             }
            if((firstMatch&&secondMatch) || (firstMatch&&not(secondMatch))){
                res.json({match:true})
            }
        })
    })

    .get('/viewDetention', (req, res)=>{
        const sql = `SELECT * FROM lunch_detention ORDER BY Date DESC`
        connection.query(sql, (err, results)=>{
            if(err){
                console.log(err)
            }
            const doc = new PDFDocument(
                {layout:'landscape'}
            );
            const buffers = []
            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', ()=>{
                const pdfData = Buffer.concat(buffers)
                res.setHeader('Content-Length', pdfData.length)
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', 'inline; filename="data.pdf"')     
                res.send(pdfData)
            })
            doc.fontSize(22).text('Detentions:', { align: 'center' , underline:true, bold:true}).moveDown();
            doc.font('Helvetica-Bold').fontSize(10);
            const headers = ['Date', 'Name', 'Class', 'Reason', 'Teacher/Prefect', 'Attendance'];
            const tableRows = [headers].concat(results.map(row => [formatDate(row.Date), row.Name, row.Class, row.Reason, row.Prefect_Teacher, row.Attendance === 1 ? 'Attended' : 'Not attended']));
            const columnWidths = [150, 80, 140, 120, 120, 115]; 
            const startY = doc.y + 10;
            const startX = doc.x + 10;

            doc.font('Helvetica-Bold');
            tableRows[0].forEach((header, i) => {
                doc.text(header, startX + (i * columnWidths[i]), startY);
            });

                 // Draw rows with text wrapping for each cell
            doc.font('Helvetica');
            for (let i = 1; i < tableRows.length; i++) {
                const row = tableRows[i];
                let rowHeight = 0;

                // Calculate the height of each cell in the row
                row.forEach((cell, j) => {
                    const cellHeight = doc.heightOfString(cell, {
                        width: columnWidths[j]
                    });
                    rowHeight = Math.max(rowHeight, cellHeight);
                });

                // Draw each cell in the row, and wrap text if needed
                row.forEach((cell, j) => {
                    doc.text(cell, startX + (j * columnWidths[j]), currentY, {
                        width: columnWidths[j],
                        lineBreak: true
                    });
                });

                currentY += rowHeight + 10; // Move down by the tallest cell's height, with added padding
            }
        
            doc.end();
        })
    })

    .post('/addSDetention', (req, res)=>{
        const{name, cLass, reason, authority} = req.body;
        let today = new Date()
        today.toISOString().split('T')[0].substring(0,10)

        const sql = `INSERT INTO saturday_detention (Date, Name, Class, Reason, Prefect_Teacher) VALUES (?, ?, ?, ?, ?)`;

        connection.query(sql, [today, name, cLass, reason, authority], (err, results)=>{
            if (err){
                res.status(500).json({error:err.message});
            }
            else{
                res.json({match:true});

                }
        })

        //No other higher level punishment, hence after 3 Saturday Detention, the name is not moved to another table

        const sql1 = `SELECT COUNT(Name) FROM saturday_detention WHERE Name = ? `;
        connection.query(sql1, [name], (err, results)=>{
            const count = results[0]['COUNT(Name)']
            if(count===1){
                const sql2 = `INSERT INTO saturday_dt_counter (Name, Class, No_of_Saturday_Detentions) VALUES (?, ?, ?)`;
                connection.query(sql2, [name, cLass, count], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
            }
            
            else{
                const sql3 = `UPDATE saturday_dt_counter SET No_of_Saturday_Detentions = No_of_Saturday_Detentions + 1 where Name = ?`
                connection.query(sql3, [name], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
                
            }
        })
    })

    .post('/removeSDetention', (req, res)=>{
        const{name, cLass, date} = req.body;
        let dateToUse = new Date(date);
        let firstMatch, secondMatch = false
        dateToUse.toISOString().split('T')[0].substring(0,10)
        const sql1 = `SELECT COUNT(Name) FROM saturday_detention WHERE Name = ? AND Class = ? AND Date = ?`;
        connection.query(sql1, [name, cLass, date], (err, results)=>{
            if (err){
                console.log(err)
            }
            if(results[0]['COUNT(Name)']!==0){
               const sql2 = `DELETE FROM saturday_detention WHERE Name = ? AND Class = ? AND Date = ?`
               connection.query(sql2, [name, cLass, date], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                    else{
                        firstMatch = true
                    }
               })
               if(results[0]['COUNT(Name)']===1){
                const sql4 = `DELETE FROM saturday_dt_counter WHERE Name = ?`
                connection.query(sql4, [name], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                    else{
                        secondMatch = true
                    }
               })
               }
               else{
                const sql3 = `UPDATE saturday_dt_counter SET No_of_Saturday_Detentions = No_of_Saturday_Detentions - 1 where Name = ?`
                connection.query(sql3, [name], (err, results)=>{
                    if (err){
                        console.log(err)
                    }
                })
               }
               
            }
            if((firstMatch&&secondMatch) || (firstMatch&&not(secondMatch))){
                res.json({match:true})
            }
        })
    })

    .get('/viewSDetention', (req, res)=>{
        const sql = `SELECT * FROM saturday_detention ORDER BY Date DESC`
        connection.query(sql, (err, results)=>{
            if(err){
                console.log(err)
            }
            const doc = new PDFDocument(
                {layout:'landscape'}
            );
            const buffers = []
            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', ()=>{
                const pdfData = Buffer.concat(buffers)
                res.setHeader('Content-Length', pdfData.length)
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', 'inline; filename="data.pdf"')     
                res.send(pdfData)
            })
            doc.fontSize(22).text('Saturday Detentions:', { align: 'center' , underline:true, bold:true}).moveDown();
            doc.font('Helvetica-Bold').fontSize(10);
            const headers = ['Date', 'Name', 'Class', 'Reason', 'Teacher/Prefect'];
            const tableRows = [headers].concat(results.map(row => [formatDate(row.Date), row.Name, row.Class, row.Reason, row.Prefect_Teacher, row.Attendance === 1 ? 'Attended' : 'Not attended']));
            const columnWidths = [150, 80, 120, 110, 120, 115]; 
            const startY = doc.y + 10;
            const startX = doc.x + 10;

            doc.font('Helvetica-Bold');
            tableRows[0].forEach((header, i) => {
                doc.text(header, startX + (i * columnWidths[i]), startY);
            });

                 // Draw rows with text wrapping for each cell
            doc.font('Helvetica');
            for (let i = 1; i < tableRows.length; i++) {
                const row = tableRows[i];
                let rowHeight = 0;

                // Calculate the height of each cell in the row
                row.forEach((cell, j) => {
                    const cellHeight = doc.heightOfString(cell, {
                        width: columnWidths[j]
                    });
                    rowHeight = Math.max(rowHeight, cellHeight);
                });

                // Draw each cell in the row, and wrap text if needed
                row.forEach((cell, j) => {
                    doc.text(cell, startX + (j * columnWidths[j]), currentY, {
                        width: columnWidths[j],
                        lineBreak: true
                    });
                });

                currentY += rowHeight + 10; // Move down by the tallest cell's height, with added padding
            }
        
            doc.end();
        })
    })

    .post('/events', (req,res)=>{ //Stores events from the client-side
        const{title,from,to,scope, day, name} = req.body
        let dateToUse = new Date(day)
        
        dateToUse.toISOString().split('T')[0].substring(0,10)
        console.log(dateToUse)
        const sql = `INSERT INTO events (Event, Date, Time_From, Time_To, Scope, Name) VALUES (?,?,?,?,?,?)`
        connection.query(sql,[title,dateToUse,from,to,scope, name], (err,results)=>{
            if(err){
                console.log(err)
            }
        })
    })

    .get('/getEvents', (req, res)=>{ //Returns events to the client-side
        const name = req.query.name
        const sql = `SELECT * FROM events WHERE Name = ? OR Scope = "public"`
        connection.query(sql,[name], (err,results)=>{
            if(err){
                console.log(err)
            }
            res.json(results)
        })
    })

    .get('/getEventsDashboard', (req, res)=>{ //Gets events for the upcoming events feature and sorts them from latest to oldest
        const name = req.query.name
        const sql = `SELECT * FROM events WHERE (Name = ? OR Scope = "public") AND Date >= CURRENT_DATE ORDER BY Date DESC`
        connection.query(sql,[name], (err,results)=>{
            if(err){
                console.log(err)
            }
            res.json(results)
        })
    })
    

    .post('/removeEvent', (req, res)=>{ //Removes events and prevents for a public event to be deleted
        const{title, name, date} = req.body
        let dateToUse = new Date(date)
        let formattedDate = dateToUse.toISOString().split('T')[0];
        const sql2 = `SELECT Scope FROM events WHERE Event = ? AND Date = ?`
        const sql3 = `DELETE FROM events WHERE Name = ? AND Event = ? AND Date = ?`
        connection.query(sql2, [title, formattedDate], (err, results)=>{
            if(err){
                console.log(err)
            }
            if(results[0].Scope=='public'){
                res.json({match:false})
            }
            else{
                res.json({match:true})
                connection.query(sql3, [name, title, formattedDate], (err, results)=>{
                    if(err){
                        console.log(err)
                    }
                })
            }
        })
    })

    .get('/getDuty', (req, res)=>{ //Gets duties for dashboard display
        const name = req.query.name
        const sql = `SELECT * FROM duties WHERE Name = ?`
        connection.query(sql,[name], (err,results)=>{
            if(err){
                console.log(err)
            }
            res.json(results)
        })
    })

    .post('/announcements', (req,res)=>{ //Stores announcements made by head prefects in the database
        const text1 = req.body.text
        const date1 = new Date()
        const adjustedDate = new Date(date1.getTime()+(3*60*60*1000))

        const date = adjustedDate.toISOString().split('T')[0]
        const time = adjustedDate.toISOString().split('T')[1].split('.')[0];

        const sql = `INSERT INTO announcements (Announcement, Date, Time) VALUES (?,?,?)`
        connection.query(sql,[text1,date,time], (err,results)=>{
            if(err){
                console.log(err)
            }
        })
        res.json({match:true})

    })

    .get('/getAnnouncement', (req,res)=>{ //Returns announcements in order of latest to oldest back to the client-side for the latest announcement feature
        const sql = `SELECT * FROM announcements ORDER BY Time DESC`
        connection.query(sql, (err, results)=>{
            if(err){
                return res.status(500).json({ error: 'Database query failed' });
            }
            if(results.length === 0){
                return res.json({none:true})
            }
            res.json(results)
        
        })
    })

    .get('/getDList', (req,res)=>{ //Returns names of students with lunch-detention for display on the detention-list
        const sql = `SELECT Name FROM lunch_detention WHERE Attendance = 0`
        connection.query(sql, (err, result)=>{
            if (err){
                console.log(err)
            }
            if(result.length>10){ //If more than 10 students have a lunch-detention, only half are sent back to the client-side to allow for better management for detention prefects
                const halfLength = Math.ceil(result.length / 2);

                const halfResult = result.slice(0, halfLength);

                res.json(halfResult)
            }
            else{
                res.json(result)
            }
        
        })
        
    })

    .post('/DAttendance', (req,res)=>{ //Detention attendance handler
        const{attended} = req.body
        attended.forEach((name)=>{
            const sql = `UPDATE lunch_detention SET Attendance = 1 where Name = ?`
            connection.query(sql,[name],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })

        })

    })

    .get('/getRequests', (req, res)=>{
        const sql = `SELECT Name FROM login_info WHERE Status = 'TBD'`
        connection.query(sql, (err, result)=>{
            res.json(result)
        })

    })

    .post('/postApproval', (req, res)=>{
        const {name, status} = req.body
        const sql = `UPDATE login_info SET Status = ? WHERE Name = ?`
        connection.query(sql, [status, name], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
    })

    .post('/rejectApproval', (req, res)=>{
        const {name} = req.body
        const sql = `DELETE FROM login_info WHERE Name = ?`
        connection.query(sql, [name], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
    })

    .get('/getProfiles', (req,res)=>{
        const sql = `SELECT login_info.Name, login_info.Status, login_info.classAllocation, students.Class FROM login_info JOIN students ON login_info.Name = students.Full_Name WHERE Status != 'TBD' AND Name != 'Admin'` 
        const sql2 = `SELECT Name, Duty, DateofDuty FROM duties`

        connection.query(sql, (err, resultsAll)=>{
            connection.query(sql2, (err, resultsDuty)=>{
                res.json({resultsAll, resultsDuty})
            })
    
        })
        
       
    })

    .post('/ClassAllocations', (req,res)=>{
        const {newClass, name} = req.body
        const sql = `UPDATE login_info SET classAllocation = ? WHERE Name = ?`

        connection.query(sql, [newClass, name], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
            
        
    })

    .post('/newDuties', (req,res)=>{
        const {oldDuty, newDuty, date, name} = req.body
        let oldDutyRevised = oldDuty.split('-')[0]

        const sql = `UPDATE duties SET Duty = ?, DateofDuty = ? WHERE Name = ? AND Duty = ?`

        connection.query(sql, [newDuty, date, name, oldDutyRevised.trim()], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
    })

    .post('/removeDuty', (req,res)=>{
        const {duty, name} = req.body
        let oldDutyRevised = duty.split('-')[0]
        

        const sql = `DELETE FROM duties WHERE Name = ? AND Duty = ?`

        connection.query(sql, [name, oldDutyRevised.trim()], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
    })

    .post('/addDuty', (req,res)=>{
        const {name, duty} = req.body

        const sql = `INSERT INTO duties (Name, Duty, DateofDuty) VALUES (?,?,?)`

        connection.query(sql, [name, duty, null], (err, results)=>{
            if(!err){
                res.json({match:true})
            }
        })
    })

    .get('/getQuote', (req, res)=>{
        res.json({quoteOftheDay: quote})
    })


    .listen(port, ()=>console.log("Server listening on port: ", port))


#!/usr/bin/env node
const NamishDB = "NamishDB";
const yargs = require("yargs");
const fs = require("fs");
const dns = require('dns');
const { toNamespacedPath } = require("path");
const { DefaultDeserializer } = require("v8");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { exit } = require("process");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const usage = "\nUsage: Coming soon...";const options = yargs  
      .usage(usage)                                                                                                 
      .help(true)  
      .argv;
const mainArgue = String(process.argv[2]);
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
if(mainArgue === "start") {
    readline.close();
    console.log("NamishDB Process: Starting your NamishDB server. Please wait for a moment...");
    fs.readFile('config.json',
    function(err, data) {       
        if (err) {
            console.error("NamishDB Process: Unable to find configuration file config.json. Error: <NamishDB.Error.NoConfigFile>");
            exit(1);
        };
        const mainObj = JSON.parse(data.toString('utf8'));
        const serverMode = mainObj["server"]["mode"];
        if(serverMode === "development") {
            console.log("\nNamishDB Process: Starting your NamishDB development server. Please wait just for a moment...");
            const serverIPAddress = mainObj["server"]["ipAddress"];
        const serverPort = mainObj["server"]["port"];
        if(serverIPAddress === undefined || serverIPAddress === null || serverIPAddress === false || serverIPAddress === NaN) {
            return console.log("\nNamishDB Error: Expected a valid IP address to start the database server on. Error: <NamishDB.Error.NotaValidIPaddress>");
        }
        
        if(serverPort === undefined || serverPort === null || serverPort === NaN || serverPort > 30000) {
             return console.log("\nNamishDB Error: Expected a valid port number to start the DB server on Error: <NamishDB.Error.InvalidPortNumber>");
        }

        const serverPassword = mainObj["auth"]["password"];
        
        if(serverPassword.length < 10) {
            return console.log("\nNamishDB Error: The password for your NamishDB server is too short! Error: <NamishDB.Error.ShortPassword>");
        } 

        if(serverPassword === undefined || serverPassword === null) {
            return console.log("\nNamishDB Error: Expected a valid DB password for your NamishDB server. Error: <NamishDB.Error.InvalidPassword>");
        }

        const readAccess = mainObj["auth"]["read"];

        const writeAccess = mainObj["auth"]["write"];

        app.set('port', serverPort);

        app.listen(app.get('port'));
        if(serverPort === 80) {
            console.log(`\nNamishDB Process: NamishDB Database server has started on port ${serverPort} and on ip address ${serverIPAddress}. To access, use http://${serverIPAddress}/`);
        }else{
        console.log(`\nNamishDB Process: NamishDB Database server has started on port ${serverPort} and on ip address ${serverIPAddress}. To access, use http://${serverIPAddress}:${serverPort}`);
        }
            app.get("/", function (req, res){
                res.end(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                  <meta name="viewport" content="width=device-width, initial-scale = 1.0">
                  <title>Welcome to NamishDB</title>
                  </head>
                  <style>
                  html {
                    font-family: Arial, Helvetica, sans-serif;
                  }
                  .namishButton {
    background-color: #ff0077;
    color: white;
    outline: none;
    border: none;
    height: 60px;
    font-size: 20px;
    border-radius: 360px;
    width: 10em;
}
.namishButton:hover {
    background-color: #d30063;
    color: white;
    outline: none;
    border: none;
    height: 60px;
    font-size: 20px;
    border-radius: 360px;
    width: 10em;
}
                  </style>
                  <body>
                  <h1>NamishDB</h1>
                  <p>The database server built to ease DBMS (Database Management System).</p>
                  <h1>How does NamishDB work?</h1>
                  <p>NamishDB Stores data in the form of JSON (JavaScript Object Notation). In fact, NamishDB has been built using JavaScript</p>
                  <p>For more information, Go to <a href="https://db.namishkumar.in/">https://db.namishkumar.in/</a></p>
                  </body>
                  </html>
                `)
           });
           app.post("/verify", function (req, res){
            const data = req.body;
            if(req.body.password === serverPassword) {
               res.end("400");
            }else{
                res.end("300");
            }
       });
       app.get("/sample", function(req, res){
        res.end(`
        <!DOCTYPE html>
              <html>
              <head>
              <meta name="viewport" content="width=device-width, initial-scale = 1.0">
              <title>NamishDB Sample</title>
              </head>
              <style>
              html {
                font-family: Arial, Helvetica, sans-serif;
              }
              </style>
              <body>
              <h1>NamishDB Sample</h1>
              <form method="post" action="fetch">
              <input placeholder="Document Name" name="document">
              <br>
              <br>
              <input placeholder="Collection Name" name="collection">
              <br>
              <br>
              <input name="password" value="${serverPassword}" hidden>
            <button type="submit">Fetch Data from server</button>
            </form>
              </body>
              </html>
              `);
       });
       app.post("/connect", function (req, res){
        const data = req.body;
        const password = req.body.password;
        console.log("NamishDB Process: Connection request from IP address " + req.ip);
        if(password === serverPassword) {
            res.end(`
            <!DOCTYPE html>
                  <html>
                  <head>
                  <meta name="viewport" content="width=device-width, initial-scale = 1.0">
                  <title>NamishDB Server Status</title>
                  </head>
                  <style>
                  html {
                    font-family: Arial, Helvetica, sans-serif;
                  }
                  </style>
                  <body>
                  <h1>NamishDB Connection</h1>
                  <p>Connection Successful! Manage your server here.</p>
                  <hr>
              <h1>Password Change</h1>
              <p>Change the password of your server</p>
              <form action="/changePassword" method="post">
              <input name="password" placeholder="Enter a strong password" value="${serverPassword}">
              <button type="submit>Change the password</button>
              </form>
                  </body>
                  </html>
            `);
        }else{
            res.end(`
            <!DOCTYPE html>
                  <html>
                  <head>
                  <meta name="viewport" content="width=device-width, initial-scale = 1.0">
                  <title>NamishDB Server Status</title>
                  </head>
                  <style>
                  html {
                    font-family: Arial, Helvetica, sans-serif;
                  }
                  </style>
                  <body>
                  <h1>NamishDB Connection</h1>
                  <p>Connection failed because of wrong password! Please try again!</p>
                  </body>
                  </html>
                  `);
        }
   });
   app.post("/fetch", function (req, res){
       const body = req.body;
       console.log("NamishDB Process:  Connection request from IP address " + req.ip);
       const password = body.password;
       const collection = body.collection;
       const document = body.document;
       if(serverPassword === password) {
           try {
                console.log("NamishDB Connector: Sending data to IP address " + req.ip);
                const path = "databaseSource/src/" + collection + "/" + document + "/";
                fs.readFile(path + 'data.json',
    function(err, data) {       
        if (err) res.json({
            type: "error",
            why: "Invalid Database reference",
            exp: "Data not found"
        });
        res.json(JSON.parse(data));
    });
           }catch(e) {
              
           }       
       }
   });
   app.post("/write", function (req, res){
      const password = req.body.password;
      const document = req.body.document;
      const collection = req.body.collection;
      const data = req.body.data;
      if(collection === null || collection === undefined || document === null || document === undefined || collection === "" || document === "") {
         res.json({
            type:"error",
            why:"Invalid Database reference",
            message: "Invalid Database reference",
            exp:"Invalid collection or document name"
         });
      }else{
        const path = "databaseSource/src/" + collection + "/" + document + "/";
        fs.writeFile(path + "data.json", data, (err) => {
            if (err)
              console.log("NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>");
            else {
               console.log("NamishDB Process: Successfully written your document");
               res.json({
                 type:"success",
                 document:document,
                 collection:collection,
                 dbReference: path,
                 by: NamishDB,
                 message: "Successfully added your data to the Database. Kindly proceed",               
                });
            }
          });
      }
   });
        }else if(serverMode === "production") {
            readline.close();
            console.log("\nNamishDB Process: Starting your NamishDB production server. Please wait just for a moment...");
            const serverIPAddress = mainObj["server"]["ipAddress"];
        const serverPort = mainObj["server"]["port"];
        if(serverIPAddress === undefined || serverIPAddress === null || serverIPAddress === false || serverIPAddress === NaN) {
            return console.log("\nNamishDB Error: Expected a valid IP address to start the database server on. Error: <NamishDB.Error.NotaValidIPaddress>");
        }
        
        if(serverPort === undefined || serverPort === null || serverPort === NaN || serverPort > 30000) {
             return console.log("\nNamishDB Error: Expected a valid port number to start the DB server on Error: <NamishDB.Error.InvalidPortNumber>");
        }

        const serverPassword = mainObj["auth"]["password"];

        if(serverPassword === undefined || serverPassword === null) {
            return console.log("\nNamishDB Error: Expected a valid DB password for your NamishDB server. Error: <NamishDB.Error.InvalidPassword>");
        }
        
        if(serverPassword.length < 10) {
            return console.log("\nNamishDB Error: The password for your NamishDB server is too short! Error: <NamishDB.Error.ShortPassword>");
        }

        const readAccess = mainObj["auth"]["read"];

        const writeAccess = mainObj["auth"]["write"];

        app.set('port', serverPort);

        app.listen(app.get('port'));
        if(serverPort === 80) {
            console.log(`\nNamishDB Process: NamishDB Database server has started on port ${serverPort} and on ip address ${serverIPAddress}. To access, use http://${serverIPAddress}/`);
        }else{
        console.log(`\nNamishDB Process: NamishDB Database server has started on port ${serverPort} and on ip address ${serverIPAddress}. To access, use http://${serverIPAddress}:${serverPort}`);
        }
        app.get("/", function (req, res){
             
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
              <meta name="viewport" content="width=device-width, initial-scale = 1.0">
              <title>NamishDB Server Status</title>
              </head>
              <style>
              html {
                font-family: Arial, Helvetica, sans-serif;
              }
              .namishButton {
background-color: #ff0077;
color: white;
outline: none;
border: none;
height: 60px;
font-size: 20px;
border-radius: 360px;
width: 10em;
}
.namishButton:hover {
background-color: #d30063;
color: white;
outline: none;
border: none;
height: 60px;
font-size: 20px;
border-radius: 360px;
width: 10em;
}
              </style>
              <body>
              <h1>NamishDB Admin Tools</h1>
              <form method="post" action="/connect">
              <p>Please enter the password of your server to connect</p>
              <input name="password" placeholder="password">
              <button type="submit">Connect now</button>
              </form>
              </body>
              </html>
            `)
       });
       app.post("/verify", function (req, res){
        const data = req.body;
        if(req.body.password === serverPassword) {
           res.end("400");
        }else{
            res.end("300");
        }
   });
   app.post("/connect", function (req, res){
    const data = req.body;
    const password = req.body.password;
    if(password === serverPassword) {
        res.end(`
        <!DOCTYPE html>
              <html>
              <head>
              <meta name="viewport" content="width=device-width, initial-scale = 1.0">
              <title>NamishDB Server Status</title>
              </head>
              <style>
              html {
                font-family: Arial, Helvetica, sans-serif;
              }
              </style>
              <body>
              <h1>NamishDB Connection</h1>
              <p>Connection Successful! Manage your server here.</p>
              <hr>
              <h1>Password Change</h1>
              <p>Change the password of your server</p>
              <form action="/changePassword" method="post">
              <input name="password" placeholder="Enter a strong password" value="${serverPassword}">
              <button type="submit>Change the password</button>
              </form>
              </body>
              </html>
        `);
    }else{
        res.end(`
        <!DOCTYPE html>
              <html>
              <head>
              <meta name="viewport" content="width=device-width, initial-scale = 1.0">
              <title>NamishDB Server Status</title>
              </head>
              <style>
              html {
                font-family: Arial, Helvetica, sans-serif;
              }
              </style>
              <body>
              <h1>NamishDB Connection</h1>
              <p>Connection failed because of wrong password! Please try again!</p>
              </body>
              </html>
              `);
    }
});
app.post("/fetch", function (req, res){
    const body = req.body;
    console.log("NamishDB Process:  Connection request from IP address " + req.ip);
    const password = body.password;
    const collection = body.collection;
    const document = body.document;
    if(serverPassword === password) {
        try {
             console.log("NamishDB Connector: Sending data to IP address " + req.ip);
             const path = "databaseSource/src/" + collection + "/" + document + "/";
             fs.readFile(path + 'data.json',
 function(err, data) {       
     if (err) res.json({
         type: "error",
         why: "Invalid Database reference",
         exp: "Data not found"
     });
     res.json(JSON.parse(data));
 });
        }catch(e) {
           
        }       
    }
});
app.post("/write", function (req, res){
   const password = req.body.password;
   const document = req.body.document;
   const collection = req.body.collection;
   const data = req.body.data;
   if(collection === null || collection === undefined || document === null || document === undefined || collection === "" || document === "") {
      res.json({
         type:"error",
         why:"Invalid Database reference",
         message: "Invalid Database reference",
         exp:"Invalid collection or document name"
      });
   }else{
     const path = "databaseSource/src/" + collection + "/" + document + "/";
     fs.writeFile(path + "data.json", data, (err) => {
         if (err)
           console.log("NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>");
         else {
            console.log("NamishDB Process: Successfully written your document");
            res.json({
              type:"success",
              document:document,
              collection:collection,
              dbReference: path,
              by: NamishDB,
              message: "Successfully added your data to the Database. Kindly proceed",               
             });
         }
       });
   }
});
        }else{
            return console.log("\nNamishDB Error: No such server mode. Please enter a valid server mode. Error : <NamishDB.Errors.NoSuchConfigError>");
        }

        
        
    });
}
if(mainArgue === "connect") {
       
}

if(mainArgue === "setup") {
    const configObj = {
        "server": {
            "mode": null,
            "ipAddress": null,
            "port": null
        },
    
        "auth" : {
            "password": null,
            "authToken" : {
                 "token" : null
            },
            "read": null,
            "write": null,
            "user": null
        },
    
        "logs": {
            "show": null
        }
    };
     console.log("Welcome to NamishDB. Let's get started with your setup of the Database server. Kindly follow the instructions.\n");
     askNow();
     function askNow() {
        readline.question('Please choose your server mode. If you are a beginner, then development mode is recommended. \n1. Development\n2. Production \n Enter here: ', option1 => {
            if(option1 === "1") {
               continueNow("development");
            }else if(option1 == "2") {
                continueNow("droduction");
            }else if(option1 == "no"){
                 console.log("NamishDB Process: Successfully exited the setup of NamishDB server.");
                 exit(0);
            }else{
                console.error("Sorry, Invalid Input received! Please try again! To exit, type 'no'\n");
                askNow();
            }
          });
     }

     function continueNow(mode) {
        console.log(`\nNamishDB Setup: ${mode} mode has been selected`)
        readline.question('\nPlease enter the host name or IP address of your NamishDB server\nEnter here: ', userIP => { 
             if(userIP === null || userIP.length === 0 || userIP === "" || userIP === undefined || userIP === NaN) {
                console.error("Sorry, Invalid Input received! Please try again! To exit, type 'no'\n");
                continueNow(mode);
             }else{
                 console.log(`\nNamishDB Setup: ${userIP} IP address or hostname has been choosen for the NamishDB server`);
                 askPort(mode, userIP);
             }
        })
     }

}

function askPort(mode, userIP) {
    readline.question('\nPlease enter the port number of your NamishDB server\nEnter here: ', userPort => {
        if(userPort === null || userPort === undefined || userPort.length === 0 || userPort === "" || Number(userPort) === undefined || Number(userPort) === null || Number(userPort) === NaN) {
             console.error("Sorry, Invalid Input received! Please try again! To exit, type 'no'\n");
             askNow(mode, userIP);
        }else{
             const port = Number(userPort);
             console.log(`\nNamishDB Setup: ${port} will be the port for your NamishDB server. Let's proceed!`);
             askPassword(mode, userIP, userPort);
        }     
    });
}

function askPassword(mode, userIP, userPort) {
    readline.question("\nPlease enter a secure password to encrypt your NamishDB server\nEnter here: ",  userPass => {
        if(userPass === undefined || userPass === null || userPass === Infinity || userPass == NaN || userPass.length < 10) {
            console.error("NamishDB Setup Error: The password is Invalid. Please enter a valid password!");
            askPassword(mode, userIP, userPort);
        }else{
            reAsk();
            function reAsk() {
                readline.question("\nPlease Re-enter the password for your NamishDB Server\nEnter here: ",  userREPass => { 
                    if(userREPass === undefined || userREPass === null || userREPass === Infinity || userREPass == NaN || userREPass.length < 10) {
                        console.error("NamishDB Setup Error: The password is Invalid. Please enter a valid password!");
                        reAsk();
                    }else if(userREPass === userPass) {
                        console.log(`\nNamishDB Setup: The password for your NamishDB server has been set to ${userPass}. Don't share it to anyone!`);
                        console.log(`\nNamishDB Setup: Please wait while the setup for your NamishDB server is completed...`);
                        completeSetup(mode, userIP, userPort, userPass);
                    }
                });
            }
        }
    }) ;
}

function completeSetup(mode, userIP, userPort, userPass) {
    const configObject = {
        "server": {
            "mode": mode,
            "ipAddress": userIP,
            "port": userPort
        },
    
        "auth" : {
            "password": userPass,
            "authToken" : {
                 "token" : null
            },
            "read": true,
            "write": true,
            "user": null
        },
    
        "logs": {
            "show": true
        }
    };
   
    fs.writeFile('config.json', JSON.stringify(configObject), function (err) {
        if (err) {
            console.error(`NamishDB Setup Error: Unable to create configuration file. Error: <NamishDB.Error.UnableToWriteConfigFile>`);
        };
         
        console.log('NamishDB Process: Setup has been successfully completed. This is the configuration for your server: ');
        console.log(configObject);
        exit(0);
      });
}

if(mainArgue === undefined || mainArgue === null || mainArgue === NaN || process.argv[1].length === 0) {
    readline.close();
    return console.error("NamishDB Error: No CLI arguments received. Error: <NamishDB.Error.NoCLI<NullArguments>>")
}
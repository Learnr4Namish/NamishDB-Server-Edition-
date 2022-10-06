#!/usr/bin/env node
const NamishDB = "NamishDB";
const yargs = require("yargs");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
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

       app.post("/checkIfExists", function(req,res) {
            const body = req.body;
            const document = body.document;
            const collection = body.collection;
            const password = body.password;
            const data = body.data;
            if(password === serverPassword) {
                const path = "databaseSource/src/" + collection + "/" + document + "/";
                if (fs.existsSync(path)) {
                    res.json({type:"error", message:"NamishDB Server error: The document and collection already exists! Please try again!"});
                }else{
                    fs.writeFile(path + "data.json", data, (err) => {
                        if (err) {
                          console.log("NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>");
                          res.json({type:"error", message:"NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>"});
                        } else {
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
            }else{
                res.json({type:"error", message:"NamishDB Authentication Error: Invalid Password received! Please try again!"});
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
      console.log("NamishDB Process: Connection request from IP " + req.ip);
      if(password === serverPassword) {
        if(collection === null || collection === undefined || document === null || document === undefined || collection === "" || document === "") {
            res.json({
               type:"error",
               why:"Invalid Database reference",
               message: "Invalid Database reference",
               exp:"Invalid collection or document name"
            });
         }else{
           const path = "databaseSource/src/" + collection + "/" + document + "/";
           writeFile(path, data, function (err) {
            if(err) {
                console.error(err)
            }
            res.json({
                type:"success",
                document:document,
                collection:collection,
                dbReference: path,
                by: NamishDB,
                message: "Successfully added your data to the Database. Kindly proceed",               
               });
           })
           function writeFile(path, data, cb) {
            fs.mkdir(path, { recursive: true}, function (err) {
              if (err) return cb(err);
              fs.writeFile(path + "data.json", data, (err) => {
                if (err) {
                 console.log(err);
                  console.log("NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>");
                 }else {
                   console.log("NamishDB Process: Successfully written your document");
                }
              });
            });
          }
         }
      }else{
        res.json({type:"error", message:"Invalid DB password!"});
      }
   });
   // Make a post request to '<your_ip>/delete' to delete data from the DB
   app.post("/delete", function(req, res) {
        const body = req.body;
        console.log("NamishDB Process: Connection request from IP address " + req.ip);
        const password = body.password;
        const document = body.document;
        const collection = body.collection;
        const path = "databaseSource/src/" + collection + "/" + document + "/";
        if(password === serverPassword) {
            fs.unlink(path + "data.json", (err) => {
                if (err) {
                    res.json({type:"error", message:"Invalid Database Reference"});
                };
                res.json({type:"success", message:"The data was successfully removed from NamishDB"});
              });
        }else{
            res.json({type:"error", message:"NamishDB Client error: Invalid password. (The password is wrong.)"});
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
         if (err) {
           console.error(err);
           console.log("NamishDB Error: Unable to write to database <NamishDB.Error.UnableToWriteToDB>");
         } else {
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
// Make a post request to <your_ip>/delete to delete data from the DB
app.post("/delete", function(req, res) {
    const body = req.body;
    const password = body.password;
    const document = body.document;
    const collection = body.collection;
    const path = "databaseSource/src/" + collection + "/" + document + "/";
    if(password === serverPassword) {
        fs.unlink(path + "data.json", (err) => {
            if (err) {
                res.json({type:"error", message:"Invalid Database Reference"});
            };
            res.json({type:"success", message:"The data was successfully removed from NamishDB"});
          });
    }else{
        res.json({type:"error", message:"NamishDB Client error: Invalid password. (The password is wrong.)"});
    }
});
        }else{
            return console.log("\nNamishDB Error: No such server mode. Please enter a valid server mode. Error : <NamishDB.Errors.NoSuchConfigError>");
        }

        
        
    });
}
if(mainArgue === "connect") {
       let globalIP;
       let globalPass;
       console.log("NamishDB Client: Welcome to NamishDB Client Connector.");
       readline.question('\nPlease enter the host name or IP address of the NamishDB server **including HTTP or HTTPS** \nEnter here: ', serverEnteredIP => {
            continueByPassword(serverEnteredIP); 
       });

       function continueByPassword(serverEnteredIP) {
          console.log("\nNamishDB Client: Received the IP address of the DB server as " + serverEnteredIP);
          readline.question('\nPlease enter the password of the NamishDB server\nEnter here: ', serverEnteredPass => {
                 connectToServer(serverEnteredIP, serverEnteredPass);
          });
       }

       function connectToServer(serverEnteredIP, serverEnteredPass) {
          console.log("\nNamishDB Client: Received the password as " + serverEnteredPass);
          console.log("\nNamishDB Connector: Trying to connect to " + serverEnteredIP + " . Please wait for a moment...");
          axios.post(serverEnteredIP + "/verify", {
              password:serverEnteredPass,
          })
          .then((response) => {
             continueConnection(response.data, serverEnteredIP, serverEnteredPass);
          }, (error) => {
            if(String(error) === "TypeError [ERR_INVALID_URL]: Invalid URL") {
                console.log("NamishDB Connector: Invalid NamishDB URL! Error: <NamishDB.ClientError.InvalidURL>. For Error logs, kindly have a look at the NamishDB_client_error.log file")
                exit(1);
            }

            if(String(error) === "Error: getaddrinfo ENOTFOUND verify" || String(error) === "Error: getaddrinfo ENOTFOUND .") {
                console.log("NamishDB Connector: Unable to get information about the IP address. Error: <NamishDB.ClientError.ENOTFOUND>. For Error logs, kindly have a look at the NamishDB_client_error.log file");
            }
            
            fs.writeFile("NamishDB_client_error.log", "NamishDB Client Error: [ Latest Time (Now) ]\nNodeJS Error (Error.Type.Internal <Maybe Client or Server-side>)\n" + error, (err) => {
                if (err) throw err;
            });
            console.log(error);
          });
       }

       function continueConnection(mainRes, serverEnteredIP, serverEnteredPass) {
        globalIP = serverEnteredIP;
        globalPass = serverEnteredPass;
          if(String(mainRes) === "400") {
            console.log("NamishDB Client: Connected to " + serverEnteredIP + " successfully. Go to https://db.namishkumar.in/db/client.html for known commands.");
            askCommand(String(mainRes), serverEnteredIP, serverEnteredPass);
          }else{
            console.log("NamishDB Client: Failed to connect to NamishDB server. This may be probably because of invalid password. Please try again!");
            exit(1);
          }
       }

       function askCommand(mainRes, serverEnteredIP, serverEnteredPass) {
          readline.question('\nThese are the options. Press:- \n1. To add some data\n2. To delete some data\n3. To stop the server\n4. To restart the server\n5. To disconnect from the server\nEnter here: ', pressedMenu => {
              if(pressedMenu === undefined || pressedMenu === null || pressedMenu === Infinity || pressedMenu === NaN || pressedMenu.length === 0 || pressedMenu === "" || pressedMenu === 0) {
                 console.log("\nSorry, Invalid Command received. Please try again!");
                 askCommand(mainRes, serverEnteredIP, serverEnteredPass);
              }else{
                  reactToCommand(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu);
              }
          });
       }

       function reactToCommand(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu) {
             if(pressedMenu === "1") {
                  console.log("\nTrying to reconnect to " + serverEnteredIP);
                  askCollection(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu);
             }
       }

       function askCollection(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu) {
        readline.question('\nPlease enter the name of the collection.\nEnter here: ', serverEnteredCollection => { 
             if(serverEnteredCollection === null || serverEnteredCollection === undefined || serverEnteredCollection === NaN || serverEnteredCollection === "" || serverEnteredCollection.length === 0) {
                 console.log("\nInvalid Collection name. Please try again!");
                 askCollection(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu);
             }else{
                 console.log(`\nNamishDB Client: Received the collection name as ${serverEnteredCollection}`);
                 askDocument(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection);
             }
        });
       }

       function askDocument(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection) {
        readline.question('\nPlease enter the name of the document.\nEnter here: ', serverEnteredDocument => {
            if(serverEnteredDocument === null || serverEnteredDocument === undefined || serverEnteredDocument === NaN || serverEnteredDocument === "" || serverEnteredDocument.length === 0) {
                console.log("\nInvalid Document name. Please try again!");
                askDocument(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection);
            }else{
                console.log(`\nNamishDB Client: Received the Document name as ${serverEnteredDocument}`);
                console.log("\nNamishDB Client Connector Process: Initialising Data service...");
                askForData(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection, serverEnteredDocument)
            }
        });
       }

       function askForData(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection, serverEnteredDocument) {
        readline.question('\nPlease choose the required option\n1. To add data from a JSON file\n2. To add data by regular method\nEnter here: ', opType => {
            if(opType === undefined || opType === null || opType === NaN || opType === Infinity || opType === "" || opType.length === 0) {
                console.log("\nInvalid Input received! Please try again!");
                askForData(mainRes, serverEnteredIP, serverEnteredPass, pressedMenu, serverEnteredCollection, serverEnteredDocument);
            }else{
                if(opType === "2") {
                    console.log("\nNamishDB: Please wait...");
                    askForDataByRegularMethod(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument);
                }
            }
        });
     }
      
     let noOfDataNow = 0;
     let noOfMainData = 0;
     let dataInOBJ = {};
     function askForDataByRegularMethod(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument) {
        readline.question('\nHow many data do you want to add in this DB reference?\nEnter here: ', noOfDataToBeAdded => { 
            if(noOfDataToBeAdded === undefined || noOfDataToBeAdded === NaN || noOfDataToBeAdded === null || noOfDataToBeAdded === Infinity || noOfDataToBeAdded === "") {
                console.error("Sorry, Expected a valid number but got null! Please try again!");
                askForDataByRegularMethod(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument);
            }else{
                const toAddData = Number(noOfDataToBeAdded);
                noOfMainData += toAddData;
                console.log(`A total of ${noOfMainData} data/properties can be added as per your instructions`);
                askForMainDataNow(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument);
            }
        }); 
     }
     
     function askForMainDataNow(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument) {
        readline.question('\nEnter the name of the data\nEnter here: ', mainDataProperty => { 
            if(mainDataProperty === undefined || mainDataProperty === NaN || mainDataProperty === null || mainDataProperty === Infinity || mainDataProperty === "") {
                console.error("Sorry, Invalid data received! Please try again!");
                askForMainDataNow(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument);
            }else{
                askForDataValue(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument, mainDataProperty);
            }
        });
     }

     function askForDataValue(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument, mainDataProperty) {
        readline.question('\nEnter the value/string of the data\nEnter here: ', mainDataValue => { 
            if(mainDataValue === undefined || mainDataValue === NaN || mainDataValue === null || mainDataValue === Infinity || mainDataValue === "") {
                console.error("Sorry, Invalid data received! Please try again!");
                askForDataValue(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument, mainDataProperty);
            }else{
                tryToAddTheData(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument, mainDataProperty, mainDataValue);
            }
        });
     }

     function tryToAddTheData(serverEnteredIP, serverEnteredPass, serverEnteredCollection, serverEnteredDocument, mainDataProperty, mainDataValue) {
          if(noOfMainData === 0 || noOfDataNow === 0 || noOfDataNow <= (noOfMainData - 1)) {
              dataInOBJ += {
                 [mainDataProperty] : mainDataProperty
              };
              noOfDataNow ++;
              console.log(`\n${noOfDataNow} has been added till now. Asking more data...`);
              askForMainDataNow(serverEnteredPass, serverEnteredCollection, serverEnteredDocument);
          }else if(noOfDataNow === noOfMainData) {
              console.log("\nYour data will look like this:- ");
              console.log("\n");
              console.log(JSON.stringify(dataInOBJ));
              console.log(`\nRequesting the server to add all the data/properties`);
              console.log("\nConnecting " + globalIP);
              axios.post(globalIP + "/write", {
                password:globalPass,
                document: serverEnteredPass,
                collection: serverEnteredIP,
                data: dataInOBJ,
            })
            .then((response) => {
                if(response.data.type === 'error') {
                    console.error("\nNamishDB Error: " + response.data.message);
                    exit(1);
                }else{
                    console.log(response.data.message);
                }
             }, (error) => {
                console.error(error);
             });
             
          }
     }
        
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
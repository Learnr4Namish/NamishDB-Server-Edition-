#!/usr/bin/env node
const yargs = require("yargs");
const fs = require("fs");
const dns = require('dns');
const { toNamespacedPath } = require("path");
const { DefaultDeserializer } = require("v8");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const usage = "\nUsage: Coming soon...";const options = yargs  
      .usage(usage)                                                                                                 
      .help(true)  
      .argv;
const mainArgue = String(process.argv[2]);
if(mainArgue === "start") {
    console.log("NamishDB Process: Starting your NamishDB server. Please wait for a moment...");
    fs.readFile('config.json',
    function(err, data) {       
        if (err) throw err;
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

   });
        }else if(serverMode === "production") {
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
        }else{
            return console.log("\nNamishDB Error: No such server mode. Please enter a valid server mode. Error : <NamishDB.Errors.NoSuchConfigError>");
        }

        
        
    });
}
if(mainArgue === "connect") {

}
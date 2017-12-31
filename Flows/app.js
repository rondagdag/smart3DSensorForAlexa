var http = require('http'); 
var express = require("express"); 
var RED = require('node-red'); 
var path = require('path'); 
// Create express app 
var app = express(); // Get current root folder 
global.appRoot = path.resolve(__dirname); // Add a simple route for static content served from 'public' 

app.use("/public", express.static("www")); // Create a serer 
var server = http.createServer(app); // Create a settings object - see default settings.js file for other options 
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/",
    userDir:".nodered/",
    flowFile: appRoot + '/flows.json'
};
RED.init(server, settings); // Serve the editor UI from /red 
app.use(settings.httpAdminRoot,RED.httpAdmin); // Serve the http nodes UI from /api 
app.use(settings.httpNodeRoot,RED.httpNode); 
server.listen(8080); 
// Start the runtime 
RED.start(); 


module.exports = app;
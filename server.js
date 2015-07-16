var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    bcrypt = require("bcrypt"),
    salt = bcrypt.genSaltSync(10),
    ejs = require("ejs"),
    User = require("./models/user.js");

//mongoose connection
mongoose.connect("mongodb://localhost/test");

//set view engine for server-side templating
app.set("view engine", "ejs");

//middleware
app.use(bodyParser.urlencoded({extended: true}));

//set session
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: "SuperSecretCookie",
  cookie: { maxAge: 60000}
}));

//manage sessions
app.use("/", function(req, res, next){
  //saves userId in session for logged in user
  req.login = function (user) {
    req.session.userId = user.id;
  };

  req.currentUser = function(callback) {
    User.findOne({_id: req.session.userId}, function(err, user){
      req.user = user;
      callback(null, user);
    });
  };
  // destroy session.userId to log out user
  req.logout = function() {
    req.session.userId = null;
    req.user = null;
  };
  next();
});

//signup route
app.get("/signup", function(req, res){
  res.render("login");
});
//user submits the login form
app.post("/login", function (req, res){
  //grab user data
  var userData =  req.body.user;

  //call authenticate function to check if password user entered is correct
  User.authenticate(userData.email, userData.password, function(err, user){
    req.login(user);

    //redirect to user profile
    res.redirect("/profile");
  });
});
 
//GET user profile
app.get("/profile", function(req, res) {
  //find user currently logged in
  req.currentUser(function (err, user) {
    res.send("Welcome "+ user.email);
  });
});

//POST user
app.post("/users", function(req, res){
  //grab user data from params req.body
  var newUser = req.body.user;

  //create new user with secure password
  User.createSecure(newUser.email, newUser.password, function(err, user){
    res.send(user);
  });  
});


app.listen(3000, function(){
  console.log("server started on localhost:3000");
});





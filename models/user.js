var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    bcrypt = require("bcrypt");


var UserSchema = new Schema({
  email: String,
  passwordDigest: String
});


//create a new user with secure (hashed) password
UserSchema.statics.createSecure = function (email, password, callback){

  //put this in that so it doesn't lose context in  callback
  var that = this;

  //hash password user enters at sign up
  bcrypt.genSalt( function(er, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      console.log(hash);

        //create the new user save to db with hashed password
        that.create({
          email: email,
          passwordDigest: hash
        }, callback);
       });
    });
  };

//authenticate user when user logs in
UserSchema.statics.authenticate = function (email, password, callback){
  //find user by email entered at log in
  this.findOne({email: email}, function(err, user) {
    console.log(user);

    //thruow error if can't find user
    if(user === null){
      throw new Error("Can/'t find user with email" + email);

      //if found user, check if password is correct
    } else if( user.checkPassword(password)) {
      callback(null, user);
    }
  });
};

//compare password user enters with hashed password (passwordDigest)
UserSchema.methods.checkPassword = function (password){
  //run hashing algorithm(with salt) on password user enters in order 
  //compare with passwordDigest
  return bcrypt.compareSync(password, this.passwordDigest);
};



var User = mongoose.model("User", UserSchema);

module.exports = User;



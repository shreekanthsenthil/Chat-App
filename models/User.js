const bcrypt = require('bcryptjs')
const userCollection = require('../db').db().collection("users")
let connectCollection = require('../db').db().collection("connect")
const validator = require('validator')

let User = function(data) {
    this.data = data   
    this.errors = []
}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        if(this.data.username == "") {this.errors.push('You must provide an username');}
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){this.errors.push('Username can contain only Alphabets and numbers')}
        if(!validator.isEmail(this.data.email)) {this.errors.push('You must provide an valid email address');}
        if(this.data.password == "") {this.errors.push('You must provide a password');}
        if(this.data.password.length > 0 && this.data.password.length < 12) {this.errors.push('Passoword must be atleast 12 characters')}
        if(this.data.password.length > 50) {this.errors.push('Password cannot exceed 50 characters')}
        if(this.data.username.length > 0 && this.data.username.length <3){this.errors.push('Username must be atleast 3 characters')}
        if(this.data.username.length > 30) {this.errors.push('Username cannot exceed 30 characters')}
    
        //If username is valid then check if it's already taken
        if (this.data.username.length > 3 && this.data.username.length < 30 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await userCollection.findOne({username: this.data.username})
            if(usernameExists) {this.errors.push("That username is already taken.")}
        }
    
        //If email is valid then check if it's already taken
        if (validator.isEmail(this.data.email)) {
            let emailExists = await userCollection.findOne({email: this.data.email})
            if(emailExists) {this.errors.push("That email is already taken.")}
        }
        resolve();
    })
}

User.prototype.cleanUp = function() {
    //To check if it is a string
    if (typeof(this.data.username) != "string" ) {this.data.username = ""}
    if (typeof(this.data.email) != "string" ) {this.data.email = ""}
    if (typeof(this.data.password) != "string" ) {this.data.password = ""}

    // get rid of bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        //Validate Data
        console.log(this.data)
        this.cleanUp()
        await this.validate()
    
        //Save data to db
        if(!this.errors.length) {
            // hash password
            let salt = bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            let user = await userCollection.insertOne(this.data)

            await connectCollection.insertOne({userId: user.insertedId, connections: []})
            resolve();
        }
        else{
            reject(this.errors)
        }
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp();
        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
            this.data = attemptedUser
            resolve("Congrats");
        }
        else {
            reject('Invalid username / password ')
        }
    }).catch(function() {
        reject("Please try again later")
    })
    })    
}

module.exports = User
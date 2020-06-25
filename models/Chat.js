const userCollection = require('../db').db().collection("users")
const chatCollection = require('../db').db().collection("chat")
const { ObjectID } = require('mongodb') 

let Chat = function(from, to, message, time) {
    this.data = {}
    this.data.from = from
    this.data.to = to
    this.data.message = message
    this.data.time = new Date(time)
    this.errors = []
}

Chat.prototype.validate = function() {
    return new Promise(async(resolve, reject) => {
        if(this.data.from == "") { this.errors.push('Invalid From') }
        if(this.data.to == "") { this.errors.push('Invalid To') }
        if(this.data.message == "") { this.errors.push('Invalid Message') }
        if(this.data.time == "") { this.errors.push('Invalid Time') }

        if(!this.errors.length){
            console.log('Checking')
            let fromUser = await userCollection.findOne({_id: new ObjectID(this.data.from)})
            let toUser = await userCollection.findOne({_id: new ObjectID(this.data.to)})
            if(!fromUser || !toUser) {
                this.errors.push('User doesnot exist')
                reject()
            }
            resolve()
        }
        reject()
    })
}

Chat.prototype.cleanUp = function() {
    if(typeof(this.data.from) != 'string') { this.data.from = "" }
    if(typeof(this.data.to) != 'string') { this.data.to = "" }
    if(typeof(this.data.message) != 'string') { this.data.message = "" }
}

Chat.prototype.newMessage = function() {
    return new Promise(async (resolve, reject) => {
        console.log("11")
        this.cleanUp()
        console.log('2')
        this.validate()
        console.log(this.errors)
        if(!this.errors.length){
            try{
                console.log('Inserting')
                this.encrypt()
                await chatCollection.insertOne(this.data) 
                resolve()
            } catch(e) {
                console.log(e)
                reject()
            }
        } else {
            console.log("ERROR")
            reject()
        }
    })
}

Chat.getMessages = function(userId, connectId) {
    return new Promise(async (resolve, reject) => {
        if(typeof(userId) != 'string' || typeof(connectId) != 'string') {
            reject()
        } else {
            let messages = await chatCollection.find({
                $or : [
                    { $and : [{from: userId}, {to: connectId}]},
                    { $and : [{from: connectId}, {to: userId}]}
                ]
            }).sort({time: 1}).toArray()
            resolve(messages)
        }
    })
}





module.exports = Chat
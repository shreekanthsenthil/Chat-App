const userCollection = require('../db').db().collection("users")
const chatCollection = require('../db').db().collection("chat")
const { ObjectID } = require('mongodb') 
const CryptoJS = require('crypto-js')
const dotenv = require('dotenv')
dotenv.config()

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

Chat.decryptMessage = function(messages) {
    messages = messages.map(messageDOC => {
        let bytes  = CryptoJS.AES.decrypt(messageDOC.message, process.env.CRYPTOKEY);
        messageDOC.message = bytes.toString(CryptoJS.enc.Utf8);
        return messageDOC
    })
    return messages
}

Chat.prototype.newMessage = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            this.data.message = CryptoJS.AES.encrypt(this.data.message, process.env.CRYPTOKEY).toString();
            await chatCollection.insertOne(this.data) 
            resolve()
        } else {
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
            messages = this.decryptMessage(messages)
            resolve(messages)
        }
    })
}





module.exports = Chat
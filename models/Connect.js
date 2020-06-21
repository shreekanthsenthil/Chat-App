let userCollection = require('../db').db().collection("users")
let connectCollection = require('../db').db().collection("connect")
let ObjectID = require('mongodb').ObjectID

let Connect = function (userId, connectId) {
    this.userId = userId
    this.connectId = connectId    
    this.errors = []
}

Connect.prototype.cleanUp = function() {
    if(typeof(this.userId) != "string") {
        this.userId = ""
        this.errors.push('Invalid user Id')
    }
    if(typeof(this.connectId) != "string") {
        this.connectId = ""
        this.errors.push('Invalid user Id')
    }
}

Connect.prototype.validate = async function() {
    //Does user exist
    let connectUser = await userCollection.findOne({_id: new ObjectID(this.connectId)})
    if(!connectUser){
        this.errors.push('User doesnot exist')
    }

    //Does Connection already exist
    this.userConnectionDoc = await connectCollection.findOne({userId: new ObjectID(this.userId)})
    let present = false
    this.userConnectionDoc.connections.some((connect) => {
        if(connect.equals(this.connectId)){
            present = true
            return true
        }
    })
    if(present){
        this.errors.push('Connection already exist')
    }

    present = false
    this.connectorConnectionDoc = await connectCollection.findOne({userId: new ObjectID(this.connectId)})
    this.connectorConnectionDoc.connections.some((connect) => {
        if(connect.equals(this.connectId)){
            present = true
            return true
        }
    })
    if(present){
        this.errors.push('Connection already exist')
    }
}

Connect.prototype.connect = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
        if(!this.errors.length){
            userConnection = [...this.userConnectionDoc.connections, new ObjectID(this.connectId)]
            await connectCollection.findOneAndUpdate({userId: new ObjectID(this.userId)}, {$set: {connections: userConnection}})
            connectorConnection = [...this.connectorConnectionDoc.connections, new ObjectID(this.userId)]
            await connectCollection.findOneAndUpdate({userId: new ObjectID(this.connectId)}, {$set: {connections: connectorConnection}})
            resolve()            
        } else {
            reject()
        }
    })
}

Connect.search = function(searchTerm, userId) {
    return new Promise(async (resolve, reject) => {
        if(typeof(searchTerm) == 'string') {
            let users = await userCollection.find({ $or: [{username: { $regex: '.*' + searchTerm + '.*'}}, {email: { $regex: '.*' + searchTerm + '.*'}}]}).toArray()

            users = users.map(user => {
                let user2 = {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
                return user2
            })

            users = users.filter(user => {return user._id != userId})

            let userConnectionDoc = await connectCollection.findOne({userId: new ObjectID(userId)})
            users = users.filter(user => {
                let present = false
                userConnectionDoc.connections.some((connect) => {
                    if(connect.equals(user._id)){
                        present = true
                        return true
                    }
                })
                if(present){
                    return false
                } else {
                    return true
                }
            })

            resolve(users)
        } else {
            reject()
        }
    })
}

Connect.getConnectionsId = function(userId) {
    return new Promise(async (resolve, reject) => {
        let userDoc = await connectCollection.findOne({userId: new ObjectID(userId)})
        let ConnectionsId = userDoc.connections
        resolve(ConnectionsId)
    })
}

module.exports = Connect
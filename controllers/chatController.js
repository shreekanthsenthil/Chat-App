let Chat = require('../models/Chat')

exports.getMessages = function(req, res) {
    Chat.getMessages(req.userId, req.body.connectId).then((messages) => {
        res.json(messages)
    }).catch(() => {
        res.json([])
    })
}

exports.newMessage = function(from, to, message, time) {
    let chat = new Chat(from, to, message, time)
    chat.newMessage()
}
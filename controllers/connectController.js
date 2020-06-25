let Connect = require('../models/Connect')

exports.connectPage = function(req, res){
    res.render('connect', {username: req.session.user.username})
}

exports.search = function(req, res) {
    Connect.search(req.body.searchTerm, req.userId).then(users => {
        res.json(users)
    }).catch(() => {
        res.json([])
    })
}

exports.connect = function(req, res, next) {
    let connection = new Connect(req.userId, req.params.id)
    connection.connect().then(() => {
        //io.sockets.in(req.params.id).emit('newConnection', {username: req.sessions.user.username, id: req.userId})
        next()
    }).catch((e) => {
        console.log(e)
        res.redirect('/404')
    })
}
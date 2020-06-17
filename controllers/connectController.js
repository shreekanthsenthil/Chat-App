let Connect = require('../models/Connect')

exports.connectPage = function(req, res){
    res.render('connect')
}

exports.search = function(req, res) {
    Connect.search(req.body.searchTerm, req.userId).then(users => {
        res.json(users)
    }).catch(() => {
        res.json([])
    })
}

exports.connect = function(req, res) {
    let connection = new Connect(req.userId, req.params.id) 
    connection.connect().then(() => {
        res.redirect('/')
    }).catch(() => {
        res.redirect('/404')
    })
}
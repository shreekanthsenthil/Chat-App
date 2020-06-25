let User = require('../models/User')

exports.home = function(req, res) {
    if(req.session.user) {
        User.getConnections(req.userId).then((connections) => {
            if(connections.length){
                res.render('chat', {connections: connections, username: req.session.user.username, userId: req.userId})
            } else {
                res.redirect('/connect')
            }
        }).catch(() => {
            res.redirect('/404')
        })
    } else {
        res.render('login')
    }
}

exports.registerPage = function(req, res) {
    if(req.session.user) {
        res.redirect('/')
    } else {
        res.render('register')
    }
}

exports.register = function(req, res) {
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.data.username, _id: user.data._id}
        req.session.save(() => res.redirect('/'))
     }).catch((regErrors) => {
         regErrors.forEach(function(error) {
             req.flash('errors', error)
         })
         req.session.save(() => res.redirect('/register'))
     })
}

exports.login = function(req, res) {
    let user = new User(req.body)
    user.login().then((result) => {
        req.session.user = {username: user.data.username, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    })
    .catch((e) => {
        req.flash('errors', e)
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.mustBeLoggedIn = function(req, res, next) {
    if (req.session.user) {
        next()
    }
    else {
        req.flash("errors", "You must be Logged in to perform that action")
        req.session.save(function() {
            res.redirect('/')
        })
    }
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.redirect("/")
    })
}


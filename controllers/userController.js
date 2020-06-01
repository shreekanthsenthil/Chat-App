let User = require('../models/User')

exports.home = function(req, res) {
    if(req.session.user) {
        res.send(`Logged in as ${req.session.user.username}`)
    } else {
        res.render('login')
    }
}

exports.registerPage = function(req, res) {
    if(req.session.user) {
        res.send(`Logged in as ${req.session.user.username}`)
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


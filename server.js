const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const userController = require('./controllers/userController')

const server = express()

server.use(express.urlencoded({extended: false}))
server.use(express.json())

server.use(express.static('public'))
server.set('views', 'views')
server.set('view engine', 'ejs')

let sessionOptions = session({
    secret: "myLitTl23eSe93cre3t",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

server.use(sessionOptions)
server.use(flash())

server.use(function(req, res, next) {

    //make all error flash messages available from all templates
    res.locals.errors = req.flash("errors")

    //make current user id available on the req object
    if(req.session.user) {
        req.userId = req.session.user._id
    } else {
        req.userId = req.visitorId = 0
    }

    //make user session data from within view templates
    res.locals.user = req.session.user
    next()
})

server.get('/', userController.home)
server.get('/register', userController.registerPage)
server.post('/register', userController.register)

module.exports = server
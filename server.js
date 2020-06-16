const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const userController = require('./controllers/userController')
const connectController = require('./controllers/connectController')

const server = express()

const chatServer = require('http').createServer(server)
const io = require('socket.io')(chatServer)

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
        req.userId = 0
    }

    //make user session data from within view templates
    res.locals.user = req.session.user
    next()
})

server.get('/', userController.home)
server.get('/register', userController.registerPage)
server.post('/register', userController.register)
server.post('/login', userController.login)
server.post('/logout', userController.logout)
server.get('/connect', userController.mustBeLoggedIn, connectController.connectPage)

io.use(function(socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
   if(socket.request.session.user) {
    let user = socket.request.session.user

    socket.emit('welcome', {username: user.username})

    socket.on('chatMessageFromBrowser', function(data) {
        socket.broadcast.emit('chatMessageFromServer', {message: data.message, fromUsername: user.username, toUsername: data.toUsername})
    })
   }
})


module.exports = chatServer
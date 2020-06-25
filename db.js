const dotenv = require('dotenv')
dotenv.config()
const mongodb = require('mongodb')

mongodb.connect(process.env.CONNECTIONSTRING , {useNewUrlParser: true, useUnifiedTopology: true},function(err, client) {
    module.exports = client
    const server = require('./server').chatServer
    server.listen(process.env.PORT)
})
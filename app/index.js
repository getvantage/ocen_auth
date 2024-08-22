require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const ApiError_1 = require("./core/api.error");
const app = express();

app.use(bodyParser.json({ limit: '10mb', extended: true }))

/**
 * Initialize CORS headers for API requests
 */

 const options = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Partnercode',
        'Serverkey',
        'Serversecret',
        'X-Access-Token',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'PUT',
        'POST',
        'GET',
        'DELETE',
        'OPTIONS',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST',
    origin: '*'
};
app.use(cors(options));
// app.use(cors())

app.use(function applyXFrame(req, res, next) {
    res.set('X-Frame-Options', 'DENY');
    next(); 
});
app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
    next();
  });
  
/**
 *  Import routes
 */

// Health check
app.get('/hello', (req, res) => {
    return res.status(200).send("Health Check Runing!!!!!")
})
require('./routes/index.route')(app); // uncomment if user functions

app.options('*', cors(options));
app.use((req, res, next) => next(new ApiError_1.NotFoundError()));

app.use((err, req, res, next) => {
    if (err instanceof ApiError_1.ApiError) {
        ApiError_1.ApiError.handle(err, res);
    }
    else {
        if (process.env.NODE_ENV === 'development') {
            // Logger_1.default.error(err);
            return res.status(500).send(err.message);
        }
        ApiError_1.ApiError.handle(new ApiError_1.InternalError(), res);
    }
});

/**
* Get port from environment and store in Express.
*/

var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server
.listen(port, () => {
    console.log('Server running on port ' + port);
})
.on('error', onError)
.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    // console.log('Listening on ' + bind);
}

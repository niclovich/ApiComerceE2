const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { config } = require('./config');
const sessionsRouter = require('./routes/sessions');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
require('./config/passport');
const path = require('path');
const viewsRouter = require('./routes/views');
const { engine } = require('express-handlebars');

const app = express();

// view engine setup
app.engine('hbs', engine({
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views', 'layouts'),
	partialsDir: path.join(__dirname, 'views', 'partials'),
	defaultLayout: 'main',
	helpers: {
		eq: (a, b) => a == b,
		neq: (a, b) => a != b,
		and: function() { return Array.prototype.slice.call(arguments,0,-1).every(Boolean); },
		or: function() { return Array.prototype.slice.call(arguments,0,-1).some(Boolean); }
	}
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// parse cookies (needed for JWT extraction from cookie)
app.use(cookieParser());



// Serve static assets (css, client JS if any)
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.get('/api', (req, res) => res.json({ ok: true, message: 'API Ecommerce' }));

module.exports = app;

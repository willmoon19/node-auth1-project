const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");
const Store = require('connect-session-knex')(session);
const knex = require('../data/db-config')
/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */


const server = express();

server.use(
  session({
    name: 'chocolatechip',
    secret: 'okay, keep your secrets',
    cookie: {
      maxAge: 1000 * 60,
      secure: false,
      httpOnly: false,
    },
    resave: false,
    saveUninitialized: false,
    store: new Store({
      knex,
      createTable: true,
      clearInterbal: 1000 * 60,
      tablename: 'sessions',
      sidfieldname: 'sid',
    })
  })
)

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);
server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

server.use('*', (req, res) => {
  res.status(404).json({ message: 'not found!' })
});

module.exports = server;

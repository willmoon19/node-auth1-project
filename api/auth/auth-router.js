const router = require('express').Router()
const bcrypt = require('bcryptjs')

const {
checkPasswordLength,
checkUsernameExists,
checkUsernameFree
} = require('./auth-middleware')
const Users = require('../users/users-model')

router.post('/register',
checkPasswordLength,
checkUsernameFree,
async (req, res, next) => {
  try {
    const { username, password } = req.body
    const hash = bcrypt.hashSync(password, 8)
    const createdUser = await Users.add({ username, password: hash })
    res.status(201).json(createdUser)
  } catch(err){
    next(err)
  }
})

router.post('/login', checkUsernameExists, async (req, res, next) => {
  try {
    if (bcrypt.compareSync(req.body.password, req.user.password)) {
      req.session.user = req.user
      res.json({message: `Welcome ${req.user.username}`})
    } else {
      next({
        status: 401,
        message: "Invalid credentials"
      })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/logout', async (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) {
        next(err)
      } else {
        res.json({ message: 'logged out' })
      }
    })
  } else {
    res.json({ message: 'no session' })
  }
})

module.exports = router

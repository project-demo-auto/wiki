/* global WIKI */

const express = require('express')
const router = express.Router()
const moment = require('moment')
const _ = require('lodash')

/**
 * Login form
 */
router.get('/login', function (req, res, next) {
  _.set(res.locals, 'pageMeta.title', 'Login')
  res.render('login')
})

/**
 * Logout
 */
router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

/**
 * Register form
 */
router.get('/register', async (req, res, next) => {
  _.set(res.locals, 'pageMeta.title', 'Register')
  const localStrg = await WIKI.models.authentication.getStrategy('local')
  if (localStrg.selfRegistration) {
    res.render('register')
  } else {
    next(new WIKI.Error.AuthRegistrationDisabled())
  }
})

/**
 * Verify
 */
router.get('/verify/:token', async (req, res, next) => {
  const usr = await WIKI.models.userKeys.validateToken({ kind: 'verify', token: req.params.token })
  await WIKI.models.users.query().patch({ isVerified: true }).where('id', usr.id)
  const result = await WIKI.models.users.refreshToken(usr)
  res.cookie('jwt', result.token, { expires: moment().add(1, 'years').toDate() })
  res.redirect('/')
})

/**
 * JWT Public Endpoints
 */
router.get('/.well-known/jwk.json', function (req, res, next) {
  res.json(WIKI.config.certs.jwk)
})
router.get('/.well-known/jwk.pem', function (req, res, next) {
  res.send(WIKI.config.certs.public)
})

module.exports = router

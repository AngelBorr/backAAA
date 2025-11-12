import MyOwnRouter from './router.js'
import { Router } from 'express'
import passport from 'passport'
//import { restartPassword, failLogin, failRegister, gitHubCallBack, loginGitHub, loginUser, logoutSession, registerUser, resetPassword, usersCurrent, updateRole } from "../controllers/controller.users.js";
//import cookieParser from 'cookie-parser'
//import { setLastConnection, setLastDesconnection } from '../middlewares/setLastConnection.js';
import {
  loginUser,
  failLogin,
  currentUser,
  logoutUser
} from '../controllers/controller.sessions.js'

const router = Router()
//router.use(cookieParser())

export default class SessionsRouter extends MyOwnRouter {
  init() {
    this.post(
      '/login',
      ['PUBLIC'],
      passport.authenticate('login', { failureRedirect: '/api/sessions/failLogin' }),
      loginUser
    )

    this.get('/failLogin', ['PUBLIC'], failLogin)
    this.get('/current', ['USER', 'ADMIN'], currentUser)
    this.post('/logout', ['USER', 'ADMIN'], logoutUser)
  }
}

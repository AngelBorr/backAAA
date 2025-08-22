import MyOwnRouter from './router.js'
import { Router } from 'express'
import passport from 'passport'
//import { restartPassword, failLogin, failRegister, gitHubCallBack, loginGitHub, loginUser, logoutSession, registerUser, resetPassword, usersCurrent, updateRole } from "../controllers/controller.users.js";
//import cookieParser from 'cookie-parser'
//import { setLastConnection, setLastDesconnection } from '../middlewares/setLastConnection.js';
import { loginUser, registerUser } from '../controllers/controller.users.js'

const router = Router()
//router.use(cookieParser())

export default class SessionsRouter extends MyOwnRouter {
  init() {
    //ruta post para el registerUser
    this.post(
      '/register',
      ['PUBLIC'],
      passport.authenticate('register', { failureRedirect: '/api/sessions/failRegister' }),
      registerUser
    )

    //this.get('/failRegister', ['PUBLIC'], failRegister)

    //ruta loginSA
    this.post(
      '/login',
      ['PUBLIC'],
      /* passport.authenticate('login', {failureRedirect:'/api/sessions/failLogin'}), setLastConnection, */ loginUser
    )

    /* this.get('/failLogin', ['PUBLIC'], failLogin)

        //ruta logout elimina la session
        this.post('/logout', ['ADMIN', 'USER', 'PREMIUM'], setLastDesconnection, logoutSession)

        //ruta resetPassword
        this.put('/resetPassword', ['PUBLIC'], resetPassword)

        //ruta restartPassword
        this.put('/restartPassword', ['PUBLIC'], restartPassword)

        //rutas Github - VER LA POLITICA
        this.get('/github', ['PUBLIC'],passport.authenticate('github', { scope: ['user:email'] }), loginGitHub);

        this.get('/githubcallback', ['PUBLIC'],passport.authenticate('github', { failureRedirect: '/login' }), gitHubCallBack);

        //ruta current
        this.get('/current', ['ADMIN', 'USER', 'PREMIUM'], usersCurrent) */
  }
}

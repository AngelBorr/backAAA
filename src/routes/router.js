import { Router } from 'express'
//import handlePolicies from '../config/handlePolicies.config.js'

class MyOwnRouter {
  constructor() {
    this.router = Router()
    this.init()
  }

  getRouter() {
    return this.router
  }

  init() {}

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params)
      } catch (error) {
        console.log(error)
        params[1].status(500).send({ error })
      }
    })
  }

  get(path, policies, ...callbacks) {
    this.router.get(path, this.applyCallbacks(callbacks))
  }

  post(path, policies, ...callbacks) {
    this.router.post(path, this.applyCallbacks(callbacks))
  }

  put(path, policies, ...callbacks) {
    this.router.put(path, this.applyCallbacks(callbacks))
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(path, this.applyCallbacks(callbacks))
  }

  /* get(path, policies, ...callbacks) {
        this.router.get(path, handlePolicies(policies), /*this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    post(path, policies, ...callbacks) {
        this.router.post(path, handlePolicies(policies), /*this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    put(path, policies, ...callbacks) {
        this.router.put(path, handlePolicies(policies), /*this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    delete(path, policies, ...callbacks) {
        this.router.delete(path, handlePolicies(policies), /*this.generateCustomResponses, this.applyCallbacks(callbacks));
    } */
}

export default MyOwnRouter

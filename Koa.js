const http = require('http')

class Koa {
  constructor () {
    this.middlewares = []
  }

  use (cb) {
    this.middlewares.push(cb)
  }

  compose (middlewares, ctx) {
    return function () {
      let index = 0 
      const dispatch = index => {
        let middleware = middlewares[index]        
        if (!middleware) {
          return Promise.resolve()
        }
        return middleware(ctx, () => dispatch(++index))
      }
      return Promise.resolve(dispatch(index))
    }
  }
  handle_response (ctx) {
    let body = ctx.body 
    if (typeof body === 'string') {
      ctx.res.end(body)
    }
  }
  listen (...params) {
    http.createServer((req, res) => {
      let ctx = {}
      ctx.req = req
      ctx.res = res 
      let fnMiddleware = this.compose(this.middlewares, ctx)
      fnMiddleware().then(() => {
        console.log('test');
        
        this.handle_response(ctx)
      }).catch(() => {

      })
    }).listen(...params)
  }
}

module.exports = Koa

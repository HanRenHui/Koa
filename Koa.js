const http = require('http')
const url = require('url')
const mime = require('mime')
const Stream = require('stream')
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
      return dispatch(index)
    }
  }

  handle_response (ctx) {
    let body = ctx.body 
    // ctx.res.setHeader('content-type', mime.getType(body))
    if (typeof body === 'string') {
      ctx.res.end(body)
    } else if (body instanceof Stream) {
      body.pipe(ctx.res)
    }
  }
  listen (...params) {
    http.createServer((req, res) => {
      let ctx = {}
      ctx.req = req
      ctx.res = res 
      ctx.path = url.parse(req.url).pathname
      let fnMiddleware = this.compose(this.middlewares, ctx)
      fnMiddleware().then(() => {
        this.handle_response(ctx)
      }).catch(err => {
        console.log(err);
        
      })
    }).listen(...params)
  }
}

module.exports = Koa

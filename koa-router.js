const url = require('url')
const Layer = require('./koa-layer')
module.exports = class Router {
  constructor() {
    this.stack = []
  }

  all(path, handler) {
    let layer = new Layer(path, handler)
    this.stack.push(layer)
  }

  /**
   * 通过请求路径将所有的回调筛选出来
   */
  matchPath(pathname) {
    return this.stack
      .filter(l => l.path === pathname)
      .map(l => l.handler)
  }

  routerCompose(ctx, routeHandlers) {
    let index = 0
    return new Promise((resolve, reject) => {
      const dispatch = index => {
        let handler = routeHandlers[index]
        if (!handler) {
          return resolve()
        }
        return handler(ctx, () => dispatch(index+1))
      }
      return dispatch(index)
    })
  }

  routes() {
    return async (ctx, next) => {
      let { pathname } = url.parse(ctx.path)
      let routeHandlers = this.matchPath(pathname)
      let fnRouter = this.routerCompose(ctx, routeHandlers)
      fnRouter
        .then(() => next())
        .catch(err => console.log(err))
    }
  }
}

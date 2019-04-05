const fs = require('fs')
const path = require('path')
module.exports = root => async (ctx, next) => {
  let pathDir = path.join(root, ctx.path)
  let _err
  await new Promise((resolve, reject) => {
    fs.stat(pathDir, (err, data) => {
      if (err) {
        _err = err
      } else {
        resolve()
      }
    })
  })
  if (_err) {
    return next()
  }
  ctx.body = fs.createReadStream(pathDir)
}

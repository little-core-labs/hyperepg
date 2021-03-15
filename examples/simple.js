const hyperepg = require('../')
const path = require('path')

const feed = hyperepg(path.resolve(__dirname, 'feed.xml'))

feed.ready(async () => {
  const copy = hyperepg(feed.key)
  await feed.sync()
  await copy.ready()
  console.log(await copy.sync())
})

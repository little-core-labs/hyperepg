const hyperepg = require('./')

const feed = hyperepg('./example.xml')

feed.ready(async () => {
  const copy = hyperepg(feed.key)
  await feed.sync()
  await copy.ready()
  await copy.sync()
})

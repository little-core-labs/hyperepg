const { createDocument, createNode, createFeed } = require('../')

const feed = createFeed()
const document = createDocument({
  attributes: {
    'source-info-url': 'https://example.com/epg'
  }
})

const channel = createNode('channel', {
  id: '1234.channel'
}, {
  children: [ createNode('display-name', {}, { children: ['1234 Channel'] }) ]
})

const programmes = [
  createNode('programme', {
    channel: '1234.channel',
    start: new Date().toISOString(),
    stop: new Date(Date.now() + (60 * 60 * 1000)).toISOString()
  }, {
    children: [
      createNode('title', { lang: 'en' }, {
        children: ['Cool Show']
      }),

      createNode('desc', { lang: 'en' }, {
        children: ['A very cool TV show']
      }),

      ...['Comedy', 'Family'].map((name) => createNode('category', { lang: 'en' }, {
        children: [name]
      }))
    ]
  })
]

document.appendChild(channel)
document.append(programmes)

feed.ready(async () => {
  console.log(document)
  const copy = createFeed(feed.key)
  await copy.ready()
  await feed.save(document)
  const epg = await copy.sync()
  console.log(epg)
})

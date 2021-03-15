const { Document } = require('mediaxml/xmltv')
const hyperswarm = require('hyperswarm')
const { fetch } = require('mediaxml/fetch')
const hypercore = require('hypercore')
const messages = require('./messages')
const pump = require('pump')
const ram = require('random-access-memory')

function makePromiseCallback(callback) {
  return new Promise((resolve, reject) => {
    return callback((err, value) => err ? reject(err) : resolve(value))
  })
}

class Feed {
  static from(uri, opts) {
    return new this(uri, opts)
  }

  constructor(uri, opts) {
    opts = { ...opts }

    if (!opts.key) {
      if (uri && (Buffer.isBuffer(uri) || (/[a-f|A-f|0-9]+/.test(uri) && 64 === uri.length))) {
        opts.key = Buffer.from(uri, 'hex')
        uri = null
      }
    }

    this.uri = uri
    this.feed = opts.feed || hypercore(opts.storage || ram, opts.key, {
      sparse: true,
      ...opts
    })

    this.swarm = hyperswarm(opts.swarm)
    this.onconnection = this.onconnection.bind(this)

    this.swarm.on('connection', this.onconnection)
  }

  onconnection(socket) {
    const stream = this.feed.replicate(!this.feed.writable)
    pump(socket, stream, socket)
  }

  get key() {
    return this.feed.key
  }

  get secretKey() {
    return this.feed.secretKey
  }

  get discoveryKey() {
    return this.feed.discoveryKey
  }

  ready(callback) {
    return new Promise((resolve, reject) => {
      this.feed.ready((err) => {
        if (err) {
          reject(err)
          if ('function' === typeof callback) {
            callback(err)
          }
          return
        }

        this.swarm.join(this.feed.discoveryKey, {
          announce: true,
          lookup: true
        })

        resolve()

        if ('function' === typeof callback) {
          callback(null)
        }
      })
    })
  }

  async sync() {
    if (this.feed.writable) {
      const stream = await fetch(this.uri)
      const document = Document.from(stream)

      await document.ready()

      const { programmes } = document
      const header = messages.Header.encode({
        document,
        programmes: {
          start: this.feed.length,
          stop: this.feed.length + programmes.length
        }
      })

      const payload = programmes
        .map((programme) => messages.Document.Programme.encode(programme))
        .concat(header)

      await makePromiseCallback((cb) => this.feed.append(payload, cb))
    }

    const head = await makePromiseCallback((cb) => {
      if (this.feed.length) {
        this.feed.head(cb)
      } else {
        this.feed.update(() => this.feed.head(cb))
      }
    })

    const header = messages.Header.decode(head)
    const { document } = header
    const programmes = await makePromiseCallback((cb) => {
      const { start, stop } = header.programmes
      const valueEncoding = messages.Document.Programme
      this.feed.getBatch(start, stop, { valueEncoding }, cb)
    })

    document.programmes = programmes

    return document
  }
}

function createFeed(...args) {
  return Feed.from(...args)
}

module.exports = Object.assign(createFeed, {
  Feed
})

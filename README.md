HyperEPG
========

> Sync and distribute an Electronic Program Guide (EPG) from an XMLTV source.

## Installation

```sh
$ npm install hyperepg
```

## Usage

```js
const hyperepg = require('hyperepg')
const feed = hyperepg('https://example.com/xmltv/epg.xml')

feed.ready(() => {
  feed.sync() // will broadcast EPG
})
```

## API

### `feed = hyperepg(uri[, opts ])`

Factory constructor for a HyperEPG `Feed` instance.

#### `epg? = feed.sync()`

Synchronize feed from network to fetch latest EPG data.

#### `feed.save(document)`

Saves a document to the feed. The feed must be writable.

### `document = hyperepg.createDocument([attributes])`

Creates a [MediaXML](https://github.com/little-core-labs/mediaxml) XMLTV
document.

```js
const document = hyperepg.createDocument({
  'source-info-url': 'https://example.com/xmltv'
})
```

### `node = hyperepg.createNode(name[, attributes[, opts]])`

```js
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

    ...['Comedy', 'Family'].map((name) =>
      createNode('category', { lang: 'en' }, {
        children: [name]
      }))
  ]
})
```

## Schema

```proto
syntax = "proto3";

message Header {
  Document document = 1;
  Slice programmes = 2;
}

message Slice {
  int64 start = 1;
  int64 stop = 2;
}

message Document {
  string sourceInfoUrl = 1;
  string sourceInfoName = 2;
  string generatorInfoName = 3;
  string generatorInfoUrl = 4;

  reserved 5 to 10;

  repeated Channel channels = 12;

  message LocalizedText {
    string lang = 1;
    string value = 2;
  }

  message Icon {
    string src = 1;
    float width = 2;
    float height = 3;
  }

  message Channel {
    string id = 1;
    repeated string urls = 2;
    reserved 2 to 9;
    repeated LocalizedText displayNames = 10;
    repeated LocalizedText descriptions = 11;
    reserved 12 to 19;
    repeated Icon icons = 20;
  }

  message Programme {
    string id = 1;
    int64 date = 2;
    int64 start = 3;
    int64 stop = 4;
    string channel = 5;
    string originalLanguage = 6;
    repeated string languages = 7;
    repeated string countries = 8;
    repeated string keywords = 9;
    repeated LocalizedText titles = 10;
    repeated LocalizedText descriptions = 11;
    repeated LocalizedText subtitles = 12;
    repeated LocalizedText categories = 13;
    reserved 14 to 19;
    repeated Icon icons = 20;
    reserved 21 to 24;
    repeated Credit credits = 25;
    repeated EpisodeNumber episodeNumbers = 26;
    VideoDescription video = 27;
    Rating rating = 28;
  }

  message StarRating {
    string value = 1;
  }

  message AudioDescription {
    bool stereo = 1;
  }

  message VideoDescription {
    string aspect = 1;
    string quality = 2;
  }

  message Rating {
    string system = 1;
    string value = 2;
    repeated Icon icons = 3;
  }

  message Credit {
    repeated string directors = 1;
    repeated string actors = 2;
    repeated string presenters = 3;
    repeated string producers = 4;
    repeated string writers = 5;
    repeated string adapters = 6;
    repeated string composers = 7;
    repeated string editors = 8;
    repeated string commentators = 9;
    repeated string guests = 10;
  }

  message EpisodeNumber {
    string system = 1;
    string value = 2;
  }
}
```

## License

MIT

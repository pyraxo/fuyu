import BaseCommand from '../../base/BaseCommand'
import img from '../.Cache/ImageFetcher'
import DB from '../.Cache/WaifuDB'

class Shipgirl extends BaseCommand {
  static get name () {
    return 'shipgirl'
  }

  static get description () {
    return 'Finds you a shipgirl'
  }

  static get usage () {
    return [
      ['**shipgirl** - Finds you a shipgirl']
    ]
  }

  shipgirlGet (name, url) {
    this.send(this.channel, `Your shipgirl is ${name}\n${url}`)
  }

  noPictures (query) {
    this.logger.error(
      `**Error**: Query "${query.split('+').join(', ')}"` +
      ` returned no pictures.`
    )
    this.getWaifu()
  }

  fetchGB (res, query, name) {
    let r = []
    try {
      r = JSON.parse(res.text)[0]
    } catch (err) {
      this.logger.error(`Error fetching '${query}'`, err)
      this.reply(`Error fetching '${query}' - ${err}`)
      return
    }
    if (r && r.file_url) {
      if (r.rating === 's') {
        this.shipgirlGet(name, r.file_url)
      } else {
        this.fetchGB(res, query, name)
      }
      return
    }
    this.reducePage(query, name)
    return
  }

  reducePage (query, name) {
    // Temporary workaround for tags with less than 10000 images
    img('gelbooru', query, this, `limit=100`)
    .then(res => {
      this.fetchGB(res, query, name)
    })
  }

  gelbooru (name) {
    let query = name.split(' ').join('_')
    img('gelbooru', query, this, `pid=${Math.floor(Math.random() * 10000)}`)
    .then(res => {
      this.fetchGB(res, query, name)
    })
  }

  yandere (name) {
    let query = name.split(' ').join('_')
    img('yandere', query, this)
    .then((res) => {
      let r = res.body[0]
      if (typeof r !== 'undefined') {
        this.shipgirlGet(name, r.file_url)
      } else {
        this.gelbooru(name)
      }
    })
  }

  handle () {
    this.responds(/^shipgirl$/i, () => {
      let data = DB.Shipgirls
      let char = data[Math.floor(Math.random() * data.length)]
      this.yandere(char)
    })
  }
}

module.exports = Shipgirl

const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../exceptions/InvariantError')
const { mapDBToModel } = require('../utils/forActivities')

class ActivitiesService {
  constructor () {
    this._pool = new Pool()
  }

  async addActivity (playlistId, username, title, action, time) {
    const id = `activity-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, username, title, action, time]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Aktifitas gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getActivitiesPlaylistById (playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      return []
    }

    return result.rows.map(mapDBToModel)
  }
}

module.exports = ActivitiesService

const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const { mapDBToModel } = require('../../utils/forActivities')

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

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) throw new InvariantError('Aktifitas gagal ditambahkan')

    return rows[0].id
  }

  async getActivitiesPlaylistById (playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) return []

    return rows.map(mapDBToModel)
  }
}

module.exports = ActivitiesService

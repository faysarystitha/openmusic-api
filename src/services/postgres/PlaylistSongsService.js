const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistSongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSong (playlistId, songId) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) throw new InvariantError('Lagu gagal ditambahkan')

    return rows[0].id
  }

  async deleteSong (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('Lagu gagal dihapus')
  }
}

module.exports = PlaylistSongsService

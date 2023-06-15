const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/forSongs')

class SongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSong ({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new InvariantError('Lagu gagal ditambahkan')

    return rows[0].id
  }

  // async getSongsByParams (title, performer) {
  //   if (title !== undefined && performer !== undefined) {
  //     const result = await this._pool.query(`SELECT * FROM songs WHERE title LIKE '${title}%' AND performer LIKE '${performer}%'`)
  //     return result.rows.map(mapDBToModel)
  //   } else {
  //     const result = await this._pool.query(`SELECT * FROM songs WHERE title LIKE '${title}%' OR performer LIKE '${performer}%'`)
  //     return result.rows.map(mapDBToModel)
  //   }
  // }

  // async getSongs () {
  //   const result = await this._pool.query('SELECT * FROM songs')
  //   return result.rows.map(mapDBToModel)
  // }

  async getSongs (title = '', performer = '') {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 and performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`]
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('Lagu tidak ditemukan')

    return rows[0]
  }

  async editSongById (id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')

    return rows[0].id
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
  }

  async getSongsByAlbumId (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id]
    }

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) return []

    return rows.map(mapDBToModel)
  }

  async getSongsByPlaylistId (id) {
    const query = {
      text: `SELECT songs.* FROM songs
      INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [id]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) return []

    return rows.map(mapDBToModel)
  }
}

module.exports = SongsService

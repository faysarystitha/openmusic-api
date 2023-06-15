const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/forAlbums')

class AlbumsService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum ({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new InvariantError('Album gagal ditambahkan')

    return rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('Album tidak ditemukan')

    return mapDBToModel(rows[0])
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
  }

  async updateCoverAlbum (albumId, fileLocation) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [fileLocation, albumId]
    }

    await this._pool.query(query)
  }

  async getCoverAlbum (albumId) {
    const query = {
      text: 'SELECT cover FROM albums WHERE id = $1',
      values: [albumId]
    }

    const { rows } = await this._pool.query(query)
    return rows[0].cover
  }

  async addLike (userId, albumId) {
    const id = `like-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('Album tidak ada')

    await this._cacheService.delete(`likes:${albumId}`)
    return rows[0].id
  }

  async deleteLike (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('Like gagal dihapus. Anda belum menyukai album ini')

    await this._cacheService.delete(`likes:${albumId}`)
  }

  async getLikes (albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`)
      return [result, true]
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }

      const { rowCount } = await this._pool.query(query)

      if (!rowCount) throw new NotFoundError('Album tidak ditemukan')

      await this._cacheService.set(`likes:${albumId}`, rowCount)
      return [rowCount, false]
    }
  }

  async checkLike (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const { rowCount } = await this._pool.query(query)

    if (rowCount) throw new InvariantError('Album telah disukai')
  }
}

module.exports = AlbumsService

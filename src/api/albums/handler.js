const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (albumsService, songsService, validator) {
    this._albumsService = albumsService
    this._songsService = songsService
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)

    const { name, year } = request.payload
    const albumId = await this._albumsService.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      data: {
        albumId
      }
    }).code(201)

    return response
  }

  async getAlbumByIdHandler (request, h) {
    const { id } = request.params

    const album = await this._albumsService.getAlbumById(id)
    album.songs = await this._songsService.getSongsByAlbumId(id)

    const response = h.response({
      status: 'success',
      data: {
        album
      }
    }).code(200)

    return response
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)

    const { id } = request.params
    await this._albumsService.editAlbumById(id, request.payload)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui'
    }).code(200)

    return response
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params
    await this._albumsService.deleteAlbumById(id)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus'
    }).code(200)

    return response
  }
}

module.exports = AlbumsHandler

const autoBind = require('auto-bind')
const SongsService = require('../../services/SongsService')

class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload
    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      data: {
        albumId
      }
    }).code(201)

    return response
  }

  async getAlbumByIdHandler (request, h) {
    const songsService = new SongsService()
    const { id } = request.params
    const album = await this._service.getAlbumById(id)
    album.songs = await songsService.getSongsByAlbumId(id)

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
    await this._service.editAlbumById(id, request.payload)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui'
    }).code(200)

    return response
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus'
    }).code(200)

    return response
  }
}

module.exports = AlbumsHandler

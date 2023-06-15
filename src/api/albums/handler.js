const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (albumsService, songsService, usersService, validator) {
    this._albumsService = albumsService
    this._songsService = songsService
    this._usersService = usersService
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
    album.coverUrl = await this._albumsService.getCoverAlbum(id)

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

  async postLikeAlbumHandler (request, h) {
    const { id: albumId } = request.params
    const { id: userId } = request.auth.credentials

    const user = await this._usersService.getUserById(userId)
    const album = await this._albumsService.getAlbumById(albumId)

    await this._albumsService.checkLike(user.id, album.id)
    await this._albumsService.addLike(user.id, album.id)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai'
    }).code(201)
    return response
  }

  async deleteLikeAlbumHandler (request, h) {
    const { id: albumId } = request.params
    const { id: userId } = request.auth.credentials

    await this._albumsService.deleteLike(userId, albumId)

    const response = h.response({
      status: 'success',
      message: 'Like berhasil dihapus dari album'
    }).code(200)
    return response
  }

  async getLikesAlbumHandler (request, h) {
    const { id: albumId } = request.params

    const [result, cache] = await this._albumsService.getLikes(albumId)

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(result, 10)
      }
    }).code(200)
    if (cache) response.header('X-Data-Source', 'cache')

    return response
  }
}

module.exports = AlbumsHandler

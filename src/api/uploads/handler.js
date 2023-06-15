const autoBind = require('auto-bind')

class UploadsHandler {
  constructor (albumsService, storageService, validator) {
    this._albumsService = albumsService
    this._storageService = storageService
    this._validator = validator

    autoBind(this)
  }

  async postAlbumCoverHandler (request, h) {
    const { cover } = request.payload
    const { id: albumId } = request.params
    this._validator.validateCoverHeaders(cover.hapi.headers)

    const filename = await this._storageService.writeFile(cover, cover.hapi)
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
    await this._albumsService.updateCoverAlbum(albumId, fileLocation)

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah'
    }).code(201)
    return response
  }
}

module.exports = UploadsHandler

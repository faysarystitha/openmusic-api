const autoBind = require('auto-bind')

class ExportsHandler {
  constructor (producerService, playlistsService, validator) {
    this._producerService = producerService
    this._playlistsService = playlistsService
    this._validator = validator

    autoBind(this)
  }

  async postExportSongsHandler (request, h) {
    this._validator.validateExportSongsPayload(request.payload)

    const { playlistId } = request.params
    await this._playlistsService.verifyPlaylistOwner(playlistId, request.auth.credentials.id)

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId
    }

    await this._producerService.sendMessage('export:songs', JSON.stringify(message))
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    }).code(201)

    return response
  }
}

module.exports = ExportsHandler

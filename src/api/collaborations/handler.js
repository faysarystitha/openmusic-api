const autoBind = require('auto-bind')

class CollaborationsHandler {
  constructor (collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService
    this._playlistsService = playlistsService
    this._usersService = usersService
    this._validator = validator

    autoBind(this)
  }

  async postCollaborationHandler (request, h) {
    this._validator.validateCollaborationPayload(request.payload)

    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload

    const playlist = await this._playlistsService.getPlaylistById(playlistId)
    const user = await this._usersService.getUserById(userId)

    await this._playlistsService.verifyPlaylistOwner(playlist.id, credentialId)
    const collaborationId = await this._collaborationsService.addCollaboration(playlist.id, user.id)

    const response = h.response({
      status: 'success',
      data: {
        collaborationId
      }
    }).code(201)
    return response
  }

  async deleteCollaborationHandler (request, h) {
    this._validator.validateCollaborationPayload(request.payload)

    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    await this._collaborationsService.deleteCollaboration(playlistId, userId)

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus'
    }
  }
}

module.exports = CollaborationsHandler

const autoBind = require('auto-bind')

class ActivitiesService {
  constructor (activitiesService, playlistsService, validator) {
    this._activitiesService = activitiesService
    this._playlistsService = playlistsService
    this._validator = validator

    autoBind(this)
  }

  async postActivityPlaylistHandler (request, h) {
    this._validator.validateActivityPayload(request.payload)

    const { id: credentialId } = request.auth.credentials
    const { playlistId, username, title, action, time } = request.payload

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    const playlist = await this._playlistsService.getPlaylistById(playlistId)
    await this._activitiesService.addActivity(playlist.id, username, title, action, time)

    const response = h.response({
      status: 'success'
    }).code(201)
    return response
  }

  async getActivitiesPlaylistHandler (request, h) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    const activities = await this._activitiesService.getActivitiesPlaylistById(playlistId)

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities
      }
    }).code(200)
    return response
  }
}

module.exports = ActivitiesService

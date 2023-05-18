const autoBind = require('auto-bind')

class PlaylistSongsHandler {
  constructor (playlistSongsService, playlistsService, songsService, activitiesService, usersService, validator) {
    this._playlistSongsService = playlistSongsService
    this._playlistsService = playlistsService
    this._songsService = songsService
    this._activitiesService = activitiesService
    this._usersService = usersService
    this._validator = validator

    autoBind(this)
  }

  async postSongToPlaylistHandler (request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)

    const { songId } = request.payload
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    const song = await this._songsService.getSongById(songId)
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._playlistSongsService.addSong(playlistId, song.id)
    const user = await this._usersService.getUserById(credentialId)

    const action = 'add'
    const time = new Date()
    await this._activitiesService.addActivity(playlistId, user.username, song.title, action, time)

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist'
    }).code(201)
    return response
  }

  async getSongsFromPlaylistHandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(id, credentialId)
    const playlist = await this._playlistsService.getPlaylistById(id)
    playlist.songs = await this._songsService.getSongsByPlaylistId(id)

    const response = h.response({
      status: 'success',
      data: {
        playlist
      }
    }).code(200)
    return response
  }

  async deleteSongFromPlaylistHandler (request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)

    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    const { songId } = request.payload

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._playlistSongsService.deleteSong(playlistId, songId)

    const user = await this._usersService.getUserById(credentialId)
    const song = await this._songsService.getSongById(songId)
    const action = 'delete'
    const time = new Date()
    await this._activitiesService.addActivity(playlistId, user.username, song.title, action, time)

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist'
    }
  }
}

module.exports = PlaylistSongsHandler

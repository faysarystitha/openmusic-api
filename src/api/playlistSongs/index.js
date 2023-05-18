const PlaylistSongsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, { playlistSongsService, playlistsService, songsService, activitiesService, usersService, validator }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(playlistSongsService, playlistsService, songsService, activitiesService, usersService, validator)
    server.route(routes(playlistSongsHandler))
  }
}

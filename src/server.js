require('dotenv').config()
const config = require('./utils/config')

const Hapi = require('@hapi/hapi')
const ClientError = require('./exceptions/ClientError')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongsService')
const SongsValidator = require('./validator/songs')

const albums = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')

const authentications = require('./api/authentications')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const AuthenticationsValidator = require('./validator/authentications')

const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

const playlistSongs = require('./api/playlistSongs')
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService')
const PlaylistSongsValidator = require('./validator/playlistSongs')

const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

const activities = require('./api/activites')
const ActivitiesService = require('./services/postgres/ActivitiesService')
const ActivitiesValidator = require('./validator/activities')

const _exports = require('./api/exports')
const producerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

const uploads = require('./api/uploads')
const StorageService = require('./services/storage/StorageService')
const UploadsValidator = require('./validator/uploads')

const CacheService = require('./services/redis/CacheService')

const init = async () => {
  const cacheService = new CacheService()
  const songsService = new SongsService()
  const albumsService = new AlbumsService(cacheService)
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const playlistSongsService = new PlaylistSongsService()
  const activitiesService = new ActivitiesService()
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.token.access,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.token.age
    },
    validate: artifacts => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
    {
      plugin: albums,
      options: {
        albumsService,
        songsService,
        usersService,
        validator: AlbumsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin: playlistSongs,
      options: {
        playlistSongsService,
        playlistsService,
        songsService,
        activitiesService,
        usersService,
        validator: PlaylistSongsValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator
      }
    },
    {
      plugin: activities,
      options: {
        activitiesService,
        playlistsService,
        validator: ActivitiesValidator
      }
    },
    {
      plugin: _exports,
      options: {
        producerService,
        playlistsService,
        validator: ExportsValidator
      }
    },
    {
      plugin: uploads,
      options: {
        albumsService,
        storageService,
        validator: UploadsValidator
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        }).code(response.statusCode)
        return newResponse
      }

      if (!response.isServer) return h.continue

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      }).code(500)
      console.log(response.message)
      return newResponse
    }

    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()

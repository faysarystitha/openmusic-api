const Joi = require('joi')

const ActivityPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  username: Joi.string().required(),
  title: Joi.string().required(),
  action: Joi.string().required(),
  time: Joi.date().required()
})

module.exports = { ActivityPayloadSchema }

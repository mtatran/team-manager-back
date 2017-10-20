import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { http } from './config'
import log from './utils/logger'

const port: Number = Number(process.env.NODE_ENV) || http.port

// Make connection to database
createConnection().then(() => {
  // Start the server
  const app = require('./app').default
  app.listen(port, () => log.info(`Server started and listening on port ${port}`))
})
.catch((err) => log.error(err))

import 'reflect-metadata'
import { config } from 'dotenv'
import { createConnection, ConnectionOptions } from 'typeorm'
import * as path from 'path'
import log from './utils/log'

config()  // Import .env file

function stringIsTruthy (str: String | undefined): boolean {
  let s = (str || '').toLowerCase()

  return s === 'true' || s === '1'
}

const connectionSettings: ConnectionOptions = {
  url: process.env.DB_URL,
  type: 'mysql',
  synchronize: stringIsTruthy(process.env.DB_SYNC),
  logging: stringIsTruthy(process.env.DB_LOGGING),
  entities: [path.join(__dirname, 'models/**/*')]
}

// Make connection to database
createConnection(connectionSettings).then(() => {
  // Start the server
  const app = require('./app').default
  const port: Number = Number(process.env.PORT)
  app.listen(port, () => log.info(`Server started and listening on port ${port}`))
})
.catch((err) => log.error(err))

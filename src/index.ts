import 'reflect-metadata'
import { config } from 'dotenv'
import { createConnection, ConnectionOptions } from 'typeorm'
import * as path from 'path'
import { http } from './config'
import log from './utils/log'

config()  // Import .env file

const connectionSettings: ConnectionOptions = {
  type: 'mongodb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'TeamManager',
  entities: [path.join(__dirname, 'models/**/*')]
}

// Make connection to database
createConnection(connectionSettings).then(() => {
  // Start the server
  const app = require('./app').default
  const port: Number = Number(process.env.PORT) || http.port
  app.listen(port, () => log.info(`Server started and listening on port ${port}`))
})
.catch((err) => log.error(err))

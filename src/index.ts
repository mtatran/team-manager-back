require('dotenv').config()
import 'reflect-metadata'
import { createConnection, ConnectionOptions } from 'typeorm'
import * as path from 'path'
import { log } from './utils/log'
import { app } from './app'

function stringIsTruthy (str: String | undefined): boolean {
  let s = (str || '').toLowerCase()
  return s === 'true' || s === '1'
}

async function init () {
  const connectionSettings: ConnectionOptions = {
    url: process.env.DB_URL,
    type: 'mariadb',
    synchronize: stringIsTruthy(process.env.DB_SYNC),
    logging: stringIsTruthy(process.env.DB_LOGGING),
    entities: [path.join(__dirname, 'models/**/*')]
  }

  await createConnection(connectionSettings)
  log.info(`Connected to database`)

  const port = Number(process.env.PORT)
  app.listen(port, () => log.info(`Server started and listening on port ${port}`))
}

init().catch(e => log.error(e))

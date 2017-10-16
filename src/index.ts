import 'reflect-metadata'

import * as express from 'express'
import {Request, Response, NextFunction} from 'express'
import * as bodyParser from 'body-parser'
import {createConnection} from 'typeorm'
import {http} from './config'
import log from './utils/logger'
import api from './api'

const app: express.Express = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api', api)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number = err.statusCode || 500
  res.status(statusCode).json(err)
})

const port: Number = Number(process.env.NODE_ENV) || http.port

// Make connection to database
createConnection().then(() => {
  // Start the server
  app.listen(port, () => log.info(`Server started and listening on port ${port}`))
})
.catch((err) => log.error(err))

import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as Boom from 'boom'

import initializeAuthentication from './authentication'
import api from './api'
import log from './utils/log'

const app: express.Express = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
initializeAuthentication(app)

app.use((req, res, next) => {
  req.context = req.context || {}
  next()
})

app.use('/api', api)

/**
 * Route for catching boom errors
 */
app.use((err: Boom.BoomError, req: Request, res: Response, next: NextFunction) => {
  log.error(err)

  res.json({ error: err.message })
})

export default app

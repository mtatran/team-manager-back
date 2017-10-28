import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import initializeAuthentication from './authentication'
import api from './api'
import * as Boom from 'boom'

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
  res.status(err.output.statusCode).json(err.message)
})



export default app

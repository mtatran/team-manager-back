import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import initializeAuthentication from './api/authentication'
import api from './api'

const app: express.Express = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
initializeAuthentication(app)

app.use('/api', api)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number = err.statusCode || 500

  if (err.name === Error.name) {
    return res.status(statusCode).json({message: err.message})
  }
  return res.status(statusCode).json(err)
})

export default app

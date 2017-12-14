import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as Boom from 'boom'
import * as path from 'path'
import { useExpressServer } from 'routing-controllers'

import initializeAuthentication from './authentication'

const app: express.Express = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
initializeAuthentication(app)

useExpressServer(app, {
  routePrefix: '/api',
  controllers: [path.join(__dirname, 'controllers', '*')],
  currentUserChecker: action => action.request.user
})

export default app

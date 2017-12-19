import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'
import { useExpressServer } from 'routing-controllers'

import { currentUserChecker } from './authentication/currentUserChecker'
import { authorizationChecker } from './authentication/authorizationChecker'

export const app: express.Express = express()

app.use(cookieParser())

useExpressServer(app, {
  routePrefix: '/api',
  controllers: [path.join(__dirname, 'controllers', '**')],
  currentUserChecker,
  authorizationChecker
})

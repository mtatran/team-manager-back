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

/**
 * @Todo:
 * Weird bug with routing-controllers where requests are falling through
 * (hitting these routes) even when they are being resolved in a controller
 * We should look into these
 */
app.use(express.static(process.env.FRONTEND_PATH as string))
app.get('*', (req, res) => {
  if (req.url.indexOf('/api') !== -1) return
  res.sendFile(path.resolve(process.env.FRONTEND_PATH, 'index.html'))
})

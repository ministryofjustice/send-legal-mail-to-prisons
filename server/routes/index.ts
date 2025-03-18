import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import landingPageTiles from './landingPageTiles'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index', {
      tiles: landingPageTiles.filter(tile =>
        tile.roles.some(requiredRole => res.locals.user?.roles.includes(requiredRole)),
      ),
    })
  })

  return router
}

import type { Router } from 'express'

import landingPageTiles from './landingPageTiles'

export default function routes(router: Router): Router {
  router.get('/', (req, res, next) => {
    res.render('pages/index', {
      tiles: landingPageTiles.filter(tile =>
        tile.roles.some(requiredRole => res.locals.user?.roles.includes(requiredRole)),
      ),
    })
  })

  return router
}

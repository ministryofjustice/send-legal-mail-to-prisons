import { Router } from 'express'

export default function standardRouter(): Router {
  const router = Router({ mergeParams: true })

  return router
}

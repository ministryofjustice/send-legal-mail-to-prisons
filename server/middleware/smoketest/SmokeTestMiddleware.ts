import express, { Router } from 'express'
import SmokeTestStore from '../../data/cache/SmokeTestStore'

export default function setupSmokeTest(smokeTestStore: SmokeTestStore): Router {
  const router = express.Router()

  router.post('/getSmokeTestSecret', async (req, res) => res.json({ token: await smokeTestStore.startSmokeTest(req) }))

  return router
}

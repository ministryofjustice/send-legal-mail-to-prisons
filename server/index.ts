import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import TokenStore from './data/tokenStore'
import MagicLinkService from './services/link/MagicLinkService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const magicLinkService = new MagicLinkService(hmppsAuthClient)

const app = createApp(userService, magicLinkService)

export default app

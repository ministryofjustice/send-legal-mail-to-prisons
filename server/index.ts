import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import TokenStore from './data/tokenStore'
import MagicLinkService from './services/link/MagicLinkService'
import ScanBarcodeService from './services/scan/ScanBarcodeService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const magicLinkService = new MagicLinkService(hmppsAuthClient)
const scanBarcodeService = new ScanBarcodeService(hmppsAuthClient)

const app = createApp(userService, magicLinkService, scanBarcodeService)

export default app

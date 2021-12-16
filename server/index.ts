import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import TokenStore from './data/tokenStore'
import MagicLinkService from './services/link/MagicLinkService'
import ScanBarcodeService from './services/scan/ScanBarcodeService'
import CreateBarcodeService from './services/barcode/CreateBarcodeService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const magicLinkService = new MagicLinkService(hmppsAuthClient)
const scanBarcodeService = new ScanBarcodeService(hmppsAuthClient)
const createBarcodeService = new CreateBarcodeService()

const app = createApp(userService, magicLinkService, scanBarcodeService, createBarcodeService)

export default app

// eslint-disable import/no-unresolved,global-require
import fs from 'fs'
import config from './config'

const { buildNumber } = config

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())

export default { buildNumber, packageData }

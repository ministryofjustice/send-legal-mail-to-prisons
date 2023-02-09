import { defineConfig } from 'cypress'
// @ts-expect-error: import path will be correct when this file is moved via run-smoke-test.sh
import state from './support/state'

export default defineConfig({
  chromeWebSecurity: false,
  screenshotsFolder: 'screenshots',
  videosFolder: 'videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 10000,
  downloadsFolder: 'downloads',
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        setSmokeTestBarcode: state.setSmokeTestBarcode,
        getSmokeTestBarcode: state.getSmokeTestBarcode,
      })
    },
    baseUrl: 'http://localhost:3000',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'smoke/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'support/index.ts',
  },
})

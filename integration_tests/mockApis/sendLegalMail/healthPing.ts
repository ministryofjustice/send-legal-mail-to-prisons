import { Response } from 'superagent'

import { stubFor } from '../wiremock'

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/send-legal-mail/health/ping',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubPing: (): Promise<Response> => ping(),
}

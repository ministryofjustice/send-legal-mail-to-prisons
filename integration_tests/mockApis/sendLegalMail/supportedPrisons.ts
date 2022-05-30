import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

const stubGetSupportedPrisons = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/send-legal-mail/prisons',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        supportedPrisons: ['ALI', 'AKI', 'KTI', 'ACI', 'ASI', 'SKI', 'LEI'],
      },
    },
  })

export default { stubGetSupportedPrisons }

import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubRequestLink = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i && @.sessionID =~ /.*/i)]' }],
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubRequestLinkFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i && @.sessionID =~ /.*/i)]' }],
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

export default {
  stubRequestLink,
  stubRequestLinkFailure,
}

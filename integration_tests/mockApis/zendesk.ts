import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubCreateZendeskTicket = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/zendesk/api/v2/tickets',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        ticket: {
          id: 123456,
        },
      },
    },
  })

export default { stubCreateZendeskTicket }

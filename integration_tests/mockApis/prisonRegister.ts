import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetPrisonRegister = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/prisons',
      headers: {
        Authorization: { doesNotMatch: '.*' },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ],
    },
  })

export default { stubGetPrisonRegister }

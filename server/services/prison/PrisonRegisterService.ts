import RestClient from '../../data/restClient'
import config from '../../config'
import { PrisonDto } from '../../@types/prisonRegisterApiClientTypes'

export interface Prison {
  id: string
  name: string
}

export default class PrisonRegisterService {
  private static restClient(): RestClient {
    return new RestClient('Prison Register API Client', config.apis.prisonRegister)
  }

  async getActivePrisons(): Promise<Array<Prison>> {
    return PrisonRegisterService.restClient()
      .anonymousGet({ path: '/prisons' })
      .then(data =>
        (data as Array<PrisonDto>)
          .filter(prison => prison.active === true)
          .map(prisonDto => {
            return {
              id: prisonDto.prisonId,
              name: prisonDto.prisonName,
            }
          })
      )
  }
}

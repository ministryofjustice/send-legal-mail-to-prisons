import moment from 'moment'
import RestClient from '../../data/restClient'
import config from '../../config'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import { ContactResponse, CreateContactRequest } from '../../@types/sendLegalMailApiClientTypes'

export default class ContactService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
  }

  async createContact(
    user: string,
    prisonerName: string,
    prisonId: string,
    prisonNumber?: string,
    prisonerDob?: Date
  ): Promise<ContactResponse> {
    const createContactRequest: CreateContactRequest = { prisonerName, prisonId, prisonNumber }
    createContactRequest.dob = prisonerDob ? moment(prisonerDob).format('YYYY-MM-DD') : undefined
    return this.hmppsAuthClient.getSystemClientToken(user).then(token =>
      ContactService.restClient(token)
        .post({
          path: '/contact',
          data: createContactRequest,
        })
        .catch(error => {
          // TODO SLM-121 When we load recipients from contacts we shouldn't get any 409s - so work out how to handle a real 409 error
          if (error.status === 409) {
            return { id: -1, prisonerName, prisonId, prisonNumber, prisonerDob } as ContactResponse
          }
          throw error
        })
        .then(response => response as ContactResponse)
    )
  }
}

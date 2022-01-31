import moment from 'moment'
import RestClient from '../../data/restClient'
import config from '../../config'
import { ContactResponse, CreateContactRequest } from '../../@types/sendLegalMailApiClientTypes'

export default class ContactService {
  private static restClient(slmToken: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, undefined, slmToken)
  }

  async createContact(
    slmToken: string,
    prisonerName: string,
    prisonId: string,
    prisonNumber?: string,
    prisonerDob?: Date
  ): Promise<ContactResponse> {
    const createContactRequest: CreateContactRequest = { prisonerName, prisonId, prisonNumber }
    createContactRequest.dob = prisonerDob ? moment(prisonerDob).format('YYYY-MM-DD') : undefined
    return ContactService.restClient(slmToken)
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
  }
}

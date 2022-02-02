import moment from 'moment'
import type { Contact, CreateContactRequest } from 'sendLegalMailApiClient'
import RestClient from '../../data/restClient'
import config from '../../config'

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
  ): Promise<Contact> {
    const createContactRequest: CreateContactRequest = { prisonerName, prisonId, prisonNumber }
    createContactRequest.dob = prisonerDob ? moment(prisonerDob).format('YYYY-MM-DD') : undefined
    return ContactService.restClient(slmToken)
      .post({
        path: '/contact',
        data: createContactRequest,
      })
      .then(response => response as Contact)
  }

  async searchContacts(slmToken: string, name: string): Promise<Array<Contact>> {
    return ContactService.restClient(slmToken)
      .get({
        path: '/contacts',
        query: `name=${name}`,
      })
      .then(response => response as Array<Contact>)
  }
}

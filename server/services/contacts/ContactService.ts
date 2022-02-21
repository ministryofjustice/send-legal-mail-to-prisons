import moment from 'moment'
import type { Contact, ContactRequest } from 'sendLegalMailApiClient'
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
    const createContactRequest: ContactRequest = { prisonerName, prisonId, prisonNumber }
    createContactRequest.dob = prisonerDob ? moment(prisonerDob).format('YYYY-MM-DD') : undefined
    return ContactService.restClient(slmToken)
      .post({
        path: '/contact',
        data: createContactRequest,
      })
      .then(response => response as Contact)
  }

  async updateContact(
    slmToken: string,
    prisonerName: string,
    prisonId: string,
    contactId: number,
    prisonNumber?: string,
    prisonerDob?: Date
  ): Promise<Contact> {
    const updateContactRequest: ContactRequest = { prisonerName, prisonId, prisonNumber }
    updateContactRequest.dob = prisonerDob ? moment(prisonerDob).format('YYYY-MM-DD') : undefined
    return ContactService.restClient(slmToken)
      .put({
        path: `/contact/${contactId}`,
        data: updateContactRequest,
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

  async getContactByPrisonNumber(slmToken: string, prisonNumber: string): Promise<Contact | undefined> {
    return ContactService.restClient(slmToken)
      .get({
        path: `/contact/prisonNumber/${prisonNumber}`,
      })
      .then(response => response as Contact)
      .catch(error => {
        if (error.status === 404) {
          return undefined
        }
        throw error
      })
  }

  async getContactById(slmToken: string, id: number): Promise<Contact | undefined> {
    return ContactService.restClient(slmToken)
      .get({
        // TODO SLM-63 switch to /contact/${id} once the API has been sorted
        path: `/contact/id/${id}`,
      })
      .then(response => response as Contact)
  }
}

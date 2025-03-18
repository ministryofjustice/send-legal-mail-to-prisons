import type { ContactHelpdeskForm } from 'forms'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'

export type ZendeskTicket = {
  ticket: {
    id?: number
    subject: string
    comment: {
      body: string
    }
    tags: ['SendLegalMail', 'slm_legal_sender' | 'slm_mailroom']
    requester: {
      email: string
      name: string
    }
  }
}

export default class ZendeskService {
  private static restClient(): RestClient {
    return new RestClient('ZenDesk API Client', config.apis.zendesk)
  }

  async createSupportTicket(
    contactHelpdeskForm: ContactHelpdeskForm,
    externalUser: boolean,
    username: string,
    organisation?: string,
  ): Promise<number> {
    try {
      const messageBody = `
Page ID: ${contactHelpdeskForm.pageId}

Description of issue: ${contactHelpdeskForm.problemDetail}

${externalUser ? `CJSM email: ${username}\nCJSM organisation: ${organisation ?? 'N/A'}` : `User ID: ${username}`}

Name: ${contactHelpdeskForm.name}
Email: ${contactHelpdeskForm.email}
`
      const requestBody: ZendeskTicket = {
        ticket: {
          subject: 'Send Legal Mail support request',
          comment: {
            body: messageBody,
          },
          tags: ['SendLegalMail', externalUser ? 'slm_legal_sender' : 'slm_mailroom'],
          requester: {
            email: `${contactHelpdeskForm.email}`,
            name: `${contactHelpdeskForm.name}`,
          },
        },
      }
      const response = (await ZendeskService.restClient().post({
        path: `/api/v2/tickets`,
        data: requestBody,
      })) as ZendeskTicket
      return response.ticket.id
    } catch (error) {
      logger.error('Error calling Zendesk REST API', error)
      throw new Error('Error creating Zendesk support ticket')
    }
  }
}

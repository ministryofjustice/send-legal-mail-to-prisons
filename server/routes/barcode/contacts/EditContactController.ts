import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import moment from 'moment'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import EditContactView from './EditContactView'

export default class EditContactController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getEditContact(req: Request, res: Response): Promise<void> {
    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    // TODO SLM-147 Get the contact from the server and redirect back to review recipients with an error if not found
    const editContactForm = {
      name: 'Gage Hewett',
      prisonId: 'LPI',
      prisonNumber: 'A4567BB',
      dob: moment('1989-01-01', 'YYYY-MM-DD').toDate(),
      'dob-day': '1',
      'dob-month': '1',
      'dob-year': '1989',
    }

    const view = new EditContactView(editContactForm, activePrisons, req.flash('errors'))

    return res.render('pages/barcode/edit-contact-details', { ...view.renderArgs })
  }
}

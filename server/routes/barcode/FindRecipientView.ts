import type { FindRecipientForm } from 'forms'
import { Prison } from '../../services/prison/PrisonRegisterService'

export default class FindRecipientView {
  constructor(
    private readonly findRecipientForm: FindRecipientForm,
    private readonly errors?: Array<Record<string, string>>,
    private readonly barcode?: string,
    private readonly barcodeImageUrl?: string,
    private readonly prisonRegister?: Array<Prison>
  ) {}

  get renderArgs(): {
    form: FindRecipientForm
    errors: Array<Record<string, string>>
    barcode: string
    barcodeImageUrl: string
    prisonRegister: Array<Record<string, string>>
  } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
      barcode: this.barcode,
      barcodeImageUrl: this.barcodeImageUrl,
      prisonRegister: [
        { value: '', text: '' },
        ...this.prisonRegister
          .map(prison => {
            return {
              value: prison.id,
              text: prison.name,
            }
          })
          .sort((a, b) => a.text.localeCompare(b.text)),
      ],
    }
  }
}

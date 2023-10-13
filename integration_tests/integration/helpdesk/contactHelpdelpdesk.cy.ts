import Page from '../../pages/page'
import ContactHelpdeskPage from '../../pages/helpdesk/contactHelpdesk'
import ContactHelpdeskConfirmationPage from '../../pages/helpdesk/contactHelpdeskConfirmation'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context('Contact Helpdesk', () => {
  let contactHelpdeskPage: ContactHelpdeskPage
  const journeyTypes = [
    {
      journey: 'Legal Sender',
      setupFunction: () => {
        const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()
        contactHelpdeskPage = findRecipientByPrisonNumberPage.contactHelpdesk(ContactHelpdeskPage)
        contactHelpdeskPage
          .referringPageIs(findRecipientByPrisonNumberPage.pageId)
          .hasHeaderTitle('Send legal mail to prisons')
      },
    },
  ]

  journeyTypes.forEach(journeyType => {
    context(`${journeyType.journey} Journey Tests`, () => {
      beforeEach(() => {
        cy.task('reset')
        journeyType.setupFunction()
      })

      it('should display page given form submitted successfully', () => {
        cy.task('stubCreateZendeskTicket')
        contactHelpdeskPage.submitFormWithValidValues()

        Page.verifyOnPage(ContactHelpdeskConfirmationPage)
      })

      it('should rerender page with validation errors given no fields submitted', () => {
        contactHelpdeskPage.submitFormWithNoValues()

        contactHelpdeskPage
          .hasErrorContaining('problem you experience')
          .hasErrorContaining('full name')
          .hasErrorContaining('email address')
      })

      it('should rerender page with error given calling Zendesk API fails', () => {
        cy.task('stubCreateZendeskTicketFailure')
        contactHelpdeskPage.submitFormWithValidValues(ContactHelpdeskPage)

        contactHelpdeskPage.hasErrorContaining('problem sending your message')
      })
    })
  })
})

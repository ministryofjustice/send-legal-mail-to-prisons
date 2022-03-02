import PrivacyPolicyPage from '../../pages/privacy-policy/privacyPolicy'
import Page from '../../pages/page'

context('Privacy Policy', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should render privacy policy page', () => {
    cy.visit('/privacy-policy')

    Page.verifyOnPage(PrivacyPolicyPage)
  })
})

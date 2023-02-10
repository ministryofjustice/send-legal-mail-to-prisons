import AccessibilityStatementPage from '../../pages/accessibility-statement/accessibilityStatement'
import Page from '../../pages/page'

context('Accessibility statement', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should render accessibility statement page', () => {
    cy.visit('/accessibility-statement')

    Page.verifyOnPage(AccessibilityStatementPage)
  })
})

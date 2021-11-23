const assertPageMeetsAccessibilityStandards = () => {
  cy.injectAxe()
  cy.checkA11y(null, {
    includedImpacts: ['critical', 'serious'],
  })
}

export default assertPageMeetsAccessibilityStandards

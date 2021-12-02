import IndexPage from '../pages/index'
import Page from '../pages/page'
import assertPageMeetsAccessibilityStandards from '../support/accessibilityHelper'
import ManualBarcodeEntryPage from '../pages/scan/manualBarcodeEntry'

context('Index Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  afterEach('Rendered page should meet accessibility standards', () => {
    assertPageMeetsAccessibilityStandards()
  })

  it('DPS user with SLM_SCAN_BARCODE role does see tile', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()

    Page.verifyOnPage(IndexPage).containsTile('Check Rule 39 mail')
  })

  it('DPS user without SLM_SCAN_BARCODE role does not see tile', () => {
    cy.signIn()

    Page.verifyOnPage(IndexPage).doesNotContainTile('Check Rule 39 mail')
  })

  it('DPS user with SLM_SCAN_BARCODE role can click tile', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()

    Page.verifyOnPage(IndexPage).clickScanBarcodeTile()

    Page.verifyOnPage(ManualBarcodeEntryPage)
  })
})

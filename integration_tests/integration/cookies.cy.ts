import Page from '../pages/page'
import CookiesPolicyPage from '../pages/cookiesPolicy'
import FindRecipientByPrisonNumberPage from '../pages/barcode/findRecipientByPrisonNumber'

context('Cookies', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
  })

  describe('Cookies Policy Page', () => {
    it('should remove cookie banner once accepted and acknowledged on the cookie policy page', () => {
      const cookiesPolicyPage: CookiesPolicyPage = FindRecipientByPrisonNumberPage.goToPage().clickCookieAction(
        CookiesPolicyPage,
        'view'
      )

      // Check the cookies-policy page looks ok and defaults to reject
      cookiesPolicyPage.doesntHaveCookieBanner()
      cookiesPolicyPage.acceptCookiePolicyRadioIs(false)
      cookiesPolicyPage.rejectCookiePolicyRadioIs(true)

      // Accept cookies and check the success banner is displayed
      cookiesPolicyPage.acceptCookiePolicy()
      Page.verifyOnPage(CookiesPolicyPage)
      cookiesPolicyPage.successBanner().should('exist')

      // Click the link to go back and the cookie banner should have gone
      cookiesPolicyPage.successBannerLink().click()
      Page.verifyOnPage(FindRecipientByPrisonNumberPage).doesntHaveCookieBanner()
    })

    it('should remove cookie banner once acknowledged on the cookie policy page', () => {
      // Accept cookies form the banner and go to the cookies page
      const findRecipientByPrisonNumberPage: FindRecipientByPrisonNumberPage =
        FindRecipientByPrisonNumberPage.goToPage().clickCookieAction(FindRecipientByPrisonNumberPage, 'accept')
      const cookiesPolicyPage: CookiesPolicyPage = findRecipientByPrisonNumberPage.clickCookieAction(
        CookiesPolicyPage,
        'view'
      )

      // The cookie policy page is now defaulted to accept
      cookiesPolicyPage.acceptCookiePolicyRadioIs(true)
      cookiesPolicyPage.rejectCookiePolicyRadioIs(false)

      // Accept cookies and check the success banner is displayed
      cookiesPolicyPage.saveCookiePolicy()
      Page.verifyOnPage(CookiesPolicyPage)
      cookiesPolicyPage.successBanner().should('exist')

      // Click the link to go back and the cookie banner should have gone
      cookiesPolicyPage.successBannerLink().click()
      Page.verifyOnPage(FindRecipientByPrisonNumberPage).doesntHaveCookieBanner()
    })

    it('should show cookie banner with hide button when visiting the cookie policy page but not acknowledging', () => {
      // Accept cookies form the banner and go to the cookies page
      const findRecipientByPrisonNumberPage: FindRecipientByPrisonNumberPage =
        FindRecipientByPrisonNumberPage.goToPage().clickCookieAction(FindRecipientByPrisonNumberPage, 'accept')
      findRecipientByPrisonNumberPage.clickCookieAction(CookiesPolicyPage, 'view')

      // Go back to the previous page and the hide button should still be there
      cy.go(-1)
      Page.verifyOnPage(FindRecipientByPrisonNumberPage).hasCookieBannerContaining('accepted').hasCookieAction('hide')
    })
  })

  describe('Find Recipient Page', () => {
    it('should show cookie banner on subsequent pages and accept cookies', () => {
      const page: FindRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

      // The cookie banner is available
      page.hasCookieAction('accept')
      page.hasCookieAction('reject')
      page.hasCookieAction('view')

      // Accept and acknowledge cookies in the banner
      page.clickCookieAction(FindRecipientByPrisonNumberPage, 'accept')
      page.clickCookieAction(FindRecipientByPrisonNumberPage, 'hide')
      page.doesntHaveCookieBanner()
    })
  })
})

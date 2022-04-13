declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to signIn as a DPS user. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn<S = unknown>(options?: { failOnStatusCode: false }): Chainable<S>

    /**
     * Custom command to sign in as a Legal Sender
     */
    signInAsLegalSender<S = unknown>(): Chainable<S>

    /**
     * Custom command to sign in as the smoke test environment Legal Sender
     */
    signInAsSmokeTestLegalSender<S = unknown>(): Chainable<S>
  }
}

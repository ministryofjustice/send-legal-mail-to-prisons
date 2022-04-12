const isLsjOneTimeCodeAuthEnabled = (): boolean => {
  return Cypress.env('ONE_TIME_CODE_AUTH_ENABLED') === true
}

export default {
  isLsjOneTimeCodeAuthEnabled,
}

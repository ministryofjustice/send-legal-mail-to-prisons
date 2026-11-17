const isLsjOneTimeCodeAuthEnabled = (): boolean => {
  return Cypress.expose('ONE_TIME_CODE_AUTH_ENABLED') === true
}

export default {
  isLsjOneTimeCodeAuthEnabled,
}

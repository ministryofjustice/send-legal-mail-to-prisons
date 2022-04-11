import config from '../config'

export default function legalSenderJourneyAuthenticationStartPage() {
  return config.featureFlags.lsjOneTimeCodeAuthEnabled ? '/oneTimeCode/request-code' : '/link/request-link'
}

import 'dotenv/config'

const production = process.env.NODE_ENV === 'production'

const toBoolean = (value: unknown): boolean => {
  return value === 'true'
}

function get(name: string, fallback: unknown, options = { requireInProduction: false }): string | null {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback === null) {
    return null
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback.toString()
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  maxSockets: 100

  maxFreeSockets: 10

  freeSocketTimeout: 30000
}

export interface ApiConfig {
  url: string
  basicAuth?: {
    user: string
    pass: string
  }
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  https: production,
  production,
  staticResourceCacheDuration: 20,
  barcodeTokenPublicKey: `-----BEGIN PUBLIC KEY-----
    ${get(
      'BARCODE_TOKEN_PUBLIC_KEY',
      'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA78zcjcV9dgxBngrVnyIeJ44fAxVSHOACU5OpiB9iNyaaKt9Itj66nu0LNiweQoQ6AyJ/2gMEJQ2qNXaaFf8eWWzgx9CHzEkAFoc8X696pmhYQDdhVTcIRBM+LiJTLDnTfcEIpvvHWMH9f/Ffn9gn3QcfFhGYj7Xl5VYvripRr9uQnF/s3LvOJNdSBLfnN7s8kYvGOQ7hPAHzLib+sVZAgjgBKNcE6AbZewUaWDn3IqMj0yxab3dOqtCoqYIWR3CN3PMaLiD1vq1BIbi8xuZE06Y+0xiOZrTH1rbx9CauVBNmWMNIvY+TMyZnfGiDDU0mTLNFYinXrHRae4ssSkSQMTrfCyp9H0iyXH/yoKTsEomMbvjUbeRQ8P70/T++YtTbSjb+Dpl99KNM0jQdglfo+OhZ7Fhma4lSd6p8j4dyo3SlUmyQguidcaF56xte6GDHTrePzABozDehM94YGjJBdA7MljC34A5QLBx+t1KnOrZlR2Ml6D4eIMe4BYx33DgtAgMBAAE=',
      requiredInProduction
    )}
    -----END PUBLIC KEY-----`.replace(/^\s+/gm, ''),
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'send-legal-mail-to-prisons', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'send-legal-mail-to-prisons-client', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: toBoolean(get('TOKEN_VERIFICATION_ENABLED', 'false')),
    },
    sendLegalMail: {
      url: get('SEND_LEGAL_MAIL_API_URL', 'http://localhost:8101', requiredInProduction),
      timeout: {
        response: Number(get('SEND_LEGAL_MAIL_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('SEND_LEGAL_MAIL_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(),
    },
    prisonRegister: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8101', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(),
    },
    gotenberg: {
      url: get('GOTENBERG_API_URL', 'http://localhost:3001', requiredInProduction),
    },
    zendesk: {
      url: get('ZENDESK_API_URL', 'http://localhost:8101', requiredInProduction),
      basicAuth: {
        user: get('ZENDESK_USER', requiredInProduction),
        pass: get('ZENDESK_TOKEN', requiredInProduction),
      },
      timeout: {
        response: Number(get('ZENDESK_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('ZENDESK_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  slmContainerId: get('SLM_TAG_MANAGER_CONTAINER_ID', null),
  checkRule39ContainerId: get('CHECK_RULE39_MAIL_TAG_MANAGER_CONTAINER_ID', null),
  magicLinkValidityDuration: Number(get('MAGIC_LINK_VALIDITY_DURATION_IN_MINUTES', 60)),
  oneTimeCodeValidityDuration: Number(get('ONE_TIME_CODE_VALIDITY_DURATION_IN_MINUTES', 30)),
  lsjSessionDuration: Number(get('LSJ_SESSION_DURATION_IN_DAYS', 7)),
  coversheetPdf: {
    printDebugInfo: toBoolean(get('COVERSHEET_PRINT_DEBUG', false)),
    addressLabelWidth: get('COVERSHEET_ADDRESS_LABEL_WIDTH', '90mm'),
    xOffsetDl: get('COVERSHEET_DL_OFFSET_X', '20mm'),
    yOffsetDl: get('COVERSHEET_DL_OFFSET_Y', '55mm'),
    xOffsetC5: get('COVERSHEET_C5_OFFSET_X', '20mm'),
    yOffsetC5: get('COVERSHEET_C5_OFFSET_Y', '42mm'),
    xOffsetC4: get('COVERSHEET_C4_OFFSET_X', '24mm'),
    yOffsetC4: get('COVERSHEET_C4_OFFSET_Y', '67mm'),
  },
  phaseBannerLink: {
    legalSenderJourney: get(
      'LEGAL_SENDER_PHASE_BANNER_LINK',
      'https://send-legal-mail-to-prisons.form.service.justice.gov.uk/'
    ),
    mailRoomJourney: get(
      'MAIL_ROOM_PHASE_BANNER_LINK',
      'https://send-legal-mail-to-prisons.form.service.justice.gov.uk/'
    ),
  },
  smoketest: {
    msjSecret: get('APP_SMOKETEST_MSJSECRET', null),
    lsjSecret: get('APP_SMOKETEST_LSJSECRET', null),
  },
  featureFlags: {
    lsjOneTimeCodeAuthEnabled: toBoolean(get('ONE_TIME_CODE_AUTH_ENABLED', false)),
  },
}

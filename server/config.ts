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
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  https: production,
  production,
  staticResourceCacheDuration: 20,
  barcodeTokenPublicKey: `-----BEGIN PUBLIC KEY-----
    ${get(
      'BARCODE_TOKEN_PUBLIC_KEY',
      'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAnKf2/0ffidVro/KXXXobH98tm3qRAOLmk/jBB/CUw/13ITvd/l0ECiT8Dq+aUAUrHK+rRDk8iCuZMD3JYQRW1NUEw9zXG408DNHZo1alDo9EoP4KIL6gV8h2AdyV0Fra3guCGuuMzF+aRbIEHNDx/NWEjOXXibTrIxXPxbEiI4yfcjLyUiusE9T7ZHlaTEDNA4zaDcY98LJs5B17l/h3Q8RYwLGlZe1HJkhi/IxeYzX6+OQZdozFWRSmJDMwJ4oAdXOnE5jLl3q6IzKYWJxkt8z8ITcXzSWLMKEqkYxBS4eO5dsWMRK8x9njtOrj8I0jppNJIDt0dwjfldXhUmLIVQABW7TdAhJsAq/RY2K1NjoQvsQpzThjrkHGRkKIAClK0N4XccwKNiTmI/wMQ5ec/6sNJYEZko4wIUAGb4u1kNJtqupwErau6jL8ffkkSBQNzoQyI5WrTaRnwOrqkgHO/W0GisMNc+RC1z/KFtO9ybRFRB21/4cHCeH7NugdEHI7AgMBAAE=',
      requiredInProduction,
    )}
    -----END PUBLIC KEY-----`.replace(/^\s+/gm, ''),
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
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
      'https://submit.forms.service.gov.uk/form/263708/send-legal-mail-to-prisons/',
    ),
    mailRoomJourney: get(
      'MAIL_ROOM_PHASE_BANNER_LINK',
      'https://submit.forms.service.gov.uk/form/263708/send-legal-mail-to-prisons/',
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

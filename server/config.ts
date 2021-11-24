import 'dotenv/config'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
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
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  https: production,
  staticResourceCacheDuration: 20,
  barcodeTokenPublicKey: `-----BEGIN PUBLIC KEY-----
${get(
  'BARCODE_TOKEN_PUBLIC_KEY',
  'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAnKf2/0ffidVro/KXXXobH98tm3qRAOLmk/jBB/CUw/13ITvd/l0ECiT8Dq+aUAUrHK+rRDk8iCuZMD3JYQRW1NUEw9zXG408DNHZo1alDo9EoP4KIL6gV8h2AdyV0Fra3guCGuuMzF+aRbIEHNDx/NWEjOXXibTrIxXPxbEiI4yfcjLyUiusE9T7ZHlaTEDNA4zaDcY98LJs5B17l/h3Q8RYwLGlZe1HJkhi/IxeYzX6+OQZdozFWRSmJDMwJ4oAdXOnE5jLl3q6IzKYWJxkt8z8ITcXzSWLMKEqkYxBS4eO5dsWMRK8x9njtOrj8I0jppNJIDt0dwjfldXhUmLIVQABW7TdAhJsAq/RY2K1NjoQvsQpzThjrkHGRkKIAClK0N4XccwKNiTmI/wMQ5ec/6sNJYEZko4wIUAGb4u1kNJtqupwErau6jL8ffkkSBQNzoQyI5WrTaRnwOrqkgHO/W0GisMNc+RC1z/KFtO9ybRFRB21/4cHCeH7NugdEHI7AgMBAAE=',
  requiredInProduction
)}
-----END PUBLIC KEY-----`,
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
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'send-legal-mail-admin', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'client_secret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    sendLegalMail: {
      url: get('SEND_LEGAL_MAIL_API_URL', 'http://localhost:8101', requiredInProduction) as string,
      timeout: {
        response: Number(get('SEND_LEGAL_MAIL_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('SEND_LEGAL_MAIL_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  gtmContainerId: get('GOOGLE_TAG_MANAGER_CONTAINER_ID', null),
}

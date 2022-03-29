/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/contact/{id}': {
    get: operations['getContact']
    put: operations['updateContact']
  }
  '/link/verify': {
    /** Verifies a CJSM email link secret and swaps it for an authentication token if valid. */
    post: operations['verifyMagicLink']
  }
  '/link/email': {
    /** Creates a CJSM email link and send to the email address entered by the user. */
    post: operations['createMagicLink']
  }
  '/contact': {
    post: operations['createContact']
  }
  '/barcode': {
    post: operations['createBarcode']
  }
  '/barcode/event/more-checks-requested': {
    post: operations['createBarcodeMoreChecksRequestedEvent']
  }
  '/barcode/check': {
    post: operations['checkBarcode']
  }
  '/barcode-stats-report': {
    post: operations['createBarcodeStatsReport']
  }
  '/contacts': {
    get: operations['searchContactsByName']
  }
  '/contact/prisonNumber/{prisonNumber}': {
    get: operations['getContactByPrisonNumber']
  }
  '/cjsm/user/me': {
    get: operations['getUserDetails']
  }
}

export interface components {
  schemas: {
    ContactRequest: {
      /**
       * @description The name of the new contact
       * @example John Doe
       */
      prisonerName: string
      /**
       * @description The ID of the prison location of the new contact
       * @example BXI
       */
      prisonId: string
      /**
       * Format: date
       * @description The date of birth of the new contact if known
       * @example 1965-04-23
       */
      dob?: string
      /**
       * @description The prison number of the new contact if known
       * @example A1234BC
       */
      prisonNumber?: string
    }
    AuthenticationError: {
      code: string
      userMessage: string
    }
    CheckBarcodeErrorCodes: components['schemas']['ErrorCode'] & {
      /** @enum {string} */
      code?: 'DUPLICATE' | 'EXPIRED' | 'RANDOM_CHECK'
      userMessage?: string
    } & (
        | components['schemas']['Duplicate']
        | components['schemas']['Expired']
        | components['schemas']['RandomCheck']
      ) & {
        code: unknown
        userMessage: unknown
      }
    DownstreamError: {
      code: string
      userMessage: string
    }
    Duplicate: {
      /**
       * Format: date-time
       * @description The time that the original barcode was scanned
       * @example 2021-11-30T09:06:10Z
       */
      scannedDate: string
      /**
       * @description The prison where the original barcode was scanned
       * @example MDI
       */
      scannedLocation: string
      /**
       * @description The organisation that created the barcode in the first place
       * @example Aardvark Solicitors
       */
      createdBy: string
      /**
       * @description The original barcode recipient name
       * @example John Smith
       */
      recipientName: string
      /**
       * @description The original barcode recipient prison number
       * @example A1234BC
       */
      recipientPrisonNumber?: string
      /**
       * Format: date
       * @description The original barcode recipient date of birth
       * @example 1990-01-02
       */
      recipientDob?: string
      code: string
      userMessage: string
    }
    EmailInvalid: {
      code: string
      userMessage: string
    }
    EmailInvalidCjsm: {
      code: string
      userMessage: string
    }
    EmailMandatory: {
      code: string
      userMessage: string
    }
    EmailTooLong: {
      code: string
      userMessage: string
    }
    /** @description The error code describing the error */
    ErrorCode: {
      /**
       * @description The error code
       * @example ERROR_IDENTIFIER
       */
      code: string
      /**
       * @description A human readable description of the error
       * @example An error occurred
       */
      userMessage: string
    }
    ErrorResponse: {
      /**
       * Format: int32
       * @description The HTTP status code
       * @example 400
       */
      status: number
      errorCode: components['schemas']['ErrorCode']
    }
    Expired: {
      /**
       * Format: date-time
       * @description The time the barcode was created
       * @example 2021-11-30T09:06:10Z
       */
      createdDate: string
      /**
       * Format: int64
       * @description The number of days before a barcode expires
       * @example 28
       */
      barcodeExpiryDays: number
      /**
       * @description The organisation that created the barcode in the first place
       * @example Aardvark Solicitors
       */
      createdBy: string
      code: string
      userMessage: string
    }
    InternalError: {
      code: string
      userMessage: string
    }
    MagicLinkRequestErrorCodes: components['schemas']['ErrorCode'] & {
      /** @enum {string} */
      code?: 'EMAIL_MANDATORY' | 'EMAIL_TOO_LONG' | 'INVALID_EMAIL' | 'INVALID_CJSM_EMAIL'
      userMessage?: string
    } & (
        | components['schemas']['EmailMandatory']
        | components['schemas']['EmailTooLong']
        | components['schemas']['EmailInvalid']
        | components['schemas']['EmailInvalidCjsm']
      ) & {
        code: unknown
        userMessage: unknown
      }
    MalformedRequest: {
      code: string
      userMessage: string
    }
    NotFound: {
      code: string
      userMessage: string
    }
    RandomCheck: {
      /**
       * @description The organisation that created the barcode in the first place
       * @example Aardvark Solicitors
       */
      createdBy: string
      code: string
      userMessage: string
    }
    StandardErrorCodes: components['schemas']['ErrorCode'] & {
      /** @enum {string} */
      code?: 'AUTH' | 'DOWNSTREAM' | 'INTERNAL_ERROR' | 'MALFORMED_REQUEST' | 'NOT_FOUND'
      userMessage?: string
    } & (
        | components['schemas']['AuthenticationError']
        | components['schemas']['DownstreamError']
        | components['schemas']['InternalError']
        | components['schemas']['MalformedRequest']
        | components['schemas']['NotFound']
      ) & {
        code: unknown
        userMessage: unknown
      }
    ContactResponse: {
      /**
       * Format: int64
       * @description The ID of the contact
       * @example 1
       */
      id: number
      /**
       * @description The name of the contact
       * @example John Doe
       */
      prisonerName: string
      /**
       * @description The ID of the prison location of the contact
       * @example BXI
       */
      prisonId: string
      /**
       * Format: date
       * @description The date of birth of the contact if known
       * @example 1965-04-23
       */
      dob?: string
      /**
       * @description The prison number of the contact if known
       * @example A1234BC
       */
      prisonNumber?: string
    }
    VerifyLinkRequest: {
      /** @description The secret to verify */
      secret: string
    }
    VerifyLinkResponse: {
      /** @description The JWT */
      token: string
    }
    MagicLinkRequest: {
      /**
       * @description The email address to send the CJSM email link to
       * @example andrew.barret@company.com
       */
      email: string
    }
    CreateBarcodeRequest: {
      /**
       * @description The recipient name
       * @example John Doe
       */
      prisonerName: string
      /**
       * @description The ID of the prison where the recipient is located
       * @example BXI
       */
      prisonId: string
      /**
       * Format: date
       * @description The date of birth of the recipient if known
       * @example 1965-04-23
       */
      dob?: string
      /**
       * @description The prison number of the recipient if known
       * @example A1234BC
       */
      prisonNumber?: string
      /**
       * Format: int64
       * @description The ID of the contact if known
       * @example 1234
       */
      contactId?: number
    }
    CreateBarcodeResponse: {
      /**
       * @description The generated barcode
       * @example 123456789012
       */
      barcode: string
    }
    CheckBarcodeRequest: {
      /**
       * @description The barcode being checked
       * @example 123456789012
       */
      barcode: string
    }
    CheckBarcodeResponse: {
      /**
       * @description The organisation that created the barcode
       * @example Aardvark Solicitors
       */
      createdBy: string
    }
    UserDetails: {
      /**
       * @description The ID of the user
       * @example some.user@some.solicitors.cjsm.net
       */
      userId: string
      /**
       * @description The organisation of the user
       * @example Some Solicitors Ltd
       */
      organisation?: string
      /**
       * @description The organisation type
       * @example Barristers
       */
      organisationType?: string
      /**
       * @description The user's town or city
       * @example London
       */
      townOrCity?: string
    }
    Link: {
      href?: string
      hreflang?: string
      title?: string
      type?: string
      deprecation?: string
      profile?: string
      name?: string
      templated?: boolean
    }
    Links: { [key: string]: components['schemas']['Link'] }
  }
}

export interface operations {
  getContact: {
    parameters: {
      path: {
        id: number
      }
    }
    responses: {
      /** Contact udpated */
      200: {
        content: {
          'application/json': components['schemas']['ContactResponse']
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid CJSM email link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_CREATE_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  updateContact: {
    parameters: {
      path: {
        id: number
      }
    }
    responses: {
      /** Contact udpated */
      200: {
        content: {
          'application/json': components['schemas']['ContactResponse']
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid CJSM email link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_CREATE_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Conflict, the specified new contact already exists for this user. See ContactErrorCodes. */
      409: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ContactRequest']
      }
    }
  }
  /** Verifies a CJSM email link secret and swaps it for an authentication token if valid. */
  verifyMagicLink: {
    responses: {
      /** Authentication token created */
      201: {
        content: {
          'application/json': components['schemas']['VerifyLinkResponse']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Not found, unable to verify the CJSM email link */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['VerifyLinkRequest']
      }
    }
  }
  /** Creates a CJSM email link and send to the email address entered by the user. */
  createMagicLink: {
    responses: {
      /** CJSM email link created */
      201: {
        content: {
          'application/json': unknown
        }
      }
      /** Bad request. For specific errors see the Schema for MagicLinkRequestErrorCodes */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['MagicLinkRequest']
      }
    }
  }
  createContact: {
    responses: {
      /** Contact created */
      201: {
        content: {
          'application/json': components['schemas']['ContactResponse']
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid CJSM email link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_CREATE_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Conflict, the specified new contact already exists for this user. See ContactErrorCodes. */
      409: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ContactRequest']
      }
    }
  }
  createBarcode: {
    responses: {
      /** Barcode created */
      201: {
        content: {
          'application/json': components['schemas']['CreateBarcodeResponse']
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid magic link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateBarcodeRequest']
      }
    }
  }
  createBarcodeMoreChecksRequestedEvent: {
    responses: {
      /** Barcode flagged as needing more checks */
      201: {
        content: {
          'application/json': components['schemas']['CheckBarcodeResponse']
        }
      }
      /** Bad request. For specific errors see the Schema for CheckBarcodeErrorCodes */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_SCAN_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CheckBarcodeRequest']
      }
    }
  }
  checkBarcode: {
    responses: {
      /** Barcode is OK and no further checks are required */
      200: {
        content: {
          'application/json': components['schemas']['CheckBarcodeResponse']
        }
      }
      /** Bad request. For specific errors see the Schema for CheckBarcodeErrorCodes */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_SCAN_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CheckBarcodeRequest']
      }
    }
  }
  createBarcodeStatsReport: {
    responses: {
      /** Report created and emailed */
      201: unknown
      /** No recipients configured. Add a comma separated list of email addresses to helm values file entry env.APP_BARCODE_STATS_REPORT_RECIPIENT_EMAILS. */
      404: unknown
    }
  }
  searchContactsByName: {
    parameters: {
      query: {
        /** The name or partial name of the Contacts to return. Case insensitive. */
        name: string
      }
    }
    responses: {
      /** Matching Contacts */
      200: {
        content: {
          'application/json': components['schemas']['ContactResponse'][]
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid CJSM email link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_CREATE_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  getContactByPrisonNumber: {
    parameters: {
      path: {
        /** The prison number of the Contact to return. */
        prisonNumber: string
      }
    }
    responses: {
      /** Contact returned */
      200: {
        content: {
          'application/json': components['schemas']['ContactResponse']
        }
      }
      /** Unauthorised, requires a valid magic link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires a valid token with role ROLE_SLM_CREATE_BARCODE */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  getUserDetails: {
    responses: {
      /** OK */
      200: {
        content: {
          'application/json': components['schemas']['UserDetails']
        }
      }
      /** Bad request */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid magic link token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Not found, the email is not in the CJSM directory */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
}

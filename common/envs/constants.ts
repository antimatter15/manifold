import { DEV_CONFIG } from './dev'
import { EnvConfig, PROD_CONFIG } from './prod'
import { THEOREMONE_CONFIG } from './theoremone'

const ENV = process.env.NEXT_PUBLIC_FIREBASE_ENV ?? 'PROD'

const CONFIGS = {
  PROD: PROD_CONFIG,
  DEV: DEV_CONFIG,
  THEOREMONE: THEOREMONE_CONFIG,
}
// @ts-ignore
export const ENV_CONFIG: EnvConfig = CONFIGS[ENV]

export function isWhitelisted(email?: string) {
  if (!ENV_CONFIG.whitelistEmail) {
    return true
  }
  return email && (email.endsWith(ENV_CONFIG.whitelistEmail) || isAdmin(email))
}

// TODO: Before open sourcing, we should turn these into env vars
export function isAdmin(email: string) {
  return ENV_CONFIG.adminEmails.includes(email)
}

export const DOMAIN = ENV_CONFIG.domain
export const FIREBASE_CONFIG = ENV_CONFIG.firebaseConfig
export const PROJECT_ID = ENV_CONFIG.firebaseConfig.projectId
export const IS_PRIVATE_MANIFOLD = ENV_CONFIG.visibility === 'PRIVATE'

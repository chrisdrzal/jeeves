import {
  callService,
  createConnection,
  ERR_INVALID_AUTH,
  getAuth,
  subscribeEntities,
  type Connection,
  type HassEntities,
} from 'home-assistant-js-websocket'

const TOKEN_KEY = 'jeeves:homeassistant:tokens'
let activeConnection: Connection | undefined

export function hasSavedHomeAssistantAuth(): boolean {
  return window.localStorage.getItem(TOKEN_KEY) !== null
}

// The website and Home Assistant are hosted on the same Raspberry Pi.
// Using the current hostname works on the Pi AND at http://jeeves.local.
export async function connectHomeAssistant(
  onEntities: (entities: HassEntities) => void,
  onConnectionStatus: (connected: boolean) => void,
): Promise<void> {
  const hassUrl = `${window.location.protocol}//${window.location.hostname}:8123`

  const auth = await getAuth({
    hassUrl,
    redirectUrl: `${window.location.origin}/`,
    limitHassInstance: true,
    loadTokens: async () => {
      try {
        const saved = window.localStorage.getItem(TOKEN_KEY)
        return saved ? JSON.parse(saved) : undefined
      } catch {
        window.localStorage.removeItem(TOKEN_KEY)
        return undefined
      }
    },
    saveTokens: (tokens) => {
      if (tokens === null) {
        window.localStorage.removeItem(TOKEN_KEY)
      } else {
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
      }
    },
  })

  let connection
  try {
    connection = await createConnection({ auth })
  } catch (error) {
    if (error === ERR_INVALID_AUTH) {
      window.localStorage.removeItem(TOKEN_KEY)
      throw new Error('Your Home Assistant login expired. Click Connect again to sign in.')
    }
    throw error
  }

  activeConnection = connection
  connection.addEventListener('disconnected', () => onConnectionStatus(false))
  connection.addEventListener('ready', () => onConnectionStatus(true))
  onConnectionStatus(true)
  subscribeEntities(connection, onEntities)

  // Remove the one-time OAuth authorization code from the browser address bar.
  if (new URLSearchParams(window.location.search).has('auth_callback')) {
    window.history.replaceState(window.history.state, '', window.location.pathname)
  }
}

export async function toggleHomeAssistantLight(entityId: string): Promise<void> {
  const domain = entityId.split('.')[0]
  if (domain !== 'light' && domain !== 'switch') {
    throw new Error('Only light and switch entities can be controlled here.')
  }
  if (!activeConnection?.connected) {
    throw new Error('Home Assistant is disconnected. Reconnect before controlling lights.')
  }

  await callService(activeConnection, domain, 'toggle', { entity_id: entityId })
}

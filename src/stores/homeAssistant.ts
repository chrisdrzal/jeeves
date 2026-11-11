import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { HassEntities } from 'home-assistant-js-websocket'
import {
  connectHomeAssistant,
  toggleHomeAssistantLight,
} from '@/services/homeAssistantService'

export const useHomeAssistantStore = defineStore('homeAssistant', () => {
  // A complete replacement object is supplied on each subscription update.
  // shallowRef makes Vue re-render without deeply wrapping every sensor.
  const entities = shallowRef<HassEntities>({})
  const connected = ref(false)
  const connecting = ref(false)
  const started = ref(false)
  const error = ref('')

  async function connect() {
    if (started.value || connecting.value) return
    connecting.value = true
    error.value = ''

    try {
      await connectHomeAssistant(
        (updated) => { entities.value = updated },
        (isConnected) => { connected.value = isConnected },
      )
      started.value = true
    } catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : `Could not connect to Home Assistant (${String(cause)})`
      connected.value = false
    } finally {
      connecting.value = false
    }
  }

  async function toggleLight(entityId: string) {
    if (!connected.value) {
      throw new Error('Home Assistant is disconnected. Reconnect before controlling lights.')
    }
    await toggleHomeAssistantLight(entityId)
  }

  return { entities, connected, connecting, started, error, connect, toggleLight }
})

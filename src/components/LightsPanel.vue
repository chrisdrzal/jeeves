<script setup lang="ts">
import { computed, ref } from 'vue'
import { Lightbulb, Power } from 'lucide-vue-next'
import { useHomeAssistantStore } from '@/stores/homeAssistant'

const ha = useHomeAssistantStore()
const supportedSwitches = new Set([
  'christmas lights 1',
  'christmas lights 2',
  'christmas lights 3',
  'listening room lamp 1',
  'listening room lamp 2',
  'office light - fan',
])
const roomRules = [
  { room: 'Master Bedroom', pattern: /master bedroom/i },
  { room: 'Guest Bedroom 1', pattern: /guest (?:bedroom|room) 1/i },
  { room: 'Guest Bedroom 2', pattern: /guest (?:bedroom|room) 2/i },
  { room: 'Living Room', pattern: /living ?room/i },
  { room: 'Listening Room', pattern: /listening room/i },
  { room: 'Office', pattern: /office/i },
  { room: 'Basement', pattern: /basement/i },
  { room: 'Christmas Lights', pattern: /christmas lights/i },
]
const roomOrder = [
  'Master Bedroom',
  'Guest Bedroom 1',
  'Guest Bedroom 2',
  'Living Room',
  'Listening Room',
  'Office',
  'Basement',
  'Christmas Lights',
  'Other Lights',
]
const pendingEntityIds = ref(new Set<string>())
const commandErrors = ref<Record<string, string>>({})

const lights = computed(() =>
  Object.values(ha.entities).filter((entity) => {
    const friendlyName = String(entity.attributes.friendly_name ?? '').trim()
    if (/christmas tree/i.test(friendlyName)) return false
    if (entity.entity_id.startsWith('light.')) return true
    return entity.entity_id.startsWith('switch.') &&
      supportedSwitches.has(friendlyName.toLowerCase())
  }),
)

const groupedLights = computed(() => {
  const groups = new Map<string, typeof lights.value>()

  for (const entity of lights.value) {
    const friendlyName = String(entity.attributes.friendly_name ?? entity.entity_id)
    const room = roomRules.find((rule) => rule.pattern.test(friendlyName))?.room ?? 'Other Lights'
    const group = groups.get(room) ?? []
    group.push(entity)
    groups.set(room, group)
  }

  return [...groups.entries()]
    .sort(([roomA], [roomB]) => roomOrder.indexOf(roomA) - roomOrder.indexOf(roomB))
    .map(([room, entities]) => ({
      room,
      entities: entities.sort((a, b) =>
        String(a.attributes.friendly_name ?? a.entity_id).localeCompare(
          String(b.attributes.friendly_name ?? b.entity_id),
        ),
      ),
    }))
})

const isToggleable = (entity: (typeof lights.value)[number]) =>
  entity.state === 'on' || entity.state === 'off'

const stateLabel = (state: string) => {
  if (state === 'on') return 'On'
  if (state === 'off') return 'Off'
  return 'Unavailable'
}

async function toggleLight(entity: (typeof lights.value)[number]) {
  const entityId = entity.entity_id
  if (!ha.connected || !isToggleable(entity) || pendingEntityIds.value.has(entityId)) return

  pendingEntityIds.value = new Set([...pendingEntityIds.value, entityId])
  commandErrors.value = { ...commandErrors.value, [entityId]: '' }

  try {
    await ha.toggleLight(entityId)
  } catch (cause) {
    commandErrors.value = {
      ...commandErrors.value,
      [entityId]: cause instanceof Error ? cause.message : `Could not control ${entityId}.`,
    }
  } finally {
    const nextPending = new Set(pendingEntityIds.value)
    nextPending.delete(entityId)
    pendingEntityIds.value = nextPending
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-300/20">
          <Lightbulb class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-100">Lights</h1>
          <p class="mt-1 text-sm text-slate-400">
            Home Assistant
            <span v-if="ha.connected" class="text-emerald-400">· Connected</span>
            <span v-else-if="ha.started" class="text-amber-300">· Disconnected</span>
            <span v-else>· Not connected</span>
          </p>
        </div>
      </div>
      <button
        v-if="!ha.started"
        type="button"
        :disabled="ha.connecting"
        class="rounded-lg border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        @click="ha.connect()"
      >
        {{ ha.connecting ? 'Connecting…' : 'Connect Home Assistant' }}
      </button>
    </header>

    <p v-if="ha.error" class="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {{ ha.error }}
    </p>
    <p v-else-if="!ha.connected" class="text-sm text-slate-400">
      Device controls are disabled until Home Assistant reconnects.
    </p>

    <p v-if="ha.connected && lights.length === 0" class="text-sm text-slate-400">
      No configured lights or supported switches were found.
    </p>

    <div v-for="group in groupedLights" :key="group.room" class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {{ group.room }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="entity in group.entities"
          :key="entity.entity_id"
          class="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-700/80 bg-slate-900/70 p-4"
        >
          <div class="min-w-0">
            <h3 class="truncate text-sm font-medium text-slate-100">
              {{ entity.attributes.friendly_name ?? entity.entity_id }}
            </h3>
            <span
              class="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="entity.state === 'on'
                ? 'bg-emerald-400/10 text-emerald-300'
                : entity.state === 'off'
                  ? 'bg-slate-700/70 text-slate-300'
                  : 'bg-rose-400/10 text-rose-300'"
            >
              {{ stateLabel(entity.state) }}
            </span>
            <p v-if="commandErrors[entity.entity_id]" class="mt-2 text-xs text-rose-300">
              {{ commandErrors[entity.entity_id] }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-600/80 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!ha.connected || !isToggleable(entity) || pendingEntityIds.has(entity.entity_id)"
            :aria-label="pendingEntityIds.has(entity.entity_id)
              ? `Updating ${entity.attributes.friendly_name ?? entity.entity_id}`
              : `Turn ${entity.state === 'on' ? 'off' : 'on'} ${entity.attributes.friendly_name ?? entity.entity_id}`"
            @click="toggleLight(entity)"
          >
            <Power class="h-4 w-4" />
            {{ pendingEntityIds.has(entity.entity_id)
              ? 'Sending…'
              : isToggleable(entity)
                ? `Turn ${entity.state === 'on' ? 'off' : 'on'}`
                : 'Unavailable' }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
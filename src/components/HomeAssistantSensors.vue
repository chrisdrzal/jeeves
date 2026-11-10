<script setup lang="ts">
import { computed } from 'vue'
import { useHomeAssistantStore } from '@/stores/homeAssistant'

const ha = useHomeAssistantStore()
const sensorClasses = new Set(['temperature', 'humidity', 'battery'])

// First pass: show all climate/battery readings returned by Home Assistant.
// Once the Govee entity IDs are confirmed, we can filter by device or room.
const sensors = computed(() =>
  Object.values(ha.entities)
    .filter((entity) =>
      entity.entity_id.startsWith('sensor.') &&
      sensorClasses.has(String(entity.attributes.device_class ?? '')),
    )
    .sort((a, b) =>
      String(a.attributes.friendly_name ?? a.entity_id)
        .localeCompare(String(b.attributes.friendly_name ?? b.entity_id)),
    ),
)
</script>

<template>
  <section class="mt-6 rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-slate-100">Live Home Sensors</h2>
        <p class="mt-1 text-sm text-slate-400">
          Home Assistant
          <span v-if="ha.connected" class="text-emerald-400">· Connected</span>
          <span v-else-if="ha.started" class="text-amber-300">· Reconnecting…</span>
          <span v-else>· Not connected</span>
        </p>
      </div>
      <button
        v-if="!ha.started"
        type="button"
        :disabled="ha.connecting"
        class="rounded-lg border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 disabled:opacity-50"
        @click="ha.connect()"
      >
        {{ ha.connecting ? 'Connecting…' : 'Connect Home Assistant' }}
      </button>
    </div>

    <p v-if="ha.error" class="mb-4 text-sm text-rose-300">{{ ha.error }}</p>

    <template v-if="ha.connected">
      <p v-if="sensors.length === 0" class="text-sm text-slate-400">
        Connected. No temperature, humidity, or battery sensor entities are available yet.
      </p>
      <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="sensor in sensors"
          :key="sensor.entity_id"
          class="rounded-xl border border-slate-700/80 bg-slate-800/60 p-4"
        >
          <div class="text-sm text-slate-300">
            {{ sensor.attributes.friendly_name ?? sensor.entity_id }}
          </div>
          <div class="mt-2 text-2xl font-semibold text-white">
            {{ sensor.state }}{{ sensor.attributes.unit_of_measurement ?? '' }}
          </div>
          <div class="mt-1 break-all text-xs text-slate-500">{{ sensor.entity_id }}</div>
        </div>
      </div>
    </template>
  </section>
</template>

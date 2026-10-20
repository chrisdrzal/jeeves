<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { Button } from '@/components/ui/button'
import {
  Bell,
  ChevronRight,
  CloudRain,
  CloudSun,
  Droplets,
  Home,
  Lightbulb,
  Menu,
  MoonStar,
  Plug,
  Shield,
  Sun,
  Wind,
} from 'lucide-vue-next'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const store = useDashboardStore()

const navItems = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Lights', icon: Lightbulb },
  { label: 'Plugs', icon: Plug },
  { label: 'Climate', icon: CloudRain },
  { label: 'Security', icon: Shield },
  { label: 'Energy', icon: Sun },
  { label: 'Cameras', icon: Bell },
  { label: 'Network', icon: Wind },
  { label: 'Database', icon: CloudSun },
  { label: 'Settings', icon: Menu },
]

const chartOption = computed(() => ({
  animation: false,
  grid: { left: 18, right: 12, top: 18, bottom: 16 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    data: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 5,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.12)' } },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 3, color: '#22c55e' },
      areaStyle: {
        color: 'rgba(34, 197, 94, 0.12)',
      },
      data: [2.2, 1.6, 1.2, 1.8, 2.5, 3.6, 3.1, 4.1, 3.7, 2.4, 2.7],
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-[#071822] text-slate-100">
    <div class="mx-auto max-w-[1600px] border border-slate-700/60 bg-[#071822] shadow-2xl shadow-slate-950/40">
      <header class="flex items-center justify-between border-b border-slate-700/70 bg-[#081d2a]/95 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30">
            <CloudSun class="h-5 w-5" />
          </div>
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-slate-100">Jeeves</h1>
            <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>Home</span>
              <span class="text-slate-500">•</span>
              <span>Energy</span>
              <span class="text-slate-500">•</span>
              <span>Security</span>
              <span class="text-slate-500">•</span>
              <span>Everything in One Place</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right text-sm text-slate-300">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Monday, Apr 28, 2025</div>
            <div class="mt-1 flex items-center gap-3 text-[2.1rem] font-medium leading-none tracking-tight text-slate-100">
              <span>6:24</span>
              <span class="text-lg font-semibold text-slate-400">PM</span>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-xl border border-slate-600/70 bg-slate-900/70 px-3 py-2">
            <Home class="h-4 w-4 text-sky-300" />
            <span class="text-sm text-slate-200">Home</span>
            <span class="ml-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
          </div>
        </div>
      </header>

      <div class="flex min-h-[860px]">
        <aside class="w-64 border-r border-slate-700/70 bg-[#071822] p-5">
          <nav class="space-y-2">
            <div v-for="item in navItems" :key="item.label" class="group">
              <button
                :class="[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all',
                  item.active
                    ? 'bg-sky-500/20 text-sky-200 shadow-inner shadow-sky-500/20 ring-1 ring-sky-400/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
                ]"
              >
                <component :is="item.icon" class="h-4 w-4" />
                <span>{{ item.label }}</span>
              </button>
            </div>
          </nav>
        </aside>

        <main class="flex-1 p-6">
          <section class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div class="rounded-[28px] border border-slate-700/70 bg-[rgba(15,23,42,0.85)] p-6 shadow-inner shadow-slate-950/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-300 ring-1 ring-slate-700">
                    <CloudSun class="h-7 w-7" />
                  </div>
                  <div>
                    <p class="text-4xl font-semibold tracking-tight text-slate-100">{{ store.weather.temp }}°F</p>
                    <p class="text-xl text-slate-300">{{ store.weather.summary }}</p>
                  </div>
                </div>

                <div class="space-y-3 text-sm text-slate-300">
                  <div class="flex items-center gap-2">
                    <Droplets class="h-4 w-4 text-sky-300" />
                    <span>Humidity</span>
                    <span class="ml-2 font-semibold text-slate-100">{{ store.weather.humidity }}%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Wind class="h-4 w-4 text-sky-300" />
                    <span>Wind</span>
                    <span class="ml-2 font-semibold text-slate-100">{{ store.weather.wind }} mph NW</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Sun class="h-4 w-4 text-amber-300" />
                    <span>Sunrise</span>
                    <span class="ml-2 font-semibold text-slate-100">{{ store.weather.sunrise }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-7 grid grid-cols-6 gap-3">
                <div
                  v-for="slot in store.weather.hourly"
                  :key="slot.time"
                  class="rounded-2xl border border-slate-700/80 bg-slate-800/60 p-3 text-center"
                >
                  <div class="mb-3 flex justify-center text-slate-300">
                    <MoonStar v-if="slot.temp < 50" class="h-5 w-5 text-slate-200" />
                    <CloudSun v-else class="h-5 w-5 text-amber-300" />
                  </div>
                  <div class="text-2xl font-light text-slate-100">{{ slot.temp }}°</div>
                  <div class="mt-2 text-xs text-slate-400">{{ slot.time }}</div>
                </div>
              </div>
            </div>

            <div class="rounded-[28px] border border-slate-700/70 bg-[rgba(15,23,42,0.85)] p-5 shadow-inner shadow-slate-950/30">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-sky-300 ring-1 ring-slate-700">
                    <CloudRain class="h-5 w-5" />
                  </div>
                  <h2 class="text-xl font-semibold text-slate-100">Weather</h2>
                </div>
                <Button variant="secondary" size="sm" class="rounded-lg border border-slate-600/70 bg-slate-800/70 text-slate-200">
                  Today
                </Button>
              </div>

              <div class="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
                <div class="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Forecast</span>
                  <span class="text-sky-300">Updated 2 min ago</span>
                </div>
                <div class="h-40">
                  <VChart :option="chartOption" autoresize style="height: 100%; width: 100%;" />
                </div>
                <div class="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                </div>
              </div>

              <div class="mt-5 items-center justify-between rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 text-sm text-slate-200">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Next up</span>
                  <ChevronRight class="h-4 w-4 text-slate-500" />
                </div>
                <div class="mt-3 flex items-center justify-between text-base">
                  <span>7:48 PM</span>
                  <span class="font-medium text-sky-300">Sunset</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

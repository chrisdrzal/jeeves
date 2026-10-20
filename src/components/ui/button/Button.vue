<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
    class?: string
  }>(),
  {
    variant: 'default',
    size: 'default',
  },
)

const buttonClass = computed(() =>
  cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-sky-500 text-slate-950 shadow-sm hover:bg-sky-400': props.variant === 'default',
      'bg-slate-700/70 text-slate-100 hover:bg-slate-600/80': props.variant === 'secondary',
      'bg-transparent text-slate-200 hover:bg-slate-700/40': props.variant === 'ghost',
      'h-10 px-4 py-2': props.size === 'default',
      'h-8 px-3 text-xs': props.size === 'sm',
      'h-11 px-5 text-base': props.size === 'lg',
    },
    props.class,
  ),
)
</script>

<template>
  <button :class="buttonClass">
    <slot />
  </button>
</template>

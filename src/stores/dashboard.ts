import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { fetchWeatherData } from '@/services/weatherService'
import type { WeatherData, WeatherForecastDay } from '@/types/weather'

export const useDashboardStore = defineStore('dashboard', () => {
  const navItems = [
    { label: 'Home', active: true },
    { label: 'Lights' },
    { label: 'Plugs' },
    { label: 'Climate' },
    { label: 'Security' },
    { label: 'Energy' },
    { label: 'Cameras' },
    { label: 'Network' },
    { label: 'Database' },
    { label: 'Settings' },
  ]

  const weather = reactive({
    city: 'Denver, CO',
    temp: null as number | null,
    summary: 'Loading weather…',
    humidity: null as number | null,
    wind: null as number | null,
    windDirection: '',
    sunrise: '',
    sunset: '',
    updatedAt: '',
    loading: true,
    error: '',
    forecast: [] as WeatherForecastDay[],
  })

  const refreshWeather = async () => {
    weather.loading = true
    weather.error = ''

    try {
      const data: WeatherData = await fetchWeatherData()
      Object.assign(weather, data)
    } catch {
      weather.error = 'Unable to load weather. Check your connection and try again.'
      weather.summary = 'Weather unavailable'
    } finally {
      weather.loading = false
    }
  }

  return {
    navItems,
    weather,
    refreshWeather,
  }
})

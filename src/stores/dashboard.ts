import { defineStore } from 'pinia'

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

  const weather = {
    city: 'Denver, CO',
    temp: 58,
    summary: 'Partly Cloudy',
    humidity: 42,
    wind: 8,
    sunrise: '6:08 AM',
    sunset: '7:48 PM',
    hourly: [
      { time: '7 PM', temp: 56 },
      { time: '9 PM', temp: 52 },
      { time: '11 PM', temp: 48 },
      { time: '1 AM', temp: 45 },
      { time: '3 AM', temp: 43 },
      { time: '5 AM', temp: 42 },
    ],
  }

  return {
    navItems,
    weather,
  }
})

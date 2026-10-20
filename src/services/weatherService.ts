import type { WeatherData } from '@/types/weather'

interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

const getWeatherSummary = (code: number) => {
  if (code === 0) return 'Clear Sky'
  if (code === 1) return 'Mainly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Unknown Conditions'
}

const formatApiTime = (value: string) => {
  const hour = Number(value.slice(11, 13))
  const minute = value.slice(14, 16)
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`
}

const formatForecastDay = (value: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${value}T12:00:00`))

const getWindDirection = (degrees: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return directions[Math.round(degrees / 45) % directions.length] ?? 'N'
}

export const fetchWeatherData = async (): Promise<WeatherData> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({
    latitude: '39.7392',
    longitude: '-104.9903',
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m',
    daily: 'sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'America/Denver',
    forecast_days: '5',
  }).toString()

  const response = await fetch(url)
  if (!response.ok) throw new Error('Weather service unavailable')

  const data = (await response.json()) as OpenMeteoResponse
  const sunrise = data.daily.sunrise[0]
  const sunset = data.daily.sunset[0]
  if (
    data.daily.time.length < 5 ||
    data.daily.weather_code.length < 5 ||
    data.daily.temperature_2m_max.length < 5 ||
    data.daily.temperature_2m_min.length < 5 ||
    !sunrise ||
    !sunset
  ) {
    throw new Error('Weather response is incomplete')
  }

  const forecast = Array.from({ length: 5 }, (_, index) => {
    const date = data.daily.time[index]
    const code = data.daily.weather_code[index]
    const high = data.daily.temperature_2m_max[index]
    const low = data.daily.temperature_2m_min[index]
    if (date === undefined || code === undefined || high === undefined || low === undefined) {
      throw new Error('Daily forecast is incomplete')
    }
    return {
      date,
      day: index === 0 ? 'Today' : formatForecastDay(date),
      summary: getWeatherSummary(code),
      high: Math.round(high),
      low: Math.round(low),
    }
  })

  return {
    temp: Math.round(data.current.temperature_2m),
    summary: getWeatherSummary(data.current.weather_code),
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    windDirection: getWindDirection(data.current.wind_direction_10m),
    sunrise: formatApiTime(sunrise),
    sunset: formatApiTime(sunset),
    updatedAt: formatApiTime(data.current.time),
    forecast,
  }
}
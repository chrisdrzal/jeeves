export interface WeatherForecastDay {
  date: string
  day: string
  summary: string
  high: number
  low: number
}

export interface WeatherData {
  temp: number
  summary: string
  humidity: number
  wind: number
  windDirection: string
  sunrise: string
  sunset: string
  updatedAt: string
  forecast: WeatherForecastDay[]
}
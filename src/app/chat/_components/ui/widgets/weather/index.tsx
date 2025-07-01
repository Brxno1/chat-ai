import { Droplets, Gauge, MapPin, Thermometer, Wind } from 'lucide-react'
import React from 'react'
import Flags from 'react-world-flags'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { cn } from '@/utils/utils'

import {
  calculateTemperaturePosition,
  getTemperatureInfo,
  getWeatherCondition,
  TEMP_SCALE_MAX,
  TEMP_SCALE_MIN,
  weatherConfigs,
} from './definitions'

type WeatherProps = {
  temperature: number
  weather: string
  location: string
  weatherMain?: string
  minTemperature: number
  maxTemperature: number
  main?: {
    feels_like: number
    humidity: number
    pressure?: number
  }
  wind?: {
    speed: number
    deg?: number
  }
} & Partial<WeatherToolResponse>

export const Weather = ({ ...props }: WeatherProps) => {
  console.log('props in weather', props)

  const formattedDescription =
    props.weather[0].description.charAt(0).toUpperCase() +
    props.weather[0].description.slice(1)

  const weatherData = React.useMemo(() => {
    const condition = getWeatherCondition(
      props.weatherMain || props.weather?.[0]?.main,
    )
    const config = weatherConfigs[condition]
    const tempInfo = getTemperatureInfo(props.temperature)
    const tempPosition = calculateTemperaturePosition(props.temperature)

    return {
      ...config,
      tempInfo,
      tempPosition,
      condition,
    }
  }, [props.weather, props.weatherMain, props.temperature])

  return (
    <div
      className="relative mt-1 w-full min-w-[280px] max-w-[320px] overflow-hidden rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
      role="img"
      aria-label={`Clima em ${props.location}: ${props.weather[0].description}, ${Math.round(props.temperature)} graus Celsius`}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-blue-500 via-yellow-500 to-red-500 opacity-50 transition-opacity duration-500',
          weatherData.gradient,
        )}
      />

      <div className="relative space-y-5 p-5">
        <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
          <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <Flags code={props.sys!.country} className="size-4" />-
          <span className="truncate" title={props.name}>
            {props.name}
          </span>
        </div>

        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="animate-pulse" aria-hidden="true">
              {weatherData.icon}
            </div>
            <div>
              <span
                className={cn(
                  'text-4xl font-bold tracking-tight transition-colors duration-300',
                  weatherData.tempInfo.color,
                )}
              >
                {Math.round(props.temperature)}°
              </span>
              <div className="text-sm font-medium text-foreground/60">
                Celsius
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-right text-sm text-foreground/70">
            <span className="text-foreground/70">
              Mín: {Math.round(props.minTemperature)}°
            </span>
            <span className="text-foreground/70">
              Máx: {Math.round(props.maxTemperature)}°
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Thermometer
              className="h-4 w-4 text-foreground/60"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground/80">
              {formattedDescription}
            </span>
          </div>

          {props.main && (
            <div className="grid grid-cols-2 gap-3 text-xs text-foreground/70">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                <span>Sensação: {Math.round(props.main.feels_like)}°</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>Umidade: {props.main.humidity}%</span>
              </div>
              {props.wind && (
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>Vento: {Math.round(props.wind.speed * 3.6)} km/h</span>
                </div>
              )}
              {props.main.pressure && (
                <div className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  <span>Pressão: {props.main.pressure} hPa</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Muito frio</span>
            <span>Muito quente</span>
          </div>
          <div
            className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"
            role="progressbar"
            aria-valuenow={props.temperature}
            aria-valuemin={TEMP_SCALE_MIN}
            aria-valuemax={TEMP_SCALE_MAX}
            aria-label={`Temperatura: ${props.temperature}°C (${weatherData.tempInfo.label})`}
          >
            <div
              className="absolute top-0 h-full w-1 rounded-full bg-white shadow-lg transition-all duration-700 ease-out"
              style={{
                left: `${weatherData.tempPosition}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <div className="text-center">
            <span
              className={cn('text-xs font-medium', weatherData.tempInfo.color)}
            >
              {weatherData.tempInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

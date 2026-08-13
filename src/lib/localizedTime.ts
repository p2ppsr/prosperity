import * as SunCalc from 'suncalc'

export type LocalizedTime = {
  primary: string
  secondary: string
  phase: 'day' | 'night'
  sunrise: Date
  sunset: Date
}

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

function solarTimes(date: Date, latitude: number, longitude: number) {
  const times = SunCalc.getTimes(date, latitude, longitude)
  if (!times.sunrise || !times.sunset || !Number.isFinite(times.sunrise.getTime()) || !Number.isFinite(times.sunset.getTime())) {
    throw new Error('Localized Time is unavailable during polar day or polar night.')
  }
  return { sunrise: times.sunrise, sunset: times.sunset }
}

export function formatLocalizedDifference(prefix: 'D' | 'N', differenceMs: number): string {
  const totalMinutes = Math.round(differenceMs / 60000)
  let hours: number | string = Math.trunc(totalMinutes / 60)
  const minutes = Math.abs(totalMinutes % 60)
  if (Object.is(hours, -0)) hours = '-'
  if (hours === 0) hours = ''
  return `${prefix}${hours}:${minutes.toString().padStart(2, '0')}`
}

export function localizedTimeAt(now: Date, latitude: number, longitude: number): LocalizedTime {
  const today = solarTimes(now, latitude, longitude)
  const previous = solarTimes(new Date(now.getTime() - DAY_MS), latitude, longitude)
  const next = solarTimes(new Date(now.getTime() + DAY_MS), latitude, longitude)
  const dayWindowStart = today.sunrise.getTime() - HOUR_MS
  const dayWindowEnd = today.sunset.getTime() - HOUR_MS
  const timestamp = now.getTime()

  if (timestamp >= dayWindowStart && timestamp < dayWindowEnd) {
    return {
      primary: formatLocalizedDifference('D', timestamp - today.sunrise.getTime()),
      secondary: formatLocalizedDifference('N', timestamp - today.sunset.getTime()),
      phase: 'day', sunrise: today.sunrise, sunset: today.sunset
    }
  }

  const sunset = timestamp >= dayWindowEnd ? today.sunset : previous.sunset
  const sunrise = timestamp >= dayWindowEnd ? next.sunrise : today.sunrise
  return {
    primary: formatLocalizedDifference('N', timestamp - sunset.getTime()),
    secondary: formatLocalizedDifference('D', timestamp - sunrise.getTime()),
    phase: 'night', sunrise, sunset
  }
}

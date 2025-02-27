import { writable, readable, derived, get } from 'svelte/store'
import myaerials from './assets/surveys.json'

// API tokens
export const nearToken = readable(import.meta.env.VITE_NEARTOKEN)
export const eagleToken = readable("")


// surveys
export let aerials = writable(null)
const makeAerials = []
myaerials.forEach(el => {
  makeAerials.push({
    url: el.url,
    flydate: new Date(el.flydate).getTime(),
    minzoom: el.minzoom,
    maxzoom: el.maxzoom,
    attribution: `${el.flydate} King County GIS`
  })
})

if (!import.meta.env.VITE_NEARTOKEN) {
  makeAerials.sort((a, b) => b.flydate - a.flydate)
  aerials.set(makeAerials)
} else {
  fetch(`https://api.nearmap.com/coverage/v2/poly/-122.552490,47.258728,-121.225891,47.258728,-121.225891,47.831596,-122.552490,47.831596,-122.552490,47.258728?apikey=${import.meta.env.VITE_NEARTOKEN}&limit=200`)
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(json => {
      json.surveys.forEach(el => {
        makeAerials.push({
          url: `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.img?apikey=${import.meta.env.VITE_NEARTOKEN}&until=${el.captureDate}`,
          flydate: new Date(el.captureDate).getTime(),
          capturedate: el.captureDate,
          minzoom: 0,
          maxzoom: el.resources.tiles[0].scale,
          attribution: "Nearmap"
        })
      })
      makeAerials.sort((a, b) => b.flydate - a.flydate)
      aerials.set(makeAerials)
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    })
}

// begin date for time slider
export let timeStart = derived(aerials, value => {
  if (!value) return null
  return value[value.length - 1].flydate
})

// until date
export let untilDate = writable(new Date().getTime())

// portal start date
export let portalDate = writable(null)
timeStart.subscribe(value => {
  if (!value) return null
  portalDate.set(value)
})

// active aerial
export const activeAerial = derived([untilDate, aerials], values => {
  if (values[0] && values[1]) {
    const el = values[1]
      .filter((el) => {
        return el.flydate <= values[0]
      })
    return el[0]
  }
  return null
})

// active portal aerial
export const activePortal = derived([portalDate, aerials], values => {
  if (values[0] && values[1]) {
    const el = values[1]
      .filter((el) => {
        return el.flydate <= values[0]
      })
    return el[0]
  }
  return null
})

// Search results
export let location = writable({})

// Portal open
export let portalOpen = writable(false)

// map location [lng,lat,zoom]
export let mapLocation = writable(null)

// set hash
mapLocation.subscribe(value => {
  setHash()
})

untilDate.subscribe(value => {
  setHash()
})

function setHash() {
  if (get(mapLocation) && get(untilDate))
    document.location.hash = `${get(mapLocation).join('/')}/${get(untilDate)}`
}

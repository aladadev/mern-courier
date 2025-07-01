// geocode.js
import axios from 'axios'

const GEOCODING_API_KEY = 'AIzaSyBPLgNO6gk4C0mPs2mgsYWRT5bzwGQYz3A'

export const getCoordinatesFromAddress = async address => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: GEOCODING_API_KEY,
        },
      }
    )

    const result = response.data.results[0]
    if (result) {
      const { lat, lng } = result.geometry.location
      return { lat, lng }
    } else {
      throw new Error('Address not found')
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

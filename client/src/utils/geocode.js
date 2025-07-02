// geocode.js
import axios from "axios";

// const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY

export const getCoordinatesFromAddress = async (address) => {
  return { lat: 12.2, lng: 100.231 };
  // simulating
  // try {
  //   const response = await axios.get(
  //     'https://maps.googleapis.com/maps/api/geocode/json',
  //     {
  //       params: {
  //         address,
  //         key: GEOCODING_API_KEY,
  //       },
  //     }
  //   )

  //   const result = response.data.results[0]
  //   if (result) {
  //     const { lat, lng } = result.geometry.location
  //     return { lat, lng }
  //   } else {
  //     throw new Error('Address not found')
  //   }
  // } catch (error) {
  //   console.error('Geocoding error:', error)
  //   return null
  // }
};

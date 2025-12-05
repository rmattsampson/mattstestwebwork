const N2YO_API_KEY = 'FHGTPH-WYTCPZ-262NYV-5M5R';
const SEARCH_RADIUS = 90;

function getMockSatellites() {
  return [
    { id: '25544', name: 'ISS (ZARYA)', latitude: 42.5, longitude: -75.3, altitude: 418, velocity: 7.66 },
    { id: '48274', name: 'STARLINK-1600', latitude: 40.2, longitude: -78.1, altitude: 550, velocity: 7.59 },
    { id: '43013', name: 'HUBBLE SPACE TELESCOPE', latitude: 38.1, longitude: -76.8, altitude: 540, velocity: 7.58 },
    { id: '27424', name: 'NOAA 18', latitude: 41.3, longitude: -77.5, altitude: 854, velocity: 7.45 },
    { id: '33591', name: 'NOAA 19', latitude: 39.8, longitude: -79.2, altitude: 870, velocity: 7.44 },
  ];
}

export const handler = async (event) => {
  const lat = event.queryStringParameters?.lat || '38.9';
  const lon = event.queryStringParameters?.lon || '-77.0';
  const category = event.queryStringParameters?.category || '';
  
  try {
    const categoryParam = category ? `/${category}` : '/0';
    const url = `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/0/${SEARCH_RADIUS}${categoryParam}/&apiKey=${N2YO_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          satellites: getMockSatellites(),
          error: 'API request failed',
          usingMockData: true
        })
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          satellites: getMockSatellites(),
          error: data.error,
          usingMockData: true
        })
      };
    }
    
    if (!data.above || data.above.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ satellites: [] })
      };
    }
    
    const satellites = data.above.map(sat => ({
      id: sat.satid.toString(),
      name: sat.satname,
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitude: sat.satalt,
      velocity: sat.satalt > 0 ? Math.sqrt(398600.4418 / (6371 + sat.satalt)) : 0
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ satellites })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        satellites: getMockSatellites(),
        error: 'Network error',
        usingMockData: true
      })
    };
  }
};

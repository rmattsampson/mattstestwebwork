import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

interface Satellite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

interface SatelliteResponse {
  satellites: Satellite[];
  error?: string;
  usingMockData?: boolean;
}

const N2YO_API_KEY = 'FHGTPH-WYTCPZ-262NYV-5M5R';
const SEARCH_RADIUS = 90; // degrees

function getMockSatellites(): Satellite[] {
  return [
    { id: '25544', name: 'ISS (ZARYA)', latitude: 42.5, longitude: -75.3, altitude: 418, velocity: 7.66 },
    { id: '48274', name: 'STARLINK-1600', latitude: 40.2, longitude: -78.1, altitude: 550, velocity: 7.59 },
    { id: '43013', name: 'HUBBLE SPACE TELESCOPE', latitude: 38.1, longitude: -76.8, altitude: 540, velocity: 7.58 },
    { id: '27424', name: 'NOAA 18', latitude: 41.3, longitude: -77.5, altitude: 854, velocity: 7.45 },
    { id: '33591', name: 'NOAA 19', latitude: 39.8, longitude: -79.2, altitude: 870, velocity: 7.44 },
  ];
}

async function fetchSatellitesAtLocation(lat: number, lon: number): Promise<SatelliteResponse> {
  try {
    const url = `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/0/${SEARCH_RADIUS}/0/&apiKey=${N2YO_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('N2YO API error:', response.status, response.statusText);
      return { satellites: getMockSatellites(), error: 'API request failed', usingMockData: true };
    }
    
    const data = await response.json();
    
    // Check for rate limit error
    if (data.error) {
      console.error('N2YO API error:', data.error);
      return { satellites: getMockSatellites(), error: data.error, usingMockData: true };
    }
    
    if (!data.above || data.above.length === 0) {
      return { satellites: [] };
    }
    
    const satellites = data.above.map((sat: any) => ({
      id: sat.satid.toString(),
      name: sat.satname,
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitude: sat.satalt,
      velocity: sat.satalt > 0 ? Math.sqrt(398600.4418 / (6371 + sat.satalt)) : 0
    }));
    
    return { satellites };
  } catch (error) {
    console.error('Error fetching satellites:', error);
    return { satellites: getMockSatellites(), error: 'Network error', usingMockData: true };
  }
}

async function fetchSatellitesByCategory(categoryId: string, lat: number, lon: number): Promise<SatelliteResponse> {
  try {
    const url = `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/0/${SEARCH_RADIUS}/${categoryId}/&apiKey=${N2YO_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('N2YO API error:', response.status, response.statusText);
      return { satellites: getMockSatellites(), error: 'API request failed', usingMockData: true };
    }
    
    const data = await response.json();
    
    // Check for rate limit error
    if (data.error) {
      console.error('N2YO API error:', data.error);
      return { satellites: getMockSatellites(), error: data.error, usingMockData: true };
    }
    
    if (!data.above || data.above.length === 0) {
      return { satellites: [] };
    }
    
    const satellites = data.above.map((sat: any) => ({
      id: sat.satid.toString(),
      name: sat.satname,
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitude: sat.satalt,
      velocity: sat.satalt > 0 ? Math.sqrt(398600.4418 / (6371 + sat.satalt)) : 0
    }));
    
    return { satellites };
  } catch (error) {
    console.error('Error fetching satellites by category:', error);
    return { satellites: getMockSatellites(), error: 'Network error', usingMockData: true };
  }
}

async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    // Using Nominatim (OpenStreetMap) reverse geocoding API
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SatelliteTracker/1.0'
      }
    });
    
    if (!response.ok) {
      return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
    
    const data = await response.json();
    const address = data.address;
    
    // Build location string: City, State/Region, Country
    const parts: string[] = [];
    
    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    else if (address.county) parts.push(address.county);
    
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } catch (error) {
    console.warn('Error fetching location name:', error);
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

app.get('/api/location', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 38.9;
  const lon = parseFloat(req.query.lon as string) || -77.0;
  
  const locationName = await getLocationName(lat, lon);
  res.json({ location: locationName });
});

app.get('/api/satellites', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 38.9;
  const lon = parseFloat(req.query.lon as string) || -77.0;
  const category = req.query.category as string;
  
  let result: SatelliteResponse;
  if (category) {
    result = await fetchSatellitesByCategory(category, lat, lon);
  } else {
    result = await fetchSatellitesAtLocation(lat, lon);
  }
  
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export const handler = async (event) => {
  const lat = event.queryStringParameters?.lat || '38.9';
  const lon = event.queryStringParameters?.lon || '-77.0';
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SatelliteTracker/1.0'
      }
    });
    
    if (!response.ok) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ location: `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°` })
      };
    }
    
    const data = await response.json();
    const address = data.address;
    
    const parts = [];
    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    else if (address.county) parts.push(address.county);
    
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    
    const location = parts.length > 0 ? parts.join(', ') : `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ location })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ location: `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°` })
    };
  }
};

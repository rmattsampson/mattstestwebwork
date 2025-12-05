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

let allSatellites: Satellite[] = [];
let currentPage = 1;
let pageSize = 10;
let currentLat = 38.9;
let currentLon = -77.0;
let currentCategory = '';
let apiError: string | null = null;

async function fetchSatellites(lat: number, lon: number, category: string): Promise<SatelliteResponse> {
  try {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (category) params.append('category', category);
    
    const response = await fetch(`http://localhost:3000/api/satellites?${params}`);
    if (!response.ok) throw new Error('Failed to fetch satellites');
    return await response.json();
  } catch (error) {
    console.error('Error fetching satellites:', error);
    return { satellites: [], error: 'Network error' };
  }
}

function renderSatellites(): void {
  const container = document.getElementById('satellite-list');
  if (!container) return;

  if (allSatellites.length === 0) {
    container.innerHTML = '<div class="loading">No satellites currently visible at this location</div>';
    updateControls();
    return;
  }

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageSatellites = allSatellites.slice(startIdx, endIdx);

  container.innerHTML = pageSatellites.map(sat => `
    <div class="satellite-card">
      <div class="satellite-card-inner">
        <div class="satellite-name">${sat.name}</div>
        <div class="satellite-info">
          <div><strong>ID:</strong> ${sat.id}</div>
          <div><strong>Latitude:</strong> ${sat.latitude.toFixed(4)}°</div>
          <div><strong>Longitude:</strong> ${sat.longitude.toFixed(4)}°</div>
          <div><strong>Altitude:</strong> ${sat.altitude.toFixed(2)} km</div>
          <div><strong>Velocity:</strong> ${sat.velocity.toFixed(2)} km/s</div>
        </div>
      </div>
    </div>
  `).join('');

  updateControls();
}

function updateControls(): void {
  const totalPages = Math.ceil(allSatellites.length / pageSize);
  
  const countEl = document.getElementById('satellite-count');
  if (countEl) {
    countEl.textContent = `${allSatellites.length} satellites found`;
  }

  const pageInfoEl = document.getElementById('page-info');
  if (pageInfoEl) {
    pageInfoEl.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }

  const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
  
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

async function fetchLocationName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3000/api/location?lat=${lat}&lon=${lon}`);
    if (!response.ok) return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    const data = await response.json();
    return data.location;
  } catch (error) {
    console.error('Error fetching location name:', error);
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

async function updateLocationName(lat: number, lon: number): Promise<void> {
  const locationNameEl = document.getElementById('location-name');
  if (locationNameEl) {
    locationNameEl.textContent = 'Loading location...';
    const name = await fetchLocationName(lat, lon);
    locationNameEl.textContent = name;
  }
}

async function updateLocation(): Promise<void> {
  const latInput = document.getElementById('latitude') as HTMLInputElement;
  const lonInput = document.getElementById('longitude') as HTMLInputElement;
  const categorySelect = document.getElementById('category') as HTMLSelectElement;
  
  if (!latInput || !lonInput || !categorySelect) return;
  
  const lat = parseFloat(latInput.value);
  const lon = parseFloat(lonInput.value);
  
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    alert('Please enter valid coordinates (Lat: -90 to 90, Lon: -180 to 180)');
    return;
  }
  
  currentLat = lat;
  currentLon = lon;
  currentCategory = categorySelect.value;
  currentPage = 1;
  
  const container = document.getElementById('satellite-list');
  if (container) {
    container.innerHTML = '<div class="loading">Loading satellite data...</div>';
  }
  
  await updateLocationName(currentLat, currentLon);
  const result = await fetchSatellites(currentLat, currentLon, currentCategory);
  allSatellites = result.satellites;
  
  if (result.error && result.usingMockData) {
    showErrorBanner(result.error);
  } else {
    hideErrorBanner();
  }
  
  renderSatellites();
}

function setupEventListeners(): void {
  document.getElementById('update-location')?.addEventListener('click', updateLocation);
  
  document.getElementById('size-10')?.addEventListener('click', () => {
    pageSize = 10;
    currentPage = 1;
    document.getElementById('size-10')?.classList.add('active');
    document.getElementById('size-25')?.classList.remove('active');
    renderSatellites();
  });

  document.getElementById('size-25')?.addEventListener('click', () => {
    pageSize = 25;
    currentPage = 1;
    document.getElementById('size-10')?.classList.remove('active');
    document.getElementById('size-25')?.classList.add('active');
    renderSatellites();
  });

  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderSatellites();
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    const totalPages = Math.ceil(allSatellites.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderSatellites();
    }
  });
}

function showErrorBanner(message: string): void {
  const banner = document.getElementById('error-banner');
  if (banner) {
    banner.textContent = `⚠️ ${message} - Showing mock data`;
    banner.style.display = 'block';
  }
}

function hideErrorBanner(): void {
  const banner = document.getElementById('error-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

async function init(): Promise<void> {
  setupEventListeners();
  
  await updateLocationName(currentLat, currentLon);
  const result = await fetchSatellites(currentLat, currentLon, currentCategory);
  allSatellites = result.satellites;
  
  if (result.error && result.usingMockData) {
    showErrorBanner(result.error);
  } else {
    hideErrorBanner();
  }
  
  renderSatellites();
}

init();

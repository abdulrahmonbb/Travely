const API_KEY = '5ae2e3f221c38a28845f05b60353bee4ce9cabd0b7959c33a4dbdaa5'; // Replace with your actual API key
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        try {
            const results = await searchDestinations(query);
            if (results.length > 0) {
                displayResults(results);
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = '<p class="text-center text-gray-500">No results found. Please try a different search.</p>';
                searchResults.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            searchResults.innerHTML = '<p class="text-center text-red-500">An error occurred while fetching results. Please try again.</p>';
            searchResults.classList.remove('hidden');
        }
    }
});

async function searchDestinations(query) {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data && data.lat && data.lon) {
        const placesResponse = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=1000&lon=${data.lon}&lat=${data.lat}&kinds=interesting_places&format=json&apikey=${API_KEY}`);
        const places = await placesResponse.json();
        return await Promise.all(places.slice(0, 6).map(getPlaceDetails));
    }
    
    return [];
}

async function getPlaceDetails(place) {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${API_KEY}`);
    const details = await response.json();
    return { ...place, details };
}

function displayResults(results) {
    const resultsHTML = results.map(place => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <img src="${place.details.preview?.source || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${place.name}" class="w-full h-48 md:h-56 object-cover">
            <div class="p-4 md:p-6">
                <h3 class="text-lg md:text-xl font-semibold mb-2 md:mb-3">${place.name}</h3>
                <p class="text-sm md:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">${place.kinds.replace(/,/g, ', ')}</p>
                <a href="#" class="text-primary hover:text-text font-semibold transition-colors text-sm md:text-base">Learn More</a>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = `
        <div class="container mx-auto px-4 md:px-12">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Search Results</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                ${resultsHTML}
            </div>
        </div>
    `;
}

// Add this function to hide results when the page loads
function hideResults() {
    searchResults.classList.add('hidden');
}

// Call hideResults when the page loads
window.addEventListener('load', hideResults);

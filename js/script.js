// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// =====================================================
// NASA APOD API CONFIGURATION
// =====================================================
const API_KEY = "lDlZ3R2vAMHPgdXfyBXJLL8Owq23gkej3qZzpcYh";
const BASE_URL = "https://api.nasa.gov/planetary/apod";

// =====================================================
// RANDOM SPACE FACTS ARRAY
// =====================================================
const spaceFacts = [
  "The Sun's core temperature reaches about 27 million degrees Fahrenheit!",
  "A day on Venus is longer than its year - it takes 243 Earth days to rotate, but only 225 days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons on Earth.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Jupiter has at least 79 moons, more than any other planet in our solar system.",
  "The Great Red Spot on Jupiter is a storm that has been raging for at least 350 years.",
  "Saturn's rings are made of billions of chunks of ice and rock, some as small as grains of sand.",
  "The Andromeda Galaxy is on a collision course with the Milky Way and will merge with it in about 4.5 billion years.",
  "Black holes can have a mass up to 50 billion times that of our Sun.",
  "The International Space Station orbits Earth every 90 minutes, allowing astronauts to see 16 sunrises and sunsets per day.",
  "The Moon is slowly drifting away from Earth at a rate of about 1.5 inches per year.",
  "Mars has the largest volcano in the solar system - Olympus Mons, which is nearly three times taller than Mount Everest.",
  "The temperature in space is about -455 degrees Fahrenheit (close to absolute zero).",
  "A year on Neptune is 165 Earth years long!",
  "Comets are often called 'dirty snowballs' because they're made of ice, rock, and dust."
];

// =====================================================
// DOM ELEMENTS
// =====================================================
const searchBtn = document.getElementById('searchBtn');
const galleryContainer = document.getElementById('gallery');
const loadingMessage = document.getElementById('loading');
const modal = document.getElementById('modal');
const modalClose = document.querySelector('.modal-close');
const randomFactEl = document.getElementById('randomFact');

// =====================================================
// SHOW LOADING MESSAGE
// =====================================================
// Display the loading message while data is being fetched from the API
function showLoading() {
  loadingMessage.classList.add('visible');
}

// =====================================================
// HIDE LOADING MESSAGE
// =====================================================
// Hide the loading message after data has been fetched and displayed
function hideLoading() {
  loadingMessage.classList.remove('visible');
}

// =====================================================
// DISPLAY RANDOM SPACE FACT
// =====================================================
// Pick a random fact from the array and display it on page load
function displayRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const randomFact = spaceFacts[randomIndex];
  randomFactEl.textContent = randomFact;
}

// =====================================================
// FETCH APOD DATA FROM NASA API
// =====================================================
// Make an API request to NASA's APOD endpoint with the date range
// Handle errors gracefully if the API fails
async function fetchAPODData(startDate, endDate) {
  try {
    // Build the URL with start and end dates
    const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Show loading message while fetching
    showLoading();
    
    // Make the API request
    const response = await fetch(url);
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    
    // Hide loading message after fetch is complete
    hideLoading();
    
    // Return the data array
    return data;
    
  } catch (error) {
    // Handle any errors that occur during the fetch
    hideLoading();
    console.error('Error fetching APOD data:', error);
    alert('Error fetching space images. Please check your API key and try again.');
    return [];
  }
}

// =====================================================
// CREATE A SINGLE GALLERY ITEM
// =====================================================
// Create an HTML element for one APOD item with image/video, title, and date
// Returns a clickable card that opens the modal on click
function createGalleryItem(apodItem) {
  // Create the main gallery item container
  const item = document.createElement('div');
  item.className = 'gallery-item';
  
  // Create media container (for hover zoom effect)
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'gallery-media-container';
  
  // Check if the item is a video or image
  if (apodItem.media_type === 'video') {
    // For videos, create a thumbnail or embed
    const videoLink = document.createElement('a');
    videoLink.href = apodItem.url;
    videoLink.target = '_blank';
    videoLink.style.display = 'flex';
    videoLink.style.alignItems = 'center';
    videoLink.style.justifyContent = 'center';
    videoLink.style.width = '100%';
    videoLink.style.height = '100%';
    videoLink.style.backgroundColor = '#0b0e27';
    videoLink.style.color = '#0073e6';
    videoLink.style.fontSize = '1.2rem';
    videoLink.style.fontWeight = 'bold';
    videoLink.style.textDecoration = 'none';
    videoLink.textContent = '📹 Video: Click to view';
    mediaContainer.appendChild(videoLink);
  } else {
    // For images, create an img element
    const img = document.createElement('img');
    img.src = apodItem.url;
    img.alt = apodItem.title;
    img.onerror = function() {
      // Handle missing images
      this.style.display = 'none';
      mediaContainer.style.display = 'flex';
      mediaContainer.style.alignItems = 'center';
      mediaContainer.style.justifyContent = 'center';
      mediaContainer.innerHTML = '<span style="color: #999;">Image unavailable</span>';
    };
    mediaContainer.appendChild(img);
  }
  
  item.appendChild(mediaContainer);
  
  // Create text container with title and date
  const textContainer = document.createElement('div');
  textContainer.className = 'gallery-text';
  
  // Add title
  const title = document.createElement('p');
  title.className = 'gallery-title';
  title.textContent = apodItem.title;
  textContainer.appendChild(title);
  
  // Add date
  const date = document.createElement('p');
  date.className = 'gallery-date';
  date.textContent = formatDate(apodItem.date);
  textContainer.appendChild(date);
  
  item.appendChild(textContainer);
  
  // Add click event to open modal
  item.addEventListener('click', () => openModal(apodItem));
  
  return item;
}

// =====================================================
// FORMAT DATE TO READABLE FORMAT
// =====================================================
// Convert YYYY-MM-DD to a more readable format
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// =====================================================
// DISPLAY GALLERY
// =====================================================
// Take the fetched data and render gallery items
// Limits to 9 items and sorts newest first
function displayGallery(apodArray) {
  // Clear the gallery container
  galleryContainer.innerHTML = '';
  
  // Check if there's any data
  if (!apodArray || apodArray.length === 0) {
    galleryContainer.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for the selected date range. Try a different range!</p>
      </div>
    `;
    return;
  }
  
  // Sort newest first (reverse chronological order)
  const sortedArray = [...apodArray].reverse();
  
  // Limit to 9 items
  const limitedArray = sortedArray.slice(0, 9);
  
  // Create gallery items for each APOD entry
  limitedArray.forEach(apodItem => {
    const galleryItem = createGalleryItem(apodItem);
    galleryContainer.appendChild(galleryItem);
  });
}

// =====================================================
// OPEN MODAL WITH FULL DETAILS
// =====================================================
// Display the full image/video, title, date, and explanation in a modal
function openModal(apodItem) {
  // Set modal title
  document.getElementById('modalTitle').textContent = apodItem.title;
  
  // Set modal date
  document.getElementById('modalDate').textContent = formatDate(apodItem.date);
  
  // Set modal explanation
  document.getElementById('modalExplanation').textContent = apodItem.explanation || 'No explanation available.';
  
  // Handle media in modal
  const mediaContainer = document.getElementById('modalMediaContainer');
  mediaContainer.innerHTML = '';
  
  if (apodItem.media_type === 'video') {
    // For videos, create an iframe or link
    if (apodItem.url.includes('youtube.com') || apodItem.url.includes('youtu.be')) {
      // Convert YouTube URL to embeddable format
      let embedUrl = apodItem.url;
      if (embedUrl.includes('youtu.be')) {
        const videoId = embedUrl.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (embedUrl.includes('watch?v=')) {
        const videoId = embedUrl.split('watch?v=')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allowFullscreen = true;
      mediaContainer.appendChild(iframe);
    } else {
      // For non-YouTube videos, show a link
      const link = document.createElement('a');
      link.href = apodItem.url;
      link.target = '_blank';
      link.className = 'modal-media-link';
      link.textContent = '📹 Watch Video';
      mediaContainer.appendChild(link);
    }
  } else {
    // For images, display the full image
    const img = document.createElement('img');
    img.src = apodItem.url;
    img.alt = apodItem.title;
    mediaContainer.appendChild(img);
  }
  
  // Show the modal
  modal.classList.add('visible');
}

// =====================================================
// CLOSE MODAL
// =====================================================
// Hide the modal when user clicks close button or outside the modal
function closeModal() {
  modal.classList.remove('visible');
}

// =====================================================
// EVENT LISTENERS
// =====================================================

// Search button click - fetch and display APOD data
searchBtn.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Validate that dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  // Fetch and display the data
  const apodData = await fetchAPODData(startDate, endDate);
  displayGallery(apodData);
});

// Modal close button click
modalClose.addEventListener('click', closeModal);

// Click outside modal to close
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// =====================================================
// PAGE LOAD
// =====================================================
// Display a random space fact when the page loads
displayRandomFact();

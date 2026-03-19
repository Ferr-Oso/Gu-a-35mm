// UNSPLASH IMAGE FETCH
async function fetchFilmImages(film) {
  const queries = {
    'kodak-portra-400': 'portrait film photography warm skin tones',
    'kodak-gold-200': 'summer golden hour film photography outdoor',
    'kodak-ultramax-400': 'street photography urban film',
    'fuji-superia-400': 'japan street everyday film photography',
    'fuji-provia-100': 'landscape nature slide film photography',
    'fuji-velvia-50': 'vivid landscape nature saturated film',
    'cinestill-800t': 'night city lights neon urban dark',
    'cinestill-50d': 'cinematic daylight portrait soft film'
  };

  const query = queries[film.id] || `${film.brand} ${film.name} film photography`;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${CONFIG.unsplashKey}`
        }
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results.map(photo => ({
        url: photo.urls.regular,
        thumb: photo.urls.small,
        author: photo.user.name,
        authorUrl: photo.user.links.html
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching images for ${film.name}:`, error);
    return [];
  }
}

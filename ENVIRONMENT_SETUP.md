# Environment Setup

## Google Maps API Configuration

To use the location features, you need to set up a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Create a `.env` file in the project root with:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Required APIs

- **Maps JavaScript API**: For loading the Google Maps JavaScript library
- **Places API**: For location search functionality
- **Geocoding API**: For converting coordinates to addresses

## Security Note

Make sure to restrict your API key to your domain in the Google Cloud Console to prevent unauthorized usage.

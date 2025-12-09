# goTogether Frontend

A modern React + TypeScript rideshare platform for students built with Vite.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **React Router** - Navigation
- **MapLibre GL** - Interactive maps
- **Axios** - HTTP client
- **OpenStreetMap Nominatim** - Location search & geocoding

## Features

- 🎨 Modern dark-themed UI
- 🗺️ Interactive map with location search
- 🔐 Authentication (Login/Register)
- 📍 Click-to-mark location on map
- 🔍 Autocomplete location search
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Default/      # Landing, Login, Register
│   │   └── User/         # Home, Map, Navbar
│   ├── Styles/           # CSS files
│   ├── images/           # Static assets
│   └── App.tsx           # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

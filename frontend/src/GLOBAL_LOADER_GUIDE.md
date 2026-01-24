# Global Loader Usage Guide

## Overview
The global loader is a reusable loading overlay component that can be used across any page in the application. It displays a centered message with animated loading dots.

## Files Created/Modified

### 1. **Context** - `frontend/src/context/GlobalLoaderContext.tsx`
- Manages global loading state
- Provides `show(message?)` method to display loader with optional custom message
- Provides `hide()` method to close the loader
- Custom hook: `useGlobalLoader()` for accessing the context

### 2. **Component** - `frontend/src/components/GlobalLoader.tsx`
- Renders the loading overlay when `isLoading` is true
- Returns null when not loading (no DOM pollution)
- Uses the custom `useGlobalLoader()` hook
- Displays animated dots and message text

### 3. **Styles** - `frontend/src/Styles/GlobalLoader.css`
- Fixed position overlay covering entire screen
- Animated bouncing dots (3 dots with staggered animation)
- Green (#4ADE80) dots with dark semi-transparent background
- Responsive design for mobile/tablet/desktop

### 4. **Integration** - `frontend/src/main.tsx`
- Wrapped the app with `GlobalLoaderProvider` to make context available throughout the app

### 5. **Layout** - `frontend/src/App.tsx`
- Added `<GlobalLoader />` component at the top level (just after the div opening tag)
- High z-index (10000) ensures it appears above all other content

## Usage Examples

### Basic Usage in Any Component

```typescript
import { useGlobalLoader } from '../context/GlobalLoaderContext';

const MyComponent = () => {
  const { show, hide } = useGlobalLoader();

  const handleAsyncAction = async () => {
    show('Loading your data...'); // Show loader with custom message
    
    try {
      const response = await fetch('/api/endpoint');
      const data = await response.json();
      // Process data
    } finally {
      hide(); // Always hide when done
    }
  };

  return <button onClick={handleAsyncAction}>Load Data</button>;
};
```

### Example: Bookings Page (handleConfirm function)

```typescript
const handleConfirm = async (bookingId: string) => {
  const { show, hide } = useGlobalLoader();
  
  show('Confirming booking...'); // Show loader
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (data.success) {
      addNotification({
        title: 'Booking confirmed',
        message: 'You have confirmed the booking request.',
        type: 'success',
      });
      fetchReceivedBookings(currentPage);
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    addNotification({
      title: 'Confirmation error',
      message: 'Something went wrong.',
      type: 'warning',
    });
  } finally {
    hide(); // Hide loader
  }
};
```

### Example: Posting a Ride (Join.tsx)

```typescript
const handlePublish = async () => {
  const { show, hide } = useGlobalLoader();
  
  show('Publishing your ride...'); // Show with custom message
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ /* ride data */ })
    });
    // Handle response
  } finally {
    hide();
  }
};
```

## API Methods

### `show(message?: string)`
- Displays the global loader overlay
- Optional `message` parameter (defaults to "Please wait...")
- Example: `show('Processing your request...')`

### `hide()`
- Hides the global loader overlay
- Call this in the `finally` block of async operations

## CSS Classes

- `.global-loader-overlay` - Main container, fixed position, covers entire screen
- `.global-loader-content` - Flex container for centered content
- `.global-loader-circle` - Container for animated dots
- `.global-loader-dot` - Individual animated dot (3 of these)
- `.global-loader-text` - Message text

## Key Features

✓ **Global Scope** - Works from any component without prop drilling
✓ **Simple API** - Just `show()` and `hide()` methods
✓ **Type-Safe** - Full TypeScript support
✓ **Responsive** - Works on all screen sizes
✓ **Animated** - Smooth bouncing dot animation
✓ **Z-Index Management** - 10000 ensures it's on top
✓ **Memory Efficient** - Returns null when not loading

## Design Notes

- Uses the same animation pattern as AuthLoader for consistency
- Dark overlay (rgba(0, 0, 0, 0.85)) with backdrop blur for visual hierarchy
- Green dots (#4ADE80) match the app's primary color scheme
- Mobile-responsive: dot size and text size adjust for small screens
- Fixed positioning allows usage during page navigation

## Tips for Implementation

1. **Always use try-finally**: Ensures loader hides even if error occurs
2. **Custom messages**: Use meaningful messages like "Booking your ride..." instead of generic "Loading..."
3. **Combine with notifications**: Use alongside NotificationContext for feedback
4. **Don't nest**: Loader automatically overlays, no need for nested components
5. **Error handling**: Hide loader before showing error notifications

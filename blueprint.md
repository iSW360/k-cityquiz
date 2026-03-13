# Blueprint: K-CityQuiz & Seoul District Quiz (V2 Redesign)

## Overview
A web-based interactive quiz game where users identify South Korean cities and Seoul districts on a map. Built with vanilla JavaScript, HTML5, CSS3 (Tailwind CSS), and Leaflet.js. The V2 redesign focuses on "Visual Impact" and "Modern UX".

## Current State & V2 Redesign Goals
- **Visual Impact**: Increase the scale of primary imagery (SVG maps) to make them the focal point of the UI.
- **Modern Aesthetic**: Shift from flat UI to "Glassmorphism" with semi-transparent layers, backdrop blurs, and multi-layered shadows.
- **Vibrant Palette**: Use a dynamic color spectrum (Deep Indigo, Electric Violet, Rose) with mesh gradients.
- **Interactive Feedback**: Enhanced animations for buttons, pulsing markers, and smooth transitions.

## Features & Design
- **Hero Visual**: A large, stylized 3D-effect South Korea map SVG with a glowing ripple location pin.
- **Glassmorphism Containers**: UI cards with `backdrop-filter: blur()` and high-contrast borders.
- **Typography**: Bold, expressive typography with gradient text effects.
- **Responsiveness**: Mobile-first design that scales beautifully to desktop with container queries.
- **Texture**: Subtle noise overlay on the background for a premium, tactile feel.

## Implementation Plan
1.  **Refactor index.html**: Update the SVG map scale and container classes for Glassmorphism.
2.  **Update style.css**: Add custom animations (ripple, float), backdrop filters, and noise texture.
3.  **Visual Elements**: Enhance the SVG map with gradients and better paths for a 3D look.
4.  **Button Overhaul**: Apply neon-glow effects and scale-up interactions.

## Recent UI Adjustments
- **Level Selection Buttons**: Reduced vertical padding (from `py-4` to `py-2`) to streamline the main dashboard and reduce vertical scrolling on mobile devices.
- **Hero Image Integration**: Replaced SVG map with a stylized PNG map image for better performance and visual consistency across browsers.

### Steps:
1.  **New Page**: Create `seoul.html` as a dedicated entry point for the Seoul District Quiz.
2.  **New Logic**: Create `seoul.js` adapted from `main.js` but focused on Seoul's 25 districts.
3.  **Data**: Define coordinates and metadata for all 25 Seoul districts.
4.  **Linking**: Add a "Seoul District Quiz" link to the main page (`index.html`) and a "Back to City Quiz" link to `seoul.html`.
5.  **Refinement**: Ensure the map centers and zooms specifically on Seoul for this mode.

### Seoul Districts List:
강남구, 강동구, 강북구, 강서구, 관악구, 광진구, 구로구, 금천구, 노원구, 도봉구, 동대문구, 동작구, 마포구, 서대문구, 서초구, 성동구, 성북구, 송파구, 양천구, 영등포구, 용산구, 은평구, 종로구, 중구, 중랑구.

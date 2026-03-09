# Blueprint: K-CityQuiz & Seoul District Quiz

## Overview
A web-based interactive quiz game where users identify South Korean cities and Seoul districts on a map. Built with vanilla JavaScript, HTML5, CSS3 (Tailwind CSS), and Leaflet.js for mapping.

## Current State
- **South Korea City Quiz**:
  - Features 100+ locations including major cities and counties.
  - Difficulty levels: Level 1 (4 options), Level 2 (8 options).
  - Map integration: Leaflet.js with Carto tiles.
  - GeoJSON boundaries for administrative regions.
  - Score tracking and feedback.

## Features & Design
- **Map Interaction**: Uses `flyTo` for smooth zooming into target locations.
- **Visuals**: Tailwind CSS for responsive and modern UI. Gradient backgrounds, soft shadows, and vibrant colors.
- **Interactivity**: Dynamic feedback for correct/incorrect answers, region highlighting on the map.
- **Responsiveness**: Mobile-friendly layout.

## Planned Change: Seoul District Quiz
The goal is to add a new game mode specifically for identifying the 25 districts of Seoul.

### Steps:
1.  **New Page**: Create `seoul.html` as a dedicated entry point for the Seoul District Quiz.
2.  **New Logic**: Create `seoul.js` adapted from `main.js` but focused on Seoul's 25 districts.
3.  **Data**: Define coordinates and metadata for all 25 Seoul districts.
4.  **Linking**: Add a "Seoul District Quiz" link to the main page (`index.html`) and a "Back to City Quiz" link to `seoul.html`.
5.  **Refinement**: Ensure the map centers and zooms specifically on Seoul for this mode.

### Seoul Districts List:
강남구, 강동구, 강북구, 강서구, 관악구, 광진구, 구로구, 금천구, 노원구, 도봉구, 동대문구, 동작구, 마포구, 서대문구, 서초구, 성동구, 성북구, 송파구, 양천구, 영등포구, 용산구, 은평구, 종로구, 중구, 중랑구.

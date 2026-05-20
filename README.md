# 🌍 Crono World - Interactive 3D Globe

An interactive 3D globe visualization with 7 labeled points from major world cities that converge to the center with animated dotted lines.

## ✨ Features

- **3D Interactive Globe** - Smooth rotating sphere with realistic lighting
- **7 World Locations** - Labeled points at major cities:
  1. New York (🔴 Red)
  2. London (🔵 Teal)
  3. Paris (🟡 Yellow)
  4. Tokyo (🟢 Green)
  5. Sydney (🔴 Coral)
  6. San Francisco (🟣 Purple)
  7. São Paulo (🔷 Pink)

- **Convergence Lines** - Thin animated dotted lines from each point to the center
- **Glowing Effects** - Color-coded halos around each location
- **Atmosphere** - Subtle glowing aura around the globe
- **Mouse Interactions**:
  - **Hover** - Highlight points when hovering
  - **Click** - Display location information in alert
- **Responsive Design** - Works on desktop and mobile devices
- **Smooth Animations** - Pulsing markers and continuous globe rotation

## 🚀 Quick Start

### Method 1: Direct Browser
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. Enjoy the interactive globe!

### Method 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using Live Server in VS Code
# Install extension and open with Live Server
```
Then visit `http://localhost:8000`

## 📁 File Structure

```
crono-world/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Three.js 3D visualization
└── README.md       # This file
```

## 🎮 Interactions

| Action | Result |
|--------|--------|
| **Hover over point** | Point highlights and shrinks |
| **Click on point** | Shows location name and number |
| **Watch globe** | Continuously rotates smoothly |
| **Observe animations** | Points pulse with smooth wave effect |

## 🛠️ Customization

### Add More Locations
Edit the `locations` array in `script.js`:

```javascript
const locations = [
    { 
        name: 'City Name', 
        lat: 40.7128,      // Latitude
        lon: -74.0060,     // Longitude
        label: 8,          // Point number
        color: 0xff6b6b    // Hex color
    },
    // ... add more locations
];
```

### Change Globe Color
Modify the globe material in `script.js`:
```javascript
const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a472a,  // Change this color
});
```

### Adjust Rotation Speed
Change this line in the `animate()` function:
```javascript
globe.rotation.y += 0.0003;  // Increase or decrease value
```

### Modify Line Appearance
Adjust the dotted line in the convergence line creation section:
```javascript
const dotCount = 20;  // More dots = smoother line
```

## 🌐 Browser Compatibility

- ✅ Chrome/Chromium (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Dependencies

- **Three.js** - 3D Graphics Library (loaded via CDN)
  - Source: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`

No build process required! Everything runs directly in the browser.

## 💡 Technical Details

### Technologies Used
- **Three.js** - 3D rendering
- **WebGL** - Hardware-accelerated graphics
- **Vanilla JavaScript** - No frameworks needed
- **HTML5 Canvas** - Rendering surface

### Key Features in Code
- **Raycasting** - Mouse interaction with 3D objects
- **Lat/Lon to XYZ Conversion** - Geographic to Cartesian coordinates
- **Sphere Geometry** - 3D model of Earth
- **Multiple Light Sources** - Ambient, directional, and point lights
- **RequestAnimationFrame** - Smooth 60 FPS animation

## 🔧 Troubleshooting

**Globe not appearing?**
- Check browser console for errors (F12)
- Ensure WebGL is enabled in your browser
- Try a different browser

**Points not interactive?**
- Make sure you're using a modern browser with WebGL support
- Check that JavaScript is enabled

**Performance issues?**
- Reduce the sphere geometry complexity (first parameter in `THREE.SphereGeometry`)
- Lower the animation frame rate
- Use a faster device or browser

## 📝 License

Open source - feel free to use and modify!

## 🤝 Contributing

Feel free to fork, modify, and enhance this project. Suggestions:
- Add more interactive features
- Implement mouse drag to rotate
- Add data visualization
- Create timeline animations
- Add AR support

---

**Made with ❤️ using Three.js**

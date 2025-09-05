# Portfolio Preloader + Gradient Hero

A smooth animated portfolio landing page that combines a sophisticated preloader with a WebGL gradient shader hero section.

## Features

- **Animated Preloader**: Progress bar, text animations, and mask transitions using GSAP
- **WebGL Gradient Hero**: Interactive fluid shader gradient background with Three.js
- **Smooth Transitions**: Seamless animation flow from preloader to hero section
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Asset preloading and background shader warmup

## Files Structure

```
merged/
├── index.html          # Main HTML file
├── styles.css          # Combined CSS styles
├── script.js           # Main orchestration script
├── gradient-script.js  # WebGL gradient system
├── shaders.js          # Shader code (vertex, fluid, display)
├── mask.svg            # SVG mask for preloader transition
├── logo_01.png         # Hero logo image
└── README.md           # This file
```

## Setup

1. **Serve the files**: Use a local web server (required for ES6 modules)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with live-server)
   npx live-server
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open in browser**: Navigate to `http://localhost:8000`

## How It Works

### Animation Sequence

1. **Asset Preloading** (0.5s)
   - Logo and mask images are preloaded
   - Fonts are loaded and ready

2. **Preloader Animation** (4-5s)
   - "Loading..." text slides in character by character
   - Footer text slides up line by line
   - Progress bar animates to completion
   - WebGL gradient initializes in background

3. **Transition** (2.5s)
   - Preloader text slides out
   - Circular mask scales up dramatically
   - Gradient canvas fades in

4. **Hero Reveal** (1.5s)
   - Navigation and logo fade in
   - Hero footer text slides up
   - Interactive gradient becomes fully active

### Technical Details

- **GSAP**: Handles all preloader animations and transitions
- **Three.js**: Powers the WebGL gradient shader system
- **ES6 Modules**: Clean modular JavaScript architecture
- **Responsive**: CSS media queries for mobile optimization

## Customization

### Preloader Text
Edit the text content in `index.html`:
```html
<div class="preloader-logo"><h1>Your Text...</h1></div>
<div class="preloader-footer">
    <p>Your description here...</p>
</div>
```

### Gradient Colors
Modify the color uniforms in `gradient-script.js`:
```javascript
uColor1: { value: [0.2, 0.1, 0.8] }, // RGB values (0-1)
uColor2: { value: [0.8, 0.2, 0.4] },
uColor3: { value: [0.1, 0.8, 0.6] },
uColor4: { value: [0.9, 0.5, 0.1] },
```

### Animation Timing
Adjust durations in `script.js`:
```javascript
// Preloader duration
animateProgress(3) // 3 seconds

// Transition timing
.to(".preloader-mask", {
    scale: 5,
    duration: 2.5, // Mask expansion time
    ease: "power3.out"
})
```

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **WebGL Required**: For gradient effects
- **ES6 Modules**: Must be served over HTTP/HTTPS (not file://)

## Performance Notes

- Gradient initialization starts during preloader to avoid delays
- Assets are preloaded before animations begin
- Animation loop pauses when page is hidden
- Responsive render target sizing for different screen sizes

## Troubleshooting

### Blank Screen
- Ensure files are served via HTTP server (not opened as files)
- Check browser console for errors
- Verify all assets (logo_01.png, mask.svg) are present

### No Gradient Animation
- Check WebGL support in browser
- Verify Three.js CDN is accessible
- Check console for shader compilation errors

### Performance Issues
- Reduce gradient quality by modifying render target resolution
- Adjust animation complexity in `gradient-script.js`
- Check devicePixelRatio settings for high-DPI displays
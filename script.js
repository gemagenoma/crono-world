// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.z = 2.5;

const mainColor = 0xaa96da;
const accentColor = 0xd0c8e0;

// Get time left in centiseconds
const interval = 10
function getTime(event) {
    const now = new Date();
    const timeLeft = (now - event) / interval;
	return Math.floor(timeLeft)
} 

// Globe data
const locations = [
    { date: new Date(415,1,5,4,3,23,143), name: 'Alejandría', lat: 31.2001, lon: 29.9187, label: 1, color: accentColor },
    { date: new Date(-380,2,4,4,1,13,533), name: 'Atenas', lat: 37.9838, lon: 23.7275, label: 2, color: accentColor },
    { date: new Date(1010,3,3,1,9,43,87), name: 'El Cairo', lat: 30.0444, lon: 31.2357, label: 3, color: accentColor },
    { date: new Date(1690,4,2,8,2,34,52), name: 'Méjico', lat: 19.4326, lon: -99.1332, label: 4, color: accentColor },
    { date: new Date(1898,5,1,7,10,53,24), name: 'Paris', lat: 48.8566, lon: 2.3522, label: 5, color: accentColor },
	{ date: new Date(1769,6,13,10,32,21,3), name: 'Tahiti', lat: -17.5028, lon: -149.4931, label: 6, color: accentColor },
	{ date: new Date(-4280000000, 1, 2, 23, 56, 32, 341), name: 'Galapagos', lat: -21.1815, lon: -109.0718, label: 7, color: accentColor },
	{ date: new Date(-259000, 10, 7, 4, 3, 6, 54), name: 'Florisbad', lat: -28.7660, lon: 26.0830, label: 8, color: accentColor }
];

// Convert lat/lon to 3D coordinates on sphere
function latLonToXYZ(lat, lon, radius = 1) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (180 - lon) * Math.PI / 180;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
}

// Create globe
const globeGeometry = new THREE.SphereGeometry(1, 32, 16);
const globeMaterial = new THREE.MeshBasicMaterial({ 
    color: mainColor, 
    wireframe: true,
    transparent: true,
    opacity: 0.2 
}); 
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Add atmosphere glow
const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x5000ffff,
    transparent: true,
    opacity: 0.1,
    wireframe: false
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// Create points and lines
const pointsGroup = new THREE.Group();
const linesGroup = new THREE.Group();
const labelsArray = [];
const textLabelsGroup = new THREE.Group();

locations.forEach((loc) => {
    const pos = latLonToXYZ(loc.lat, loc.lon, 1);
    
    // Create glowing sphere for each location
    const pointGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: loc.color });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.copy(pos);
    point.userData = { name: loc.name, label: loc.label };
    pointsGroup.add(point);
    
    // Create floating text label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#d0c8e0';
    context.font = 'Bold 32px Courier New';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(getTime(loc.date), 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.125, 1);
    sprite.position.copy(pos).normalize().multiplyScalar(1.12);
    textLabelsGroup.add(sprite);

    // Create convergence line with dots
    const linePoints = [];
    const dotCount = 70;
    for (let i = 0; i <= dotCount; i++) {
        const t = i / dotCount;
        const point = new THREE.Vector3(pos.x * (1 - t), pos.y * (1 - t), pos.z * (1 - t));
        linePoints.push(point);
    }
    
    // Create dotted line using line with dashes
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
        color: loc.color,
        linewidth: 1,
        transparent: true,
        opacity: 0.6
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    linesGroup.add(line);
    
    // Add individual dots for the line
    linePoints.forEach((dotPos, index) => {
        if (index % 3 === 0) { // Create dots every 3 points
            const dotGeometry = new THREE.SphereGeometry(0.008, 16, 16);
            const dotMaterial = new THREE.MeshBasicMaterial({ color: loc.color });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.copy(dotPos);
            linesGroup.add(dot);
        }
    });
});

scene.add(pointsGroup);
scene.add(linesGroup);
scene.add(textLabelsGroup);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x00ffff, 0.5);
pointLight.position.set(-5, 2, 3);
scene.add(pointLight);

// Animation
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate globe
    const rotationSpeed = 0.002;
    globe.rotation.y += rotationSpeed;
    atmosphere.rotation.y += rotationSpeed;
    pointsGroup.rotation.y += rotationSpeed;
    linesGroup.rotation.y += rotationSpeed;
    textLabelsGroup.rotation.y += rotationSpeed;
    
    // Pulse effect on points
    time += 0.04;
    pointsGroup.children.forEach((child, index) => {
        const scale = 1 + Math.sin(time + index * 0.5) * 0.5;
        child.scale.set(scale, scale, scale);
    });
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

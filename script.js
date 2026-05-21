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

// Globe data - 7 points around the world
const locations = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, label: 1, color: accentColor },
    { name: 'London', lat: 51.5074, lon: -0.1278, label: 2, color: accentColor },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, label: 3, color: accentColor },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, label: 4, color: accentColor },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, label: 5, color: accentColor },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, label: 6, color: accentColor },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, label: 7, color: accentColor }
];

// Convert lat/lon to 3D coordinates on sphere
function latLonToXYZ(lat, lon, radius = 1) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    
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
    transparent: true 
}); 
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Add atmosphere glow
const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
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
    
    context.fillStyle = '#ffffff';
    context.font = 'Bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(loc.name, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.125, 1);
    sprite.position.copy(pos).normalize().multiplyScalar(1.35);
    textLabelsGroup.add(sprite);
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
    globe.rotation.y += 0.0003;
    atmosphere.rotation.y += 0.0003;
    pointsGroup.rotation.y += 0.0003;
    linesGroup.rotation.y += 0.0003;
    textLabelsGroup.rotation.y += 0.0003;
    
    // Pulse effect on points
    time += 0.02;
    pointsGroup.children.forEach((child, index) => {
        if (index % 2 === 0) { // Only pulse the main points
            const scale = 1 + Math.sin(time + index * 0.5) * 0.15;
            child.scale.set(scale, scale, scale);
        }
    });
    
    renderer.render(scene, camera);
}

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pointsGroup.children);
    
    pointsGroup.children.forEach(child => {
        if (child.material && child.material.color) {
            child.material.opacity = 1;
        }
    });
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.material && object.material.color) {
            object.material.opacity = 0.5;
        }
    }
});

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pointsGroup.children);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && object.userData.name) {
            console.log(`Location ${object.userData.label}: ${object.userData.name}`);
            alert(`Point ${object.userData.label}: ${object.userData.name}`);
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

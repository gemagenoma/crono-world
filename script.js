// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.z = 2.5;

// Globe data - 7 points around the world
const locations = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, label: 1, color: 0xff6b6b },
    { name: 'London', lat: 51.5074, lon: -0.1278, label: 2, color: 0x4ecdc4 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, label: 3, color: 0xffe66d },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, label: 4, color: 0x95e1d3 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, label: 5, color: 0xf38181 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, label: 6, color: 0xaa96da },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, label: 7, color: 0xfcbad3 }
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
const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a472a,
    emissive: 0x1a472a,
    wireframe: false,
    shininess: 5
});
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Add atmosphere glow
const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
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

locations.forEach((loc) => {
    const pos = latLonToXYZ(loc.lat, loc.lon, 1);
    
    // Create glowing sphere for each location
    const pointGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: loc.color });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.copy(pos);
    point.userData = { name: loc.name, label: loc.label };
    pointsGroup.add(point);
    
    // Create glow halo
    const haloGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: loc.color,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.copy(pos);
    pointsGroup.add(halo);
    
    // Create convergence line with dots
    const linePoints = [];
    const dotCount = 20;
    for (let i = 0; i <= dotCount; i++) {
        const t = i / dotCount;
        const point = new THREE.Vector3(
            pos.x * (1 - t),
            pos.y * (1 - t),
            pos.z * (1 - t)
        );
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
            const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
            const dotMaterial = new THREE.MeshBasicMaterial({ color: loc.color });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.copy(dotPos);
            linesGroup.add(dot);
        }
    });
});

scene.add(pointsGroup);
scene.add(linesGroup);

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

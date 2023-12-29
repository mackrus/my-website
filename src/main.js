// refactor 1

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ canvas: document.querySelector('#bg') });
const textureLoader = new THREE.TextureLoader();
const sunGroup = new THREE.Object3D();
scene.add(sunGroup);

// Renderer configuration
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 10);

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Sun
const sun = createCelestialBody('photos/celestial_bodies/sun.jpg', 5);

sunGroup.add(sun);

// Load textures for each planet photos are from https://www.solarsystemscope.com/textures/
// Planets with more realistic proportions and distances (not to scale)
const planetsInfo = [
    { name: 'Mercury', texture: 'photos/celestial_bodies/mercury.jpg', size: 0.383, orbitRadius: 0.69, orbitSpeed: 0.54 },
    { name: 'Venus', texture: 'photos/celestial_bodies/venus.jpg', size: 0.949, orbitRadius: 0.92, orbitSpeed: 0.65 },
    { name: 'Earth', texture: 'photos/celestial_bodies/earth.jpg', size: 1, orbitRadius: 1.1, orbitSpeed: 0.78 },
    { name: 'Mars', texture: 'photos/celestial_bodies/mars.jpg', size: 0.532, orbitRadius: 1.52, orbitSpeed: 0.99 },
    { name: 'Jupiter', texture: 'photos/celestial_bodies/jupiter.jpg', size: 8.21, orbitRadius: 3.2, orbitSpeed: 1.31 },
    { name: 'Saturn', texture: 'photos/celestial_bodies/saturn.jpg', size: 6.45, orbitRadius: 5.58, orbitSpeed: 1.97 },
    { name: 'Uranus', texture: 'photos/celestial_bodies/uranus.jpg', size: 4.01, orbitRadius: 10.22, orbitSpeed: 2.68 },
    { name: 'Neptune', texture: 'photos/celestial_bodies/neptune.jpg', size: 3.88, orbitRadius: 17.05, orbitSpeed: 3.54 },
    { name: 'Pluto', texture: 'photos/celestial_bodies/pluto.jpg', size: 0.186, orbitRadius: 22.48, orbitSpeed: 5.47 },
];

// Add rotation speeds to each planet's data and tune/scale the other parameters
planetsInfo.forEach(planetInfo => {
    planetInfo.rotationSpeeds = { x: 0.002, y: 0.000001, z: 0.00001 }; // Example values, adjust as needed
    planetInfo.orbitRadius *= 15;
    planetInfo.size /= 5;
    planetInfo.orbitSpeed /= 5; 
});

const planets = planetsInfo.map(info => {
    const planet = createPlanet(info); 
    sunGroup.add(planet.object);
    return planet;
});

const saturn = planets.find(planet => planet.name === 'Saturn');
if (saturn) {
    const saturnRing = createSaturnRing('photos/celestial_bodies/saturn_ring.png', saturn.size);
    saturn.object.add(saturnRing);
};


// Stars
createStars(500);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    rotateSun();

    // Update celestial bodies
    planets.forEach(planet => {
        
        updatePlanet(planet);
        rotatePlanet(planet.mesh, planet.rotationSpeeds);
    });

    controls.update();
    renderer.render(scene, camera);
}


animate();
moveCamera();

function moveCamera() {
    // Ensure the sun object is properly defined with a radius
    if (!sun || !sun.geometry || !sun.geometry.parameters.radius) {
        console.error('Sun object is not properly defined.');
        return;
    }

    // Get the current scroll position
    const scrollPosition = window.scrollY;

    // Calculate the distance from the sun
    const distance = 2.5 * sun.geometry.parameters.radius;

    // Calculate the angle based on the scroll position
    const angle = scrollPosition * 0.002;

    // Calculate the new position of the camera in a spiral pattern
    const x = distance * Math.cos(angle);
    const y = scrollPosition * 0.009;
    const z = distance * Math.sin(-angle);

    // Set the position of the camera
    camera.position.set(x, y, z);

}

// Attach the moveCamera function to the scroll event
document.body.onscroll = moveCamera;


// Function definitions
function createCelestialBody(texturePath, size) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = textureLoader.load(texturePath);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
    
}

function createSaturnRing(texturePath) {

    const innerRadius = 2.5;
    const outerRadius = 3.5;
    const thetaSegments = 60;

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
    const ringTexture = textureLoader.load(texturePath);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide
    });

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

    // Rotate the ring
    ringMesh.rotation.x = -Math.PI / 2;

    return ringMesh;
}



function createPlanet({ name, texture, size, orbitRadius, orbitSpeed, rotationSpeeds }) {
    const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const planetTexture = textureLoader.load(texture);
    const planetMaterial = new THREE.MeshBasicMaterial({ map: planetTexture });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    const planetObject = new THREE.Object3D();
    planetObject.position.x = orbitRadius;
    planetObject.add(planetMesh);

    return {
        name,
        mesh: planetMesh,
        object: planetObject,
        orbitRadius,
        orbitSpeed,
        rotationSpeeds,
        angle: 0
    };
}


function updatePlanet(planet) {
    planet.angle += (1 / planet.orbitSpeed) * 0.001;
    planet.object.position.x = planet.orbitRadius * Math.cos(planet.angle);
    planet.object.position.z = planet.orbitRadius  * Math.sin(planet.angle);
}

function rotatePlanet(planet, rotationSpeeds) {
    planet.rotation.x += rotationSpeeds.x;
    planet.rotation.y += rotationSpeeds.y;
    planet.rotation.z += rotationSpeeds.z;
}

function rotateSun() {
    sun.rotation.x += 0;
    sun.rotation.y -= 0.01;
    sun.rotation.z -= 0.0001;

}

function createStars(amount) {
    for (let i = 0; i < amount; i++) {
        const geometry = new THREE.SphereGeometry(0.15, 20, 20);
        const material = new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0xffffff, emissiveIntensity: 0.3 });
        const star = new THREE.Mesh(geometry, material);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
        star.position.set(x, y, z);
        scene.add(star);
    }
}












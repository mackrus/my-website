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
camera.position.setZ(30);

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Sun
const sun = createCelestialBody('photos/sun.jpg', 5);
sunGroup.add(sun);

// Planets
const planetsInfo = [
    { name: 'Mercury', texture: 'photos/mercury.jpg', size: 0.04, orbitRadius: 1.45, orbitSpeed: 0.44 },
    { name: 'Venus', texture: 'photos/venus.jpg', size: 0.1, orbitRadius: 2.7, orbitSpeed: 0.35 },
    { name: 'Earth', texture: 'photos/earth.jpg', size: 0.1, orbitRadius: 3.9, orbitSpeed: 0.3 },
    { name: 'Mars', texture: 'photos/mars.jpg', size: 0.053, orbitRadius: 5.8, orbitSpeed: 0.24 },
    { name: 'Jupiter', texture: 'photos/jupiter.jpg', size: 1.1, orbitRadius: 19.5, orbitSpeed: 0.13 },
    { name: 'Saturn', texture: 'photos/saturn.jpg', size: 0.9, orbitRadius: 36.2, orbitSpeed: 0.1 },
    { name: 'Uranus', texture: 'photos/uranus.jpg', size: 0.4, orbitRadius: 72.6, orbitSpeed: 0.07 },
    { name: 'Neptune', texture: 'photos/neptune.jpg', size: 0.38, orbitRadius: 115.2, orbitSpeed: 0.06 },
    { name: 'Pluto', texture: 'photos/pluto.jpg', size: 0.15, orbitRadius: 145.2, orbitSpeed: 0.04 },
];

// Add rotation speeds to each planet's data
planetsInfo.forEach(planetInfo => {
    planetInfo.rotationSpeeds = { x: 0.001, y: 0.002, z: 0.001 }; // Example values, adjust as needed
});

const planets = planetsInfo.map(info => {
    const planet = createPlanet(info); 
    sunGroup.add(planet.object);
    return planet;
});



// Stars
createStars(500);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update celestial bodies
    planets.forEach(planet => {
        updatePlanet(planet);
        rotatePlanet(planet.mesh, planet.rotationSpeeds);
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Scroll event for camera movement
document.body.onscroll = moveCamera;

// Function definitions
function createCelestialBody(texturePath, size) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = textureLoader.load(texturePath);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}

// function createPlanet({ name, texture, size, orbitRadius, orbitSpeed }) {
//     const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
//     const planetTexture = textureLoader.load(texture);
//     const planetMaterial = new THREE.MeshBasicMaterial({ map: planetTexture });
//     const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
//     const planetObject = new THREE.Object3D();
//     planetObject.position.x = orbitRadius;
//     planetObject.add(planetMesh);

//     return {
//         name,
//         mesh: planetMesh,
//         object: planetObject,
//         orbitRadius,
//         orbitSpeed,
//         rotationSpeeds,
//         angle: 0
//     };
// }

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
        rotationSpeeds, // Ensure this is included
        angle: 0
    };
}


function updatePlanet(planet) {
    planet.angle += (1 / planet.orbitSpeed) * 0.001;
    planet.object.position.x = planet.orbitRadius * Math.cos(planet.angle);
    planet.object.position.z = planet.orbitRadius * Math.sin(planet.angle);
}

function rotatePlanet(planet, rotationSpeeds) {
    planet.rotation.x += rotationSpeeds.x;
    planet.rotation.y += rotationSpeeds.y;
    planet.rotation.z += rotationSpeeds.z;
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

// Make a function to move the camera perspective
function moveCamera() {
    const move = document.body.getBoundingClientRect().top;

    // Calculate the distance from the sun
    const distance = 2 * sun.geometry.parameters.radius;

    // Calculate the angle based on the scroll position
    const angle = move * 0.0015;

    // Calculate the new position of the camera in a spiral pattern
    const x = distance * Math.cos(-angle);
    const y = move * -0.004;
    const z = distance * Math.sin(angle);

    // Set the position of the camera
    camera.position.set(x, y, z);
}

document.body.onscroll = moveCamera;



// Note: This refactoring assumes that the planets are defined in the planetsInfo array.
// You would need to add the rest of the planets with their respective properties to the array.
// Refactor 2
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';



class CelestialBody {
    constructor(textureLoader, scene) {
        this.textureLoader = textureLoader;
        this.scene = scene;
    }

    createBody(texturePath, size) {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const texture = this.textureLoader.load(texturePath);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        return new THREE.Mesh(geometry, material);
    }

    createRing(texturePath, innerRadius, outerRadius) {
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 60);
        const ringTexture = this.textureLoader.load(texturePath);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = -Math.PI / 2;
        return ringMesh;
    }

    createStars(amount) {
        for (let i = 0; i < amount; i++) {
            const geometry = new THREE.SphereGeometry(0.15, 20, 20);
            const material = new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0xffffff, emissiveIntensity: 0.3 });
            const star = new THREE.Mesh(geometry, material);
            const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
            star.position.set(x, y, z);
            this.scene.add(star);
        }
    }
}

// Usage
const celestialBody = new CelestialBody(textureLoader, scene);
const sun = celestialBody.createBody('photos/sun.jpg', 5);
sunGroup.add(sun);
celestialBody.createStars(500);


class SolarSystem {
    constructor(scene, textureLoader) {
        this.scene = scene;
        this.textureLoader = textureLoader;
        this.planets = [];
    }

    initializePlanets(planetsInfo) {
        this.planets = planetsInfo.map(info => {
            const planet = this.createPlanet(info);
            this.scene.add(planet);
            return planet;
        });
    }

    createPlanet(info) {
        // Assuming createPlanet logic is similar to createBody
        const planet = celestialBody.createBody(info.texturePath, info.size);
        // Additional planet setup (e.g., position, orbit) goes here
        // ...
        return planet;
    }

    updatePlanets() {
        // Assuming updatePlanet logic involves rotating the planets or updating their positions
        this.planets.forEach(planet => {
            // Rotate or update planet position
            // ...
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.updatePlanets();
        // Other animation logic
        // ...
    }
}

// Usage
const solarSystem = new SolarSystem(scene, textureLoader);
solarSystem.initializePlanets(planetsInfo);
solarSystem.animate();


class CameraController {
    constructor(camera, sun) {
        this.camera = camera;
        this.sun = sun;
    }

        // Refactored camera movement
    moveCamera(camera, sun) {
        if (!sun || !sun.geometry || !sun.geometry.parameters.radius) {
            console.error('Sun object is not properly defined.');
            return;
        }

        const scrollPosition = window.scrollY;
        const distance = 2.5 * sun.geometry.parameters.radius;
        const angle = scrollPosition * 0.002;

        const x = distance * Math.cos(angle);
        const y = scrollPosition * 0.009;
        const z = distance * Math.sin(-angle);

        camera.position.set(x, y, z);
    }

}

// Usage
const cameraController = new CameraController(camera, sun);
document.body.onscroll = () => {
    const scrollPosition = window.scrollY;
    cameraController.moveCamera(scrollPosition);
};
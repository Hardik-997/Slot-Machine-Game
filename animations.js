// Three.js Background Animations for Neon Slots

let scene, camera, renderer;
let particles = [];
let floatingShapes = [];
let animationId;
let mouse = { x: 0, y: 0 };

// Initialize Three.js
function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0612); // Deep dark purple background
    scene.fog = new THREE.Fog(0x120d1d, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    // Renderer setup
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: false,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xd946ef, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.5, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create particles
    createParticles();

    // Create floating shapes
    createFloatingShapes();

    // Mouse move listener for parallax
    document.addEventListener('mousemove', onMouseMove);

    // Start animation loop
    animate();
}

// Create particle system
function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color(0xd946ef), // Neon pink
        new THREE.Color(0x8b5cf6), // Violet
        new THREE.Color(0xfacc15), // Gold
        new THREE.Color(0xffffff)  // White
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position in a large sphere
        positions[i3] = (Math.random() - 0.5) * 60;
        positions[i3 + 1] = (Math.random() - 0.5) * 60;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;

        // Random color from palette
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

// Create floating 3D shapes
function createFloatingShapes() {
    const shapes = [
        { geometry: new THREE.OctahedronGeometry(0.8), color: 0xd946ef },
        { geometry: new THREE.TorusGeometry(0.6, 0.2, 16, 100), color: 0x8b5cf6 },
        { geometry: new THREE.IcosahedronGeometry(0.7), color: 0xfacc15 },
        { geometry: new THREE.TetrahedronGeometry(0.9), color: 0xd946ef },
        { geometry: new THREE.BoxGeometry(1, 1, 1), color: 0x8b5cf6 }
    ];

    for (let i = 0; i < 12; i++) {
        const shapeData = shapes[Math.floor(Math.random() * shapes.length)];
        const material = new THREE.MeshPhongMaterial({
            color: shapeData.color,
            transparent: true,
            opacity: 0.4,
            wireframe: Math.random() > 0.5
        });

        const mesh = new THREE.Mesh(shapeData.geometry, material);

        // Random position
        mesh.position.x = (Math.random() - 0.5) * 40;
        mesh.position.y = (Math.random() - 0.5) * 40;
        mesh.position.z = (Math.random() - 0.5) * 30;

        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Store initial position for floating animation
        mesh.userData = {
            initialY: mesh.position.y,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.5 + 0.5,
            floatOffset: Math.random() * Math.PI * 2
        };

        scene.add(mesh);
        floatingShapes.push(mesh);
    }
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    // Rotate particle system
    particles.forEach(particleSystem => {
        particleSystem.rotation.y += 0.0005;
        particleSystem.rotation.x += 0.0002;
    });

    // Animate floating shapes
    const time = Date.now() * 0.001;
    floatingShapes.forEach(shape => {
        // Floating motion
        shape.position.y = shape.userData.initialY +
            Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 2;

        // Rotation
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
    });

    // Parallax effect based on mouse
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Mouse move handler for parallax
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Win celebration effect
function triggerWinCelebration() {
    // Create burst of particles
    const burstGeometry = new THREE.BufferGeometry();
    const burstCount = 200;
    const positions = new Float32Array(burstCount * 3);
    const velocities = [];

    for (let i = 0; i < burstCount; i++) {
        const i3 = i * 3;
        positions[i3] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;

        // Random velocity for particle explosion
        velocities.push({
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        });
    }

    burstGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const burstMaterial = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xfacc15,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });

    const burstSystem = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burstSystem);

    // Animate burst
    let burstTime = 0;
    const burstInterval = setInterval(() => {
        burstTime++;
        const positionArray = burstSystem.geometry.attributes.position.array;

        for (let i = 0; i < burstCount; i++) {
            const i3 = i * 3;
            positionArray[i3] += velocities[i].x;
            positionArray[i3 + 1] += velocities[i].y;
            positionArray[i3 + 2] += velocities[i].z;
        }

        burstSystem.geometry.attributes.position.needsUpdate = true;
        burstMaterial.opacity = Math.max(0, 1 - burstTime / 60);

        if (burstTime > 60) {
            clearInterval(burstInterval);
            scene.remove(burstSystem);
            burstGeometry.dispose();
            burstMaterial.dispose();
        }
    }, 16);

    // Flash effect on lights
    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
    lights.forEach(light => {
        const originalIntensity = light.intensity;
        light.intensity = 3;
        setTimeout(() => {
            light.intensity = originalIntensity;
        }, 300);
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Initialize when page loads
window.addEventListener('load', initThreeJS);

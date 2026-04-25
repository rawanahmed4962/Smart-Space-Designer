const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 2, 20); // Adds atmospheric depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0); // Eye level (1.6 meters)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ultra-realistic soft shadows
document.getElementById('canvas-container').appendChild(renderer.domElement);

// First Person Controls (WASD)
const controls = new THREE.PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');

blocker.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => blocker.style.display = 'none');
controls.addEventListener('unlock', () => blocker.style.display = 'flex');

// Movement Variables
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowUp': case 'KeyW': moveForward = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward = true; break;
        case 'ArrowRight': case 'KeyD': moveRight = true; break;
    }
});
document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
    }
});

// Materials
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });

let roomW = 4, roomL = 4;
const wallH = 3;

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), floorMaterial);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
scene.add(floor);

// Walls Group
const walls = new THREE.Group();
scene.add(walls);

function buildWalls() {
    while(walls.children.length > 0) walls.remove(walls.children[0]);
    
    const wGeomW = new THREE.PlaneGeometry(roomW, wallH);
    const wGeomL = new THREE.PlaneGeometry(roomL, wallH);

    const backWall = new THREE.Mesh(wGeomW, wallMaterial);
    backWall.position.set(0, wallH/2, -roomL/2); backWall.receiveShadow = true; walls.add(backWall);

    const frontWall = new THREE.Mesh(wGeomW, wallMaterial);
    frontWall.rotation.y = Math.PI; frontWall.position.set(0, wallH/2, roomL/2); frontWall.receiveShadow = true; walls.add(frontWall);

    const leftWall = new THREE.Mesh(wGeomL, wallMaterial);
    leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-roomW/2, wallH/2, 0); leftWall.receiveShadow = true; walls.add(leftWall);

    const rightWall = new THREE.Mesh(wGeomL, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(roomW/2, wallH/2, 0); rightWall.receiveShadow = true; walls.add(rightWall);
}
buildWalls();

// Realistic Lighting & Physical Lamp
const ambientLight = new THREE.AmbientLight(0xffffff, 0.15); // Very dim ambient
scene.add(ambientLight);

// The Light Fixture (Lamp Housing)
const lampHousingGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 32);
const lampHousingMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
const lampHousing = new THREE.Mesh(lampHousingGeo, lampHousingMat);
lampHousing.position.set(0, wallH - 0.05, 0);
scene.add(lampHousing);

// The Glowing Bulb
const bulbGeo = new THREE.SphereGeometry(0.1, 16, 16);
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const bulb = new THREE.Mesh(bulbGeo, bulbMat);
bulb.position.set(0, wallH - 0.1, 0);
scene.add(bulb);

// The Actual SpotLight (Volumetric feel)
const ceilingLight = new THREE.SpotLight(0xffffff, 2.5);
ceilingLight.position.set(0, wallH - 0.1, 0);
ceilingLight.angle = Math.PI / 2.5;
ceilingLight.penumbra = 0.5; // Soft edges
ceilingLight.decay = 2; // Realistic light falloff
ceilingLight.distance = 10;
ceilingLight.castShadow = true;
ceilingLight.shadow.mapSize.width = 2048;
ceilingLight.shadow.mapSize.height = 2048;
scene.add(ceilingLight);

// UI Event Listeners
document.getElementById('width-slider').addEventListener('input', (e) => { 
    roomW = parseFloat(e.target.value); document.getElementById('width-val').innerText = roomW; updateRoom(); 
});
document.getElementById('length-slider').addEventListener('input', (e) => { 
    roomL = parseFloat(e.target.value); document.getElementById('length-val').innerText = roomL; updateRoom(); 
});
document.getElementById('wall-color').addEventListener('input', (e) => { wallMaterial.color.set(e.target.value); });
document.getElementById('floor-color').addEventListener('input', (e) => { floorMaterial.color.set(e.target.value); });
document.querySelectorAll('.light-btn').forEach(btn => { 
    btn.addEventListener('click', (e) => { 
        const c = parseInt(e.target.dataset.color); 
        ceilingLight.color.setHex(c); bulb.material.color.setHex(c); 
    }); 
});

function updateRoom() {
    floor.geometry.dispose(); floor.geometry = new THREE.PlaneGeometry(roomW, roomL);
    buildWalls();
}

// Flash text effect
setTimeout(() => { const f = document.getElementById('intro-flash'); f.style.opacity = '0'; setTimeout(() => f.remove(), 1000); }, 1500);

// Animation & Movement Loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;
        
        velocity.x -= velocity.x * 10.0 * delta; // Friction
        velocity.z -= velocity.z * 10.0 * delta;
        
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        const speed = 30.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        // Wall Collision / Boundaries
        const boundX = (roomW / 2) - 0.5;
        const boundZ = (roomL / 2) - 0.5;
        if (camera.position.x > boundX) camera.position.x = boundX;
        if (camera.position.x < -boundX) camera.position.x = -boundX;
        if (camera.position.z > boundZ) camera.position.z = boundZ;
        if (camera.position.z < -boundZ) camera.position.z = -boundZ;
        
        // Lock Y position (height)
        camera.position.y = 1.6;
    }
    prevTime = time;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
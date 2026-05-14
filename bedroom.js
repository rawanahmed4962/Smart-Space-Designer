// ==========================================
// 0. GLOBAL VARIABLES
// ==========================================
if (typeof urlParams === 'undefined') {
    var urlParams = new URLSearchParams(window.location.search);
    var currentProjectId = urlParams.get('proj_id');
    var globalProjectName = "";
    var globalProjectDesc = "";
}

console.log("🚀 Bedroom Script is running! Project ID:", currentProjectId);

// ==========================================
// 1. SETUP EL SCENE W EL CAMERA W EL RENDERER
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 
scene.fog = new THREE.Fog(0x111111, 2, 20); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0); 

const renderer = new THREE.WebGLRenderer({ antialias: true }); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.0; 

document.getElementById('canvas-container').appendChild(renderer.domElement);

// ==========================================
// 2. CONTROLS (T7akom el Walk Mode)
// ==========================================
const controls = new THREE.PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');

let editMode = false; 

blocker.addEventListener('click', () => {
    if (!editMode) controls.lock();
});

controls.addEventListener('lock', () => {
    blocker.style.display = 'none'; 
    if(crosshair) crosshair.style.display = 'block'; 
});
controls.addEventListener('unlock', () => {
    if (!editMode) blocker.style.display = 'flex'; 
    if(crosshair) crosshair.style.display = 'none'; 
});

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

// ==========================================
// 3. BUILD ROOM (Bna2 el ard wel 7ytan)
// ==========================================
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: 0.9 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.8 });

let roomW = 4, roomL = 4; 
const wallH = 3; 

const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), floorMaterial);
floor.rotation.x = -Math.PI / 2; 
floor.receiveShadow = true; 
floor.name = "MAIN_ROOM_FLOOR"; 
scene.add(floor);

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

// ==========================================
// 4. LIGHTING SETUP (El Noor wel Ed2aa)
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, wallH, 0); 
scene.add(hemiLight);

const lampHousingGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 32);
const lampHousingMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 }); 
const lampHousing = new THREE.Mesh(lampHousingGeo, lampHousingMat);
lampHousing.position.set(0, wallH - 0.05, 0); 
scene.add(lampHousing);

const bulbGeo = new THREE.SphereGeometry(0.1, 16, 16); 
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
const bulb = new THREE.Mesh(bulbGeo, bulbMat);
bulb.position.set(0, wallH - 0.1, 0);
scene.add(bulb);

const ceilingLight = new THREE.SpotLight(0xffffff, 2.5); 
ceilingLight.position.set(0, wallH - 0.1, 0);
ceilingLight.angle = Math.PI / 2.5; 
ceilingLight.penumbra = 0.5;  
ceilingLight.decay = 2; 
ceilingLight.distance = 10; 
ceilingLight.castShadow = true; 
ceilingLight.shadow.mapSize.width = 2048; 
ceilingLight.shadow.mapSize.height = 2048;
scene.add(ceilingLight);

// ==========================================
// 5. UI EVENT LISTENERS
// ==========================================
if(document.getElementById('width-slider')){
    document.getElementById('width-slider').addEventListener('input', (e) => { 
        roomW = parseFloat(e.target.value); document.getElementById('width-val').innerText = roomW; updateRoom(); 
    });
}
if(document.getElementById('length-slider')){
    document.getElementById('length-slider').addEventListener('input', (e) => { 
        roomL = parseFloat(e.target.value); document.getElementById('length-val').innerText = roomL; updateRoom(); 
    });
}
if(document.getElementById('wall-color')){
    document.getElementById('wall-color').addEventListener('input', (e) => { wallMaterial.color.set(e.target.value); });
}
if(document.getElementById('floor-color')){
    document.getElementById('floor-color').addEventListener('input', (e) => { floorMaterial.color.set(e.target.value); });
}
document.querySelectorAll('.light-btn').forEach(btn => { 
    btn.addEventListener('click', (e) => { 
        const c = parseInt(e.target.dataset.color); 
        ceilingLight.color.setHex(c); bulb.material.color.setHex(c); 
    }); 
});

function updateRoom() {
    floor.geometry.dispose(); 
    floor.geometry = new THREE.PlaneGeometry(roomW, roomL);
    buildWalls(); 
}

// ==========================================
// 6. RAYCASTER & EDIT MODE LOGIC 
// ==========================================
const gltfLoader = new THREE.GLTFLoader(); 
const loadedModels = []; 

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); 
let selectedObject = null; 
let isDragging = false; 
let currentTool = 'move';  
const dragPlane = new THREE.Plane(); 
let dragOffset = new THREE.Vector3(); 
const planeNormal = new THREE.Vector3(); 
const objBox = new THREE.Box3(); 
let originalMaterials = new Map(); 

function checkModelCollisions(movingObj) {
    movingObj.updateMatrixWorld(true); 
    const box1 = new THREE.Box3().setFromObject(movingObj); 
    box1.expandByScalar(-0.05); 

    for (let i = 0; i < loadedModels.length; i++) {
        const other = loadedModels[i];
        if (other === movingObj) continue; 
        
        const box2 = new THREE.Box3().setFromObject(other);
        box2.expandByScalar(-0.05);
        
        if (box1.intersectsBox(box2)) return true; 
    }
    return false;
}

function highlightObject(object, isHighlighted) {
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            if (isHighlighted) {
                if (!originalMaterials.has(child)) originalMaterials.set(child, child.material.clone());
                if(child.material.emissive) child.material.emissive = new THREE.Color(0x444444); 
            } else {
                if (originalMaterials.has(child)) {
                    if(child.material.emissive) child.material.emissive = new THREE.Color(0x000000); 
                }
            }
        }
    });
}

renderer.domElement.addEventListener('pointerdown', (e) => {
    if (!editMode) return; 

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); 

    const intersects = raycaster.intersectObjects(loadedModels, true); 
    if (intersects.length > 0) {
        let obj = intersects[0].object; 
        if(obj.name === "MAIN_ROOM_FLOOR") return; 

        while(obj.parent && !loadedModels.includes(obj)) obj = obj.parent;

        if (selectedObject !== obj) {
            if (selectedObject) highlightObject(selectedObject, false); 
            selectedObject = obj;
            highlightObject(selectedObject, true); 
        }

        isDragging = true;
        controls.enabled = false; 

        if (currentTool === 'move') {
            dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), selectedObject.position);
            raycaster.ray.intersectPlane(dragPlane, dragOffset); 
            dragOffset.sub(selectedObject.position); 
        } else if (currentTool === 'lift') {
            planeNormal.copy(camera.position).sub(selectedObject.position).normalize();
            planeNormal.y = 0; 
            if(planeNormal.lengthSq() === 0) planeNormal.set(0,0,1);
            dragPlane.setFromNormalAndCoplanarPoint(planeNormal, selectedObject.position);
            raycaster.ray.intersectPlane(dragPlane, dragOffset);
            dragOffset.y -= selectedObject.position.y;
        }
    } else {
        if (selectedObject) highlightObject(selectedObject, false);
        selectedObject = null;
    }
});

renderer.domElement.addEventListener('pointermove', (e) => {
    if (!editMode || !isDragging || !selectedObject) return; 

    const oldX = selectedObject.position.x;
    const oldY = selectedObject.position.y;
    const oldZ = selectedObject.position.z;
    const oldRot = selectedObject.rotation.y;
    const oldScale = selectedObject.scale.clone();

    if (currentTool === 'rotate') {
        selectedObject.rotation.y += e.movementX * 0.01; 
    } else if (currentTool === 'scale') {
        let s = selectedObject.scale.x + (e.movementX * 0.005) - (e.movementY * 0.005);
        if (s < 0.1) s = 0.1; 
        if (s > 10.0) s = 10.0; 
        selectedObject.scale.set(s, s, s);
    } else {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
            if (currentTool === 'move') {
                selectedObject.position.x = intersectPoint.x - dragOffset.x;
                selectedObject.position.z = intersectPoint.z - dragOffset.z;
            } else if (currentTool === 'lift') {
                selectedObject.position.y = intersectPoint.y - dragOffset.y;
            }
        }
    }

    selectedObject.updateMatrixWorld();
    objBox.setFromObject(selectedObject); 

    const roomMaxX = roomW / 2;
    const roomMinX = -roomW / 2;
    const roomMaxZ = roomL / 2;
    const roomMinZ = -roomL / 2;

    if (objBox.max.x > roomMaxX) selectedObject.position.x -= (objBox.max.x - roomMaxX);
    if (objBox.min.x < roomMinX) selectedObject.position.x += (roomMinX - objBox.min.x);
    if (objBox.max.z > roomMaxZ) selectedObject.position.z -= (objBox.max.z - roomMaxZ);
    if (objBox.min.z < roomMinZ) selectedObject.position.z += (roomMinZ - objBox.min.z);
    if (objBox.min.y < 0) selectedObject.position.y += (0 - objBox.min.y); 

    if (checkModelCollisions(selectedObject)) {
        selectedObject.position.set(oldX, oldY, oldZ);
        selectedObject.rotation.y = oldRot;
        selectedObject.scale.copy(oldScale);
    }

    const posDisplay = document.getElementById('pos-display');
    if(posDisplay) posDisplay.innerText = `X:${selectedObject.position.x.toFixed(2)}, Y:${selectedObject.position.y.toFixed(2)}, Z:${selectedObject.position.z.toFixed(2)}`;
});

renderer.domElement.addEventListener('pointerup', () => {
    isDragging = false;
});

// ==========================================
// 7. LOAD MODELS 
// ==========================================
document.getElementById('add-model-btn').addEventListener('click', () => {
    const modelPath = document.getElementById('model-selector').value;
    if(!modelPath) return;

    gltfLoader.load(modelPath, function (gltf) {
        const rawModel = gltf.scene;
        const wrapper = new THREE.Group(); 
        
        wrapper.userData = { path: modelPath }; 

        const box = new THREE.Box3().setFromObject(rawModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        rawModel.position.x = -center.x;
        rawModel.position.y = -box.min.y;  
        rawModel.position.z = -center.z;
        
        wrapper.add(rawModel);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 2.5 || maxDim < 0.5) {
            const scaleFactor = 1.5 / maxDim; 
            wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        wrapper.position.set(0, 0, 0); 
        
        wrapper.traverse((node) => {
            if (node.isMesh) { 
                node.castShadow = true; 
                node.receiveShadow = true; 
                if (node.material) {
                    if (node.material.opacity === 1) {
                        node.material.transparent = false; 
                        node.material.depthWrite = true;
                    }
                    if (node.material.metalness > 0.5 && !node.material.envMap) {
                        node.material.metalness = 0.1; 
                        node.material.roughness = 0.8; 
                    }
                }
            }
        });

        scene.add(wrapper);
        loadedModels.push(wrapper); 
        
        if (editMode) {
            if (selectedObject) highlightObject(selectedObject, false);
            selectedObject = wrapper;
            highlightObject(selectedObject, true);
        }
    });
});

document.getElementById('delete-selected-btn').addEventListener('click', () => {
    if (selectedObject) {
        scene.remove(selectedObject);
        const index = loadedModels.indexOf(selectedObject);
        if (index > -1) loadedModels.splice(index, 1);
        selectedObject = null;
    }
});

// ==========================================
// 8. UI TOGGLES W TOOLS
// ==========================================
document.getElementById('drag-mode-btn').addEventListener('click', (e) => {
    editMode = !editMode;
    const editTools = document.getElementById('edit-tools');
    
    if (editMode) {
        e.target.innerText = "Disable Edit Mode (Walk)";
        e.target.style.background = "#e74c3c";
        blocker.style.display = 'none'; 
        if(editTools) editTools.style.display = 'block'; 
        if (controls.isLocked) controls.unlock(); 
    } else {
        e.target.innerText = "Enable Edit Mode (Select & Move)";
        e.target.style.background = "#2980b9";
        blocker.style.display = 'flex'; 
        if(editTools) editTools.style.display = 'none'; 
        
        if (selectedObject) highlightObject(selectedObject, false); 
        selectedObject = null;
        isDragging = false;
    }
});

const toolMove = document.getElementById('tool-move');
const toolLift = document.getElementById('tool-lift');
const toolRotate = document.getElementById('tool-rotate');
const toolScale = document.getElementById('tool-scale');

function resetTools() {
    if(toolMove) toolMove.style.background = "#fff";
    if(toolLift) toolLift.style.background = "#fff";
    if(toolRotate) toolRotate.style.background = "#fff";
    if(toolScale) toolScale.style.background = "#fff";
}

if(toolMove && toolRotate && toolLift && toolScale) {
    toolMove.addEventListener('click', (e) => { currentTool = 'move'; resetTools(); e.target.style.background = "#d4af37"; });
    toolLift.addEventListener('click', (e) => { currentTool = 'lift'; resetTools(); e.target.style.background = "#d4af37"; });
    toolRotate.addEventListener('click', (e) => { currentTool = 'rotate'; resetTools(); e.target.style.background = "#d4af37"; });
    toolScale.addEventListener('click', (e) => { currentTool = 'scale'; resetTools(); e.target.style.background = "#d4af37"; });
}

setTimeout(() => { const f = document.getElementById('intro-flash'); if(f) { f.style.opacity = '0'; setTimeout(() => f.remove(), 1000); } }, 1500);

// ==========================================
// 9. ANIMATION LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate); 
    
    const time = performance.now();
    if (controls.isLocked === true && !editMode) {
        const delta = (time - prevTime) / 1000; 
        
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        const speed = 30.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        const boundX = (roomW / 2) - 0.5;
        const boundZ = (roomL / 2) - 0.5;
        if (camera.position.x > boundX) camera.position.x = boundX;
        if (camera.position.x < -boundX) camera.position.x = -boundX;
        if (camera.position.z > boundZ) camera.position.z = boundZ;
        if (camera.position.z < -boundZ) camera.position.z = -boundZ;
        
        camera.position.y = 1.6; 
    }
    prevTime = time;
    renderer.render(scene, camera); 
}
animate();

window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});

// ==========================================
// 10. LOAD DATA FROM DATABASE (Edit Mode)
// ==========================================
if (currentProjectId) {
    console.log("📡 Fetching Database for ID:", currentProjectId);
    fetch(`/SSD/get_project.php?id=${currentProjectId}`)
    .then(res => res.json())
    .then(data => {
        if (data && !data.error) {
            globalProjectName = data.project_name || "My Bedroom Project";
            globalProjectDesc = data.description || "";
            
            if(data.scene_data) {
                const sceneData = JSON.parse(data.scene_data);
                
                // --- استرجاع الألوان والمقاسات ---
                if (sceneData.roomSettings) {
                    roomW = sceneData.roomSettings.width || 4;
                    roomL = sceneData.roomSettings.length || 4;
                    updateRoom(); 
                    
                    wallMaterial.color.set(sceneData.roomSettings.wallColor || 0xeae6df);
                    floorMaterial.color.set(sceneData.roomSettings.floorColor || 0xd2b48c);
                    
                    if(document.getElementById('width-slider')) document.getElementById('width-slider').value = roomW;
                    if(document.getElementById('length-slider')) document.getElementById('length-slider').value = roomL;
                    if(document.getElementById('width-val')) document.getElementById('width-val').innerText = roomW;
                    if(document.getElementById('length-val')) document.getElementById('length-val').innerText = roomL;
                    if(document.getElementById('wall-color')) document.getElementById('wall-color').value = sceneData.roomSettings.wallColor || "#eae6df";
                    if(document.getElementById('floor-color')) document.getElementById('floor-color').value = sceneData.roomSettings.floorColor || "#d2b48c";
                }

                // --- استرجاع العفش ---
                if (sceneData.furniture && sceneData.furniture.length > 0) {
                    sceneData.furniture.forEach(item => {
                        gltfLoader.load(item.modelPath, (gltf) => {
                            const rawModel = gltf.scene;
                            const wrapper = new THREE.Group();
                            
                            wrapper.userData = { path: item.modelPath }; 
                            
                            const box = new THREE.Box3().setFromObject(rawModel);
                            const center = box.getCenter(new THREE.Vector3());
                            rawModel.position.set(-center.x, -box.min.y, -center.z);
                            wrapper.add(rawModel);

                            wrapper.position.set(item.position.x, item.position.y, item.position.z);
                            wrapper.rotation.y = item.rotationY;
                            wrapper.scale.set(item.scale, item.scale, item.scale);

                            wrapper.traverse((node) => {
                                if (node.isMesh) { 
                                    node.castShadow = true; 
                                    node.receiveShadow = true;
                                    if (node.material && node.material.metalness > 0.5 && !node.material.envMap) {
                                        node.material.metalness = 0.1;
                                        node.material.roughness = 0.8;
                                    }
                                }
                            });

                            scene.add(wrapper);
                            loadedModels.push(wrapper); 
                        });
                    });
                }
            }
        }
    })
    .catch(err => console.error("Error loading project:", err));
}

// ==========================================
// 11. EXIT & SAVE LOGIC (Unified logic)
// ==========================================
const saveModal = document.getElementById('save-modal');

const exitBtn = document.getElementById('back-btn') || document.getElementById('exit-editor-btn');
if(exitBtn) {
    exitBtn.removeAttribute('href'); 
    exitBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        const existingModal = document.getElementById('exit-prompt-modal');
        if(existingModal) existingModal.remove();
        
        const exitModal = `
        <div id="exit-prompt-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:999999; display:flex; align-items:center; justify-content:center;">
            <div style="background:#fff; padding:40px; border-radius:20px; text-align:center; max-width:450px; font-family:'Cairo', sans-serif; border-top: 5px solid #d4af37;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 50px; color: #d4af37; margin-bottom: 20px;"></i>
                <h2 style="color:#5D4037; margin-bottom:15px; font-weight:700;">Exit Editor</h2>
                <p style="color:#8D6E63; margin-bottom:30px; font-size:18px; font-weight:600;">Are you sure you want to exit?</p>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <button id="btn-exit-yes" style="background:#dc3545; color:#fff; padding:12px 35px; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-size:15px;">Yes</button>
                    <button id="btn-exit-no" style="background:#F4EFE6; color:#5D4037; padding:12px 35px; border:1px solid #5D4037; border-radius:10px; cursor:pointer; font-weight:bold; font-size:15px;">No</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', exitModal);

        document.getElementById('btn-exit-yes').addEventListener('click', () => {
            window.location.href = '/SSD/dashboard/dashboard.php';
        });
        document.getElementById('btn-exit-no').addEventListener('click', () => {
            document.getElementById('exit-prompt-modal').remove();
        });
    });
}

setTimeout(() => {
    const mainSaveBtn = document.getElementById('save-project-btn');
    if(mainSaveBtn) {
        const cleanSaveBtn = mainSaveBtn.cloneNode(true);
        mainSaveBtn.parentNode.replaceChild(cleanSaveBtn, mainSaveBtn);
        cleanSaveBtn.addEventListener('click', () => {
            if (controls.isLocked) controls.unlock();
            window.isExitingAfterSave = false;
            triggerSaveWorkflow();
        });
    }
}, 500);

if(document.getElementById('cancel-save-btn')){
    document.getElementById('cancel-save-btn').addEventListener('click', () => {
        if(saveModal) saveModal.style.display = 'none';
        window.isExitingAfterSave = false;
    });
}

if(document.getElementById('confirm-save-btn')){
    document.getElementById('confirm-save-btn').addEventListener('click', () => {
        const projName = document.getElementById('project-name').value;
        const projDesc = document.getElementById('project-desc').value;
        executeFinalSave(projName, projDesc);
    });
}

function triggerSaveWorkflow() {
    if (currentProjectId && currentProjectId !== "") {
        console.log("💾 Updating existing project ID:", currentProjectId);
        executeFinalSave(globalProjectName, globalProjectDesc);
    } else {
        if(saveModal) saveModal.style.display = 'flex';
    }
}

function executeFinalSave(projName, projDesc) {
    if (!projName || !projName.trim()) {
        alert("Please enter a Project Name!");
        return;
    }

    let detectRoomType = "bedroom";
    if (window.location.pathname.includes('office')) detectRoomType = "office";
    if (window.location.pathname.includes('bedroom')) detectRoomType = "bedroom";

    const projectData = {
        projId: currentProjectId,
        projectName: projName,
        description: projDesc,
        roomType: detectRoomType, 
        roomSettings: {
            width: roomW,
            length: roomL,
            wallColor: document.getElementById('wall-color').value,
            floorColor: document.getElementById('floor-color').value
        },
        furniture: loadedModels.map(model => ({
            modelPath: model.userData.path,
            position: { x: model.position.x, y: model.position.y, z: model.position.z },
            rotationY: model.rotation.y,
            scale: model.scale.x 
        }))
    };
    
    const confirmBtn = document.getElementById('confirm-save-btn');
    if(confirmBtn) confirmBtn.innerText = "Saving...";
    
    fetch('/SSD/save_project.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    })
    .then(response => response.text())
    .then(data => {
        if(data.includes("success")) {
            // أول ما السيف ينجح، بنطلع التنبيه وبنحول فوراً للداشبورد
            alert(`✅ ${projName} Saved Successfully!`);
            window.location.href = '/SSD/dashboard/dashboard.php'; 
        } else {
            alert("Error saving project: " + data);
            if(confirmBtn) confirmBtn.innerText = "Save to DB";
        }
    }).catch(err => {
        alert("Connection error: " + err);
        if(confirmBtn) confirmBtn.innerText = "Save to DB";
    });
}
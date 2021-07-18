let clock, mixer;
let camera, scene, renderer, controls;
let scaler = 2.5

function loaded() {
    init()

    createMap()
    createRobot()
    animate()
}

function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(20, 20, 50);
    camera.lookAt(new THREE.Vector3(0, 1, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0c0ff);
    
    clock = new THREE.Clock();

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    createFloor()
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
   
    window.addEventListener('resize', onWindowResize);
}

function createFloor() {
    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), 
                                new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(50, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    const dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }
    TWEEN.update(time);
    // rotate stars
    for (let i = 0; i < stars.length; i++) {
        stars[i].rotation.z += 0.01
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
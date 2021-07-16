let clock, gui, mixer, actions, activeAction;
let camera, scene, renderer, controls, robot, face;

const api = { state: 'Walking' };

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(20, 20, 50);
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);

    clock = new THREE.Clock();

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(50, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.1;
    grid.material.transparent = true;
    scene.add(grid);

    // robot
    const loader = new THREE.GLTFLoader();
    loader.load('/res/RobotExpressive.glb', function (gltf) {
        robot = gltf.scene;
        scene.add(robot);
        createGUI(robot, gltf.animations);

    }, undefined, function (e) {
        console.error(e);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    window.addEventListener('resize', onWindowResize);

}

function createGUI(model, animations) {
    const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

    mixer = new THREE.AnimationMixer(model);
    actions = {};
    for (let i = 0; i < animations.length; i++) {
        const clip = animations[i];
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        }
    }
    activeAction = actions['Walking'];
    activeAction.play();
    robot.position.z  = -10 
    createTweet();
}


function createTweet() {
    console.log(robot.position)
    let offset = { step: 0 }      // 起始出發值，之後 onUpdate 會一直改變他 
    let target = { step: 20 }   // 起始目標值，之後會一直被改變

    // Robot 走動補間動畫
    const onUpdate = () => {
        // 移動
        console.log(offset.step)
        robot.position.z = offset.step
    }

    let tween = new TWEEN.Tween(offset)         // 起點為 offset
        .to(target, 5000)                       // 在 5000ms 內移動至 target
        .onUpdate(onUpdate)
        .onComplete(() => {
            tween.stop()
        })

    // 開始移動
    tween.start()
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//
function animate(time) {
    const dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }
    TWEEN.update(time);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
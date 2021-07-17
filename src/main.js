let clock, mixer;
let camera, scene, renderer, controls;

let robot, face, actions, expressions, activeAction, previousAction;
const api = { state: 'Walking'};
const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

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
        robot.position.set(10, 0, 10);
        scene.add(robot);
        queryActions(robot, gltf.animations);
        createTweet();
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

function queryActions(model, animations) {
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
    face = model.getObjectByName( 'Head_4' );
    expressions = Object.keys( face.morphTargetDictionary );

    activeAction = actions['Walking'];
    activeAction.play();
}

function createTweet() {
    let steps = 10
    let offset = { step: 0 }      // 起始出發值，之後 onUpdate 會一直改變他 
    let target = { step: steps }   // 起始目標值，之後會一直被改變

    // Robot 走動補間動畫
    const onUpdate = () => {
        // 移動
        //console.log(offset.step)
        robot.position.z = offset.step
    }

    let tween = new TWEEN.Tween(offset)             // 起點為 offset
        .to(target, 330*steps)                         // 設訂多少ms內移動至 target
        .onUpdate(onUpdate)
        .onComplete(() => {
            tween.stop()
            morphFace()
            changeState()
            //changeEmotion()
        })

    // 開始移動
    tween.start()
}

// switch actions
function fadeToAction(name, duration) {
    console.log(name)
    previousAction = activeAction
    activeAction = actions[name]

    if (previousAction !== activeAction) {
        previousAction.fadeOut(duration)
    }

    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play()
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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
    
function changeEmotion(){
    function restoreEmotion() {
        mixer.removeEventListener('finished', restoreEmotion)
        fadeToAction(api.state, 0.2)
    }
    emotionID = randint(0, emotes.length-1)
    fadeToAction(emotes[emotionID], 1)
    mixer.addEventListener('finished', restoreEmotion)
}

function changeState(){
    function restoreState() {
        mixer.removeEventListener('finished', restoreState)
        fadeToAction(api.state, 0.5)
    }
    statesID = randint(0, states.length-1)
    fadeToAction(states[statesID], 1)
    mixer.addEventListener('finished', restoreState)
}


function morphFace(){
    let id = randint(0, expressions.length-1)
    let value = randint(0, 10)

    console.log(expressions[id])
    face.morphTargetInfluences[id] = value/10;
}

let robot, face, actions, expressions, activeAction, previousAction;

const api = { state: 'Running' };
const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

function createRobot(x, z) {
    const loader = new THREE.GLTFLoader();
    loader.load('/res/RobotExpressive.glb', function (gltf) {
        robot = gltf.scene;
        robot.position.x = x * scaler;
        robot.position.z = z * scaler;
        scene.add(robot);
        queryActions(robot, gltf.animations);
        nextStep();

    }, undefined, function (e) {
        console.error(e);
    });
}

function resetRobot(x, z) {
    let size = Math.floor(mapinfo.length/2)
    robot.position.x = (x-size) * scaler;
    robot.position.z = (z-size) * scaler;
    robot.rotation.y = 0;
    let id = randint(1, 3)
    changeState(id)
    nextStep();

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

    activeAction = actions[api.state];
    activeAction.play();
}

// change robot status
let dirs = ['south', 'east','north', 'west'];
let loop = 0;

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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
    
function changeEmotion(id=-1){
    function restoreEmotion() {
        mixer.removeEventListener('finished', restoreEmotion)
        fadeToAction('Walking', 0.2)
    }
    emotionID = (id<0) ? randint(0, emotes.length-1) : id
    fadeToAction(emotes[emotionID], 1)
    mixer.addEventListener('finished', restoreEmotion)
}

function changeState(id=-1){
    function restoreState() {
        mixer.removeEventListener('finished', restoreState)
        fadeToAction(api.state, 0.5)
    }
    
    statesID = (id<0) ? randint(0, states.length-1) : id
    fadeToAction(states[statesID], 1)
    mixer.addEventListener('finished', restoreState)
}

function morphFace(){
    let id = randint(0, expressions.length-1)
    let value = randint(0, 10)/10
    face.morphTargetInfluences[id] = value
    //console.log(expressions[id], value)
}

// movment
function createTweet(dir, id) {
    let steps = 1 * scaler
    let speed = 400
    let denominator = (api.state == 'Walking') ? 1 : 2;
    
    let offset = { step: 0 }                    // 起始出發值，之後 onUpdate 會一直改變他 
    let target = { step: steps }                // 起始目標值，之後會一直被改變
    let position = new THREE.Vector3 (0, 0, 0)
    //console.log(robot.position)
    position.copy( robot.position );

    // 移動
    const onUpdate = () => {
        //console.log(offset.step)
        if (dir == 'south') {
            robot.position.z = position.z + offset.step
        } else if (dir == 'north') {
            robot.position.z =  position.z - offset.step 
        } else if (dir == 'east') {
            robot.position.x = position.x + offset.step
        } else if (dir == 'west') {
            robot.position.x = position.x - offset.step
        }
    }

    let tween = new TWEEN.Tween(offset)                     // 起點為 offset
        .to(target, speed*steps/denominator)                // 設訂多少ms內移動至 target
        //.easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(onUpdate)
        .onComplete(() => {
            tween.stop()

            morphFace()
            if (id >= 0) {
                changeState(id)
            }
            nextStep()
        })

    // 開始移動
    tween.start()
}

// rotation, radian angle
function createRotationTweet(angle) {
    robot.rotation.y = angle
    return

    let offset = { step: 0 }                                // 起始出發值，之後 onUpdate 會一直改變他 
    let target = { step: angle }                            // 起始目標值，之後會一直被改變
    
    // 旋轉
    const onUpdate = () => {
        robot.rotation.y = offset.step
    }

    let tween = new TWEEN.Tween(offset)                     // 起點為 offset
        .to(target, 1000)                                   // 設訂多少ms內移動至 target
        //.easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(onUpdate)
        .onComplete(() => {
            tween.stop()

            morphFace()
            //changeEmotion()
            createTweet()
        })

    // 開始移動
    tween.start()
}

let mouseRoute = []
let candidatesStack = []
let visited = []
let currentItem =  null
let direction = 'south'
let angle = 0
let mousePos = [0,0]
let movement = null
let forward = true
let startx = 0
let starty = 0

// map route
function initMoveCtrl(x, y) {
    startx = x
    starty = y
    mouseRoute = []
    candidatesStack = []
    visited = []
    currentItem =  null
    direction = 'south'
    angle = 0
    mousePos = [0,0]
    movement = null
    forward = true

    //append route item [direction, parent, child]  
    currentItem = ['south', [-1,-1], [x, y]]
    mouseRoute[mouseRoute.length] = currentItem
    visited[visited.length] = [x,y]
    addCandidates(x,y)
}

function popRoute(){
    return mouseRoute.pop()
}
    
function lastRoute() {
    return mouseRoute[mouseRoute.length-1]
}
 
function isBlock(x,y) {
    return (mapinfo[y][x] == '0')
}

function isStar(x,y) {
    return (mapinfo[y][x] == '3')
}

function canWalk(x, y) {
    if ( x<0 || y<0 || x>= mapinfo[0].length || y >= mapinfo.length)
        return false
    
    for (let i=0; i< visited.length; i++) {
        if (visited[i][0] == x && visited[i][1] == y) {
            return false
        }
    }
    if (!isBlock(x,y)) {
        return true
    }
    return false
}

function addCandidates(x, y) {
    newCandidate = false
    if (canWalk(x+1, y)) {  
        item = ['east', [x, y], [x+1, y]]
        candidatesStack[candidatesStack.length] = item
        newCandidate = true
    }
    if (canWalk(x, y+1)) { 
        item = ['south', [x, y], [x, y+1]]
        candidatesStack[candidatesStack.length] = item
        newCandidate = true
    }
    if (canWalk(x-1, y)) { 
        item = ['west', [x, y], [x-1, y]]
        candidatesStack[candidatesStack.length] = item
        newCandidate = true
    }
    if (canWalk(x, y-1)) { 
        item = ['north', [x, y], [x, y-1]]
        candidatesStack[candidatesStack.length] = item
        newCandidate = true
    }
    return newCandidate
}

function moveForward() {
    let item = null
    if (candidatesStack.length > 0) {
        item = candidatesStack.pop()
        addCandidates(item[2][0], item[2][1])
    }
            
    if (candidatesStack.length == 0) {
        console.log('map error, star not found')
    }

    //console.log("move", item[2][0], item[2][1])
    visited[visited.length] = item[2]
    return item
}

// robot next step
function nextStep() {
    //console.log('nextStep')
    if (forward) {
        movement = moveForward()
    }

    // check if robot needs to move backward
    let itemRoute = lastRoute()
    if (movement[1][0] != itemRoute[2][0] || movement[1][1] != itemRoute[2][1]) { 
        forward = false
        itemRoute = popRoute()
        itemRoute = [revertDir(itemRoute[0]), itemRoute[1], itemRoute[2]]  // revert direction
        mouseBackward(itemRoute)
        itemRoute = lastRoute()
    } else {
        forward = true
        // check if robot found the star
        if (isStar(movement[2][0], movement[2][1])) {
            changeEmotion(5)
            // reset after 3 secs
            let timer = setInterval(function(){
                initMoveCtrl(startx, starty)
                resetRobot(startx, starty)
                clearInterval(timer);
            }, 2000);
        } else {
            mouseForward(movement)
        }
    }
}

function mouseForward(item) {
    mousePos = item[2]
    mouseRoute[mouseRoute.length] = item
    currentItem = item
    createRobotTweet(item[0]) 
}

function mouseBackward(item) {
    mousePos = item[1]
    //console.log('back', mousePos[0], mousePos[1])
    createRobotTweet(item[0]) 
}

//rotation and move robot 
function createRobotTweet(dir, id) {
    if (direction != dir) {
        angle = calculateAngle(dir) 
        direction = dir
        //console.log('change angle', direction, angle)
        createRotationTweet(angle)      // rotate robot
    } else {
        createTweet(direction, id)   // move robot
    }
}

function revertDir(dir) {
    reverse = { 'east' : 'west', 
                'west' : 'east', 
                'north': 'south', 
                'south': 'north'}
    return reverse[dir]
}

function calculateAngle(dirs) {
    angle = {'west'  : -Math.PI/2, 
             'south' :  0, 
             'east'  :  Math.PI/2, 
             'north' :  Math.PI, 
            } 
    return angle[dirs]
}

let mouseRoute = []
let candidatesStack = []
let visited = []
let currentItem =  null
let direction = 'south'
let angle = 0
let mousePos = [0,0]

// map route
function initMap(x, y) {
    console.log('start',x,y)
    //append route item [direction, parent, child]  
    currentItem = ['south', [-1,-1], [x, y]]
    mouseRoute[mouseRoute.length] = currentItem
    visited[visited.length] = [x,y]
    addCandidates(x,y)
}

function popRoute(){
    console.log('pop', lastRoute())
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

    console.log("move", item[2])
    visited[visited.length] = item[2]
    return item
}

// robot next step
function nextStep() {
    //console.log('nextStep')
    let item = moveForward()
    let itemRoute = lastRoute()
    // check if robot needs to move backward
    while (itemRoute[2][0] != item[1][0] || itemRoute[2][1] != item[1][1]) {
        itemRoute = popRoute()
        itemRoute = [reverseDir(itemRoute[0]), itemRoute[1], itemRoute[2]]
        mouseBackward(itemRoute)
        itemRoute = lastRoute()
    }

    // check if robot found the star
    if (isStar(item[2][0],item[2][1])) {
        console.log('game finished')
    } else {
        mouseForward(item)
    }
}

function mouseForward(item) {
    mousePos = item[2]
    mouseRoute[mouseRoute.length] = item
    currentItem = item

    createRobotTweet(item)
}

function mouseBackward(item) {
    mousePos = item[1]
    console.log('back', mousePos)
    createRobotTweet(item)    
}

function createRobotTweet(item) {
    console.log(direction, item[0])
    if (direction != item[0]) {
        angle = calculateAngle(direction+item[0]) 
        direction = item[0]
        console.log(direction, angle)
        createRotationTweet(angle)      // rotate robot
    }
    createTweet(direction)   // move robot
}

function reverseDir(dir) {
    reverse = { 'east' : 'west', 
                'west' : 'east', 
                'north': 'south', 
                'south': 'north'}
    return reverse[dir]
}

function calculateAngle(dirs) {
    angle = {['east'+'west']   :  Math.PI, 
             ['east'+'south']  : -Math.PI/2, 
             ['east'+'north']  :  Math.PI/2, 
             ['west'+'east']   :  Math.PI, 
             ['west'+'north']  : -Math.PI/2, 
             ['west'+'south']  :  Math.PI/2, 
             ['south'+'north'] :  Math.PI, 
             ['south'+'east']  :  Math.PI/2, 
             ['south'+'west']  : -Math.PI/2, 
             ['north'+'south'] :  Math.PI, 
             ['north'+'east']  : -Math.PI/2, 
             ['north'+'west']  :  Math.PI/2, 
            } 
    return angle[dirs]
}

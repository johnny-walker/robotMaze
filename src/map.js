let mapinfo = []
let stars = []

function loadMap(callback) {
    const url = 'http://localhost:5000/map'
    
    let xmlhttp = new XMLHttpRequest()
    let method = 'GET'

    xmlhttp.open(method, url)
    xmlhttp.onerror = () => {
        console.log("** An error occurred during the transaction")
    }
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // response are characters data type, convert to json by JSON.parse
            callback(JSON.parse(xmlhttp.responseText))
        }
    }
    xmlhttp.send()

}

function createMap() {
    loadMap( function (map) {
        let x = 0, z = 0
        mapinfo = map
        let size = Math.floor(mapinfo.length/2)
        for (let j = 0; j < mapinfo.length; j++) {
            //console.log(mapinfo[j])
            for (let i = 0; i < mapinfo[0].length; i++) {
                if (mapinfo[j][i] == '0'){
                    createCube(i-size, 0, j-size)
                } else if (mapinfo[j][i] == '3') {
                    createStar(i-size, 1, j-size)
                } else if (mapinfo[j][i] == '2') {
                    initMoveCtrl(i, j)   // in moveCtrl.js
                    x = i-size
                    z = j-size
                }
            }
        }
        createRobot(x, z)   // in robot.js
        addGridHelper()
    })
}

// cube
function createCube(x, y, z) {
    let cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xb0c0ff, map: new THREE.TextureLoader().load('res/wall.jpg') });
    let voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
    voxel.position.set(x * scaler, y * scaler + 1, z * scaler)
    scene.add(voxel);
}

// star
function createStar(x, y, z) {
    // https://threejs.org/docs/#examples/en/loaders/OBJLoader
    let loader = new THREE.OBJLoader()
    let starMat = new THREE.MeshStandardMaterial({ color: 0xfeb74c })
    loader.load('res/star.obj', function (mesh) {
        mesh.children.forEach(function (child) {
            child.material = starMat
            child.geometry.computeFaceNormals()
            child.geometry.computeVertexNormals()
        })
        let rescale = 0.12
        mesh.scale.set(rescale, rescale, rescale)
        mesh.rotation.x = Math.PI / 2
        mesh.position.set(x * scaler, 1, z * scaler)
        scene.add(mesh)
        stars.push(mesh)
    })
}

function addGridHelper() {
    const grid = new THREE.GridHelper(gridsize, cellnum, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}
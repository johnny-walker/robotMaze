let mapinfo = []
let stars = []

function loadMap(callback) {
    const url = 'http://localhost:3000/map'
    
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
        for (let j = 0; j < 21; j++) {
            //console.log(mapinfo[j])
            for (let i = 0; i < 21; i++) {
                if (mapinfo[j][i] == '0'){
                    createCube(i-10, 0, j-10)
                } else if (mapinfo[j][i] == '3') {
                    createStar(i-10, 1, j-10)
                } else if (mapinfo[j][i] == '2') {
                    initMap(i, j)
                    x = i-10
                    z = j-10
                }
            }
        }
        createRobot(x, z)
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
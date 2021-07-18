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
        mapinfo = map
        console.log(map[0])
        createCube(9, 0, -6)
        createCube(3, 0, 3)
        createCube(-7, 0, 6)
        createStar(-8, -5)
    })
}

// cube
function createCube(x, y, z) {

    let cubeGeo = new THREE.BoxGeometry(3, 3, 3);
    let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('res/square.png') });
    let voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
    voxel.position.set(x * scaler, y * scaler + 1.5, z * scaler)
    scene.add(voxel);
}

// star
function createStar(x, z) {
    let loader = new THREE.OBJLoader()
    let starMat = new THREE.MeshStandardMaterial({ color: 0xfeb74c })

    let count = 1
    for (let i = 0; i < count; i++) {
        loader.load('res/star.obj', function (mesh) {
            mesh.children.forEach(function (child) {
                child.material = starMat
                child.geometry.computeFaceNormals()
                child.geometry.computeVertexNormals()
            })
            let rescale = 0.15
            mesh.scale.set(rescale, rescale, rescale)
            mesh.rotation.x = Math.PI / 2
            mesh.position.set(x * scaler, 1.5 * scaler, z * scaler)
            scene.add(mesh)
            stars.push(mesh)
        })
    }
}
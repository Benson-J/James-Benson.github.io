let stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

let camera, scene, renderer, light
let direction = {x:0,y:0,z:0}
let velocity = {x:0,y:0,z:0}
let mineFrameCount = 0
let bulletFrameCount = 0
let shoot = 0

let planeMaterial, planeGeometry, planeMesh

let laserMaterial, laserGeometry, laserMesh

document.addEventListener('keydown', (e) => {
    if(!e.repeat) {
        switch(e.key) {
            case 'w':
                direction.y += 1
                break
            case 's':
                direction.y -= 1
                break
            case 'a':
                direction.x -= 1
                break
            case 'd':
                direction.x += 1
                break
            case ' ':
                shoot = 1
                break
        }
    }
})

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'w':
            direction.y -= 1
            break
        case 's':
            direction.y += 1
            break
        case 'a':
            direction.x += 1
            break
        case 'd':
            direction.x -= 1
            break
        case ' ':
            shoot = 0
            break
    }
})

init()
animate()

function init() {

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100000)
    camera.position.z = 10

    scene = new THREE.Scene()

    light = new THREE.PointLight(0xffffff, 1, 0)
    light.position.x = 10
    light.position.y = 10
    light.position.z = 10
    scene.add(light)

    let polyVertices = [
        1,0,.5, -1,0,.5, 0,.1,.5, 0,-.1,.5, 0,0,-.5
    ]

    let polyFaces = [
        0,2,3, 2,1,3, 0,4,2, 0,3,4, 1,2,4, 1,4,3
    ]

    planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x005500})
    planeGeometry = new THREE.PolyhedronGeometry(polyVertices,polyFaces,1)
    planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
    scene.add(planeMesh)

    laserMaterial = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xff7777})
    laserGeometry = new THREE.BoxGeometry(.03, .03, 100)
    laserMesh = new THREE.Mesh(laserGeometry, laserMaterial)
    scene.add(laserMesh)
    laserMesh.position.z = -50

    renderer = new THREE.WebGLRenderer({antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight-5)
    document.body.appendChild(renderer.domElement)
}

function animate() {
    stats.begin()

    if (direction.x && (Math.abs(planeMesh.position.x) < 6 || direction.x * Math.sign(planeMesh.position.x) <= 0)) {
        velocity.x += 0.1 * direction.x
    } else {
        velocity.x -= 0.1 * Math.sign(velocity.x)
        velocity.x = (Math.abs(velocity.x) <= 0.1 ? 0 : velocity.x)
    }
    if (Math.abs(velocity.x) > 2) {
        velocity.x = Math.sign(velocity.x) * 2
    }

    if (direction.y && (Math.abs(planeMesh.position.y) < 4 || direction.y * Math.sign(planeMesh.position.y) <= 0)) {
        velocity.y += 0.1 * direction.y
    } else {
        velocity.y -= 0.1 * Math.sign(velocity.y)
        velocity.y = (Math.abs(velocity.y) < 0.1 ? 0 : velocity.y)
    }
    if (Math.abs(velocity.y) > 2) {
        velocity.y = Math.sign(velocity.y) * 2
    }

    if (Math.abs(planeMesh.position.x) < 6 || velocity.x * Math.sign(planeMesh.position.x) <= 0) {
        planeMesh.position.x += 0.05 * velocity.x
    }
    if (Math.abs(planeMesh.position.y) < 4 || velocity.y * Math.sign(planeMesh.position.y) <= 0) {
        planeMesh.position.y += 0.05 * velocity.y
    }

    planeMesh.rotation.x = 0.3 * velocity.y
    planeMesh.rotation.z = -0.3 * velocity.x

    laserMesh.position.x = planeMesh.position.x
    laserMesh.position.y = planeMesh.position.y

    if(bulletFrameCount >= 2 && shoot) {
        bulletFrameCount = 0
        createBullet()
    }
    bulletFrameCount++

    if(mineFrameCount >= 60) {
        mineFrameCount = 0
        createMine()
    }
    mineFrameCount++

    renderer.render(scene, camera)
    stats.end()
    requestAnimationFrame(animate)
}

function createMine() {
    let mineGeometry = new THREE.SphereGeometry(.5)
    let mineMaterial = new THREE.MeshLambertMaterial({color: 0x888888, transparent: 1, opacity: 0})
    let mineMesh = new THREE.Mesh(mineGeometry, mineMaterial)
    let animate = function() {
        mineMesh.position.z += 0.05
        renderer.render(scene, camera)
        if (mineMesh.position.z > 10) {
            destroyMesh(mineMesh)
            return false
        } else if (mineMesh.material.opacity < 1) {
            mineMesh.material.opacity += 0.01
        }
        requestAnimationFrame(animate)
    }
    scene.add(mineMesh)
    mineMesh.position.x = 12 * Math.random() - 6
    mineMesh.position.y = 8 * Math.random() - 4
    mineMesh.position.z = -10
    animate()
}

function createBullet() {
    let bulletGeometry = new THREE.SphereGeometry(.1, 1, 1)
    let bulletMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: 1})
    let bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial)
    function animate() {
        bulletMesh.position.z -= 0.5
        renderer.render(scene, camera)
        if (bulletMesh.position.z < -15) {
            bulletMesh.material.opacity -= 0.1
            if (bulletMesh.material.opacity <= 0) {
                destroyMesh(bulletMesh)
                return false
            }
        }
        requestAnimationFrame(animate)
    }
    scene.add(bulletMesh)
    bulletMesh.position.x = planeMesh.position.x
    bulletMesh.position.y = planeMesh.position.y
    animate()
}

function destroyMesh(mesh) {
    mesh.geometry.dispose()
    mesh.material.dispose()
    scene.remove(mesh)
    mesh = null
}
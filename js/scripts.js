// let stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)

let canvasWidth
let canvasHeight
let animation

let camera, scene, renderer, light
let direction = {x:0,y:0,z:0}
let velocity = {x:0,y:0,z:0}
let mineFrameCount = 0
let bulletFrameCount = 0
let shoot = 0

let planeMaterial, planeGeometry, planeMesh
let plane2Material, plane2Geometry, plane2Mesh

let laserMaterial, laserGeometry, laserMesh

let bullets = {}
let bulletNo = 0
let bulletGeometry = new THREE.SphereGeometry(.1, 1, 1)

let mines = {}
let mineNo = 0
let mineGeometry = new THREE.SphereGeometry(.5)

let touchX
let touchY

document.querySelector('#startButton').addEventListener('click', (e) => {
    document.documentElement.webkitRequestFullScreen()
    setTimeout(function () {
        e.target.remove()
        init()
        animate()
    }, 500)
})

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
                console.log(bullets)
                break
            case ' ':
                shoot = 1
                break
            case 'Escape':
                document.documentElement.webkitRequestFullScreen()
                break
            case '=':
                animation = requestAnimationFrame(animate)
                break
            case '-':
                cancelAnimationFrame(animation)
                break
        }
    }
    console.log(e.key)
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

function init() {
    if (window.innerWidth >= window.innerHeight) {
        canvasHeight = window.innerHeight
        canvasWidth = window.innerHeight
    } else {
        canvasHeight = window.innerWidth
        canvasWidth = window.innerWidth
    }

    camera = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 0.01, 100000)
    camera.position.z = 10

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x7ec0ee)

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
    // scene.add(planeMesh)
    createPlane2()

    laserMaterial = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xff7777})
    laserGeometry = new THREE.BoxGeometry(.03, .03, 100)
    laserMesh = new THREE.Mesh(laserGeometry, laserMaterial)
    scene.add(laserMesh)
    laserMesh.position.z = -50

    renderer = new THREE.WebGLRenderer({antialias: true })
    renderer.setSize(canvasWidth, canvasHeight-5)
    document.body.appendChild(renderer.domElement)

    // document.querySelector('canvas').addEventListener('click', function (e) {
    //     cancelAnimationFrame(animation)
    // })

    let tracker = document.querySelector('.tracker')

    document.querySelector('html').addEventListener('touchstart', function (e) {
        touchX = e.touches[0].screenX
        touchY = e.touches[0].screenY
        tracker.style.display = 'block'
        tracker.style.left = touchX + 'px'
        tracker.style.top = touchY + 'px'
        shoot = 1
    })

    document.querySelector('html').addEventListener('touchmove', function (e) {
        if (e.touches[0].screenX > touchX) {
            direction.x = 1
        } else {
            direction.x = -1
        }
        if (e.touches[0].screenY > touchY) {
            direction.y = -1
        } else {
            direction.y = 1
        }
    })

    document.querySelector('html').addEventListener('touchend', function () {
        direction.x = 0
        direction.y = 0
        tracker.style.display = 'none'
        shoot = 0
    })
}

function animate() {
    // stats.begin()

    planeControls()

    laserMesh.position.x = planeMesh.position.x
    laserMesh.position.y = planeMesh.position.y

    if(bulletFrameCount >= 2 && shoot) {
        bulletFrameCount = 0
        createBullet()
    }
    bulletFrameCount++
    animateBullet()

    if(mineFrameCount >= 60) {
        mineFrameCount = 0
        createMine()
    }
    mineFrameCount++
    animateMine()

    renderer.render(scene, camera)
    // stats.end()
    animation = requestAnimationFrame(animate)
}

function createMine() {
    let mineMaterial = new THREE.MeshLambertMaterial({color: 0x888888, transparent: 1, opacity: 0})
    let mesh = new THREE.Mesh(mineGeometry, mineMaterial)
    scene.add(mesh)
    mesh.position.x = 12 * Math.random() - 6
    mesh.position.y = 8 * Math.random() - 4
    mesh.position.z = -10
    mines[mineNo] = mesh
    mineNo++
}

function animateMine() {
    Object.keys(mines).forEach(function (key) {
        let mesh = mines[key]
        mesh.position.z += 0.05
        if (mesh.position.z > 0) {
            mesh.material.opacity -= 0.1
            if (mesh.material.opacity <= 0) {
                destroyMesh(mesh, bullets, key)
            }
        } else if (mesh.material.opacity < 1) {
            mesh.material.opacity += 0.01
        }
    })
}

function createBullet() {
    let bulletMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: 1})
    let mesh = new THREE.Mesh(bulletGeometry, bulletMaterial)
    scene.add(mesh)
    mesh.position.x = planeMesh.position.x
    mesh.position.y = planeMesh.position.y
    bullets[bulletNo] = mesh
    bulletNo++
}

function animateBullet() {
    Object.keys(bullets).forEach(function (key) {
        let mesh = bullets[key]
        mesh.position.z -= 0.5
        if (mesh.position.z < -15) {
            mesh.material.opacity -= 0.1
            if (mesh.material.opacity <= 0) {
                destroyMesh(mesh, bullets, key)
            }
        }
    })
}

function destroyMesh(mesh, array, key) {
    scene.remove(mesh)
    delete array[key]
}

function planeControls() {
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

    if (Math.abs(planeMesh.position.x) < 4 || velocity.x * Math.sign(planeMesh.position.x) <= 0) {
        planeMesh.position.x += 0.05 * velocity.x
    }
    if (Math.abs(planeMesh.position.y) < 4 || velocity.y * Math.sign(planeMesh.position.y) <= 0) {
        planeMesh.position.y += 0.05 * velocity.y
    }

    planeMesh.rotation.x = 0.3 * velocity.y
    planeMesh.rotation.z = -0.3 * velocity.x
}

function createPlane2() {
    plane2Geometry = new THREE.Geometry()
    plane2Geometry.vertices = [
        new THREE.Vector3(0, 0, -1),    // 0 front
        new THREE.Vector3(0, 0.2, 1),   // 1 top
        new THREE.Vector3(0, -.2, 1),   // 2 bottom
        new THREE.Vector3(1, 0, 2),     // 3 right
        new THREE.Vector3(-1, 0, 2)     // 4 left
    ]
    plane2Geometry.faces = [
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(0, 4, 1),
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 2, 4),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(1, 4, 2)
    ]
    plane2Geometry.computeFaceNormals();
    plane2Geometry.computeVertexNormals();
    plane2Material = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x005500})

    planeMesh = new THREE.Mesh(plane2Geometry, plane2Material)
    scene.add(planeMesh)
}

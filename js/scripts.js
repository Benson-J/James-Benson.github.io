// let stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)

let canvasWidth, canvasHeight
let animation

let camera, scene, renderer, light
let direction = {x:0,y:0,z:0}
let velocity = {x:0,y:0,z:0}
let shoot = 0

let planeMesh = createPlane2()

let laserMaterial, laserGeometry, laserMesh

let bullets = {}, bulletNo = 0, bulletGeometry = new THREE.SphereGeometry(.1, 1, 1)

let mines = {}, mineNo = 0, mineGeometry = new THREE.SphereGeometry(.5)

let xOrigin, xDisplacement
let yOrigin, yDisplacement

document.querySelector('#startButton').addEventListener('click', (e) => {
    document.documentElement.webkitRequestFullScreen()
    setTimeout(function () {
        e.target.remove()
        init()
        animate(0,0)
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

    scene.add(planeMesh)

    laserMaterial = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xff7777})
    laserGeometry = new THREE.BoxGeometry(.03, .03, 100)
    laserMesh = new THREE.Mesh(laserGeometry, laserMaterial)
    scene.add(laserMesh)
    laserMesh.position.z = -50

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(canvasWidth, canvasHeight-5)
    document.querySelector('body').insertAdjacentElement('afterbegin', renderer.domElement)

    touchControls()
}

function animate(bulletFrameCount, mineFrameCount) {
    // stats.begin()

    planeMovement()

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
    animation = requestAnimationFrame(()=> animate(bulletFrameCount, mineFrameCount))
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

function planeMovement() {
    if (direction.x) {
        velocity.x += 0.2 * direction.x
    } else {
        velocity.x -= 0.1 * Math.sign(velocity.x)
        velocity.x = (Math.abs(velocity.x) <= 0.1 ? 0 : velocity.x)
    }
    if (Math.abs(velocity.x) > 2) {
        velocity.x = Math.sign(velocity.x) * 2
    }

    if (direction.y) {
        velocity.y += 0.2 * direction.y
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
    let planeGeometry = new THREE.Geometry()
    let planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x005500})
    planeGeometry.vertices = [
        new THREE.Vector3(0, 0, -1),    // 0 front
        new THREE.Vector3(0, 0.2, 1),   // 1 top
        new THREE.Vector3(0, -.2, 1),   // 2 bottom
        new THREE.Vector3(1, 0, 2),     // 3 right
        new THREE.Vector3(-1, 0, 2)     // 4 left
    ]
    planeGeometry.faces = [
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(0, 4, 1),
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 2, 4),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(1, 4, 2)
    ]
    planeGeometry.computeFaceNormals();
    planeGeometry.computeVertexNormals();
    return new THREE.Mesh(planeGeometry, planeMaterial)
}

function touchControls() {
    let shootButton = document.querySelector('.shootButton')
    let joyStick = document.querySelector('.joyStick')

    shootButton.addEventListener('touchstart', function () {
        shoot = 1
    })

    shootButton.addEventListener('touchend', function () {
        shoot = 0
    })

    joyStick.addEventListener('touchstart', function (e) {
        xOrigin = e.touches[0].screenX
        yOrigin = e.touches[0].screenY
    })

    joyStick.addEventListener('touchmove', function (e) {
        let radius = parseFloat(window.getComputedStyle(e.target).width) / 2
        let distance
        let xAngle, yAngle
        xDisplacement = e.touches[0].screenX - xOrigin
        yDisplacement = e.touches[0].screenY - yOrigin
        distance = Math.sqrt(Math.pow(xDisplacement, 2) + Math.pow(yDisplacement, 2))
        xAngle = Math.asin(xDisplacement/distance)
        yAngle = Math.asin(yDisplacement/distance)
        if (distance > radius) {
            xDisplacement = Math.sin(xAngle) * radius
            yDisplacement = Math.sin(yAngle) * radius
        }
        direction.x = xDisplacement / radius
        direction.y = -yDisplacement / radius
        e.target.style.transform = 'translate(' + xDisplacement + 'px, ' + yDisplacement + 'px)'
    })

    joyStick.addEventListener('touchend', function (e) {
        e.target.style.transform = 'translate(0,0)'
        direction.x = 0
        direction.y = 0
    })
}
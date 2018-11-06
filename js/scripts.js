let camera, scene, renderer
let geometry, material1, material2, light, light2
let sunGeometry, sunMesh
let planetGeometry, planet1Mesh, planet2Mesh, planet3Mesh, planet4Mesh
let ring1Geometry, ring2Geometry, ring3Geometry, ring4Geometry
let ring1Mesh, ring2Mesh, ring3Mesh, ring4Mesh
let controls
let planet1Angle = 0, planet2Angle = 0, planet3Angle = 0, planet4Angle = 0

const planet1Speed = 1-2*Math.random()
const planet2Speed = 1-2*Math.random()
const planet3Speed = 1-2*Math.random()
const planet4Speed = 1-2*Math.random()

init()
animate()

function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000)
    camera.position.z = 30
    camera.position.y = camera.position.z * Math.sqrt(3) / 3
    camera.rotation.x = - Math.PI / 6

    controls = new THREE.OrbitControls(camera)

    scene = new THREE.Scene()

    light = new THREE.PointLight(0xffff88, 5, 0)
    light.position.y = 10

    material1 = new THREE.MeshLambertMaterial({color: 0xffff88})
    material2 = new THREE.MeshLambertMaterial({color: 0xaaaaff})

    sunGeometry = new THREE.SphereGeometry(3)
    sunMesh = new THREE.Mesh(sunGeometry, material1)

    planetGeometry = new THREE.SphereGeometry(2)
    planet1Mesh = new THREE.Mesh(planetGeometry, material2)
    planet2Mesh = new THREE.Mesh(planetGeometry, material2)
    planet3Mesh = new THREE.Mesh(planetGeometry, material2)
    planet4Mesh = new THREE.Mesh(planetGeometry, material2)

    ring1Geometry = new THREE.TorusGeometry(5, 0.05, 3, 50)
    ring1Mesh = new THREE.Mesh(ring1Geometry)
    ring2Geometry = new THREE.TorusGeometry(10, 0.05, 3, 50)
    ring2Mesh = new THREE.Mesh(ring2Geometry)
    ring3Geometry = new THREE.TorusGeometry(15, 0.05, 3, 50)
    ring3Mesh = new THREE.Mesh(ring3Geometry)
    ring4Geometry = new THREE.TorusGeometry(20, 0.05, 3, 50)
    ring4Mesh = new THREE.Mesh(ring4Geometry)

    scene.add(light)
    scene.add(light2)
    scene.add(sunMesh)
    scene.add(planet1Mesh)
    scene.add(planet2Mesh)
    scene.add(planet3Mesh)
    scene.add(planet4Mesh)
    scene.add(ring1Mesh)
    scene.add(ring2Mesh)
    scene.add(ring3Mesh)
    scene.add(ring4Mesh)

    ring1Mesh.rotation.x = Math.PI / 2
    ring2Mesh.rotation.x = Math.PI / 2
    ring3Mesh.rotation.x = Math.PI / 2
    ring4Mesh.rotation.x = Math.PI / 2

    renderer = new THREE.WebGLRenderer({antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
}

function animate() {
    requestAnimationFrame(animate)

    sunMesh.rotation.y += 0.01
    planet1Mesh.rotation.y -= 0.1 * planet1Speed
    planet2Mesh.rotation.y -= 0.1 * planet2Speed
    planet3Mesh.rotation.y -= 0.1 * planet3Speed
    planet4Mesh.rotation.y -= 0.1 * planet4Speed

    planet1Mesh.position.z = 5 * Math.cos(planet1Angle)
    planet1Mesh.position.x = 5 * Math.sin(planet1Angle)
    planet1Angle += 0.05 * planet1Speed

    planet2Mesh.position.z = 10 * Math.cos(planet2Angle)
    planet2Mesh.position.x = 10 * Math.sin(planet2Angle)
    planet2Angle += 0.05 * planet2Speed

    planet3Mesh.position.z = 15 * Math.cos(planet3Angle)
    planet3Mesh.position.x = 15 * Math.sin(planet3Angle)
    planet3Angle += 0.05 * planet3Speed

    planet4Mesh.position.z = 20 * Math.cos(planet4Angle)
    planet4Mesh.position.x = 20 * Math.sin(planet4Angle)
    planet4Angle += 0.05 * planet4Speed

    renderer.render(scene, camera)
}
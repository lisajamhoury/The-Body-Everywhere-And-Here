// The Body Everywhere and Here Class 4: Kinectron in three.js with Three.Meshline
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here/

// This example uses the Kinectron camera joint positioning
// in three.js with Three.Meshline to draw in 3D

// Set up three.js scene
let container = document.getElementById("container");
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.z = -1000;
camera.lookAt(scene.position);

// Set up three.js renderer
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Create the orbit controller
let controls = new THREE.OrbitControls(camera, renderer.domElement);

// Load the texture for the lines
let loader = new THREE.TextureLoader();
let strokeTexture;
loader.load("assets/stroke.png", function (texture) {
  strokeTexture = texture;
  strokeTexture.wrapS = strokeTexture.wrapT = THREE.RepeatWrapping;
  init();
});

// Set the resolution for lines
let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

// Geometry for line mesh
let geo = [];

// Raycaster
let raycaster = new THREE.Raycaster();

// New and old point positions
let pos = {};
let nPos = {};

// Rotation angle
let angle = 0;
let meshes = {};

let material;

// For Kinect points
const numJoints = 8;
let azureJointPos = {};
let joints = [];

let userInteracting = true;

// For raycaster
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1000, 1000),
  new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
);
plane.material.visible = false;
scene.add(plane);

function init() {
  initMeshes();
  initKinectron();
  onWindowResize();
  render();
  checkTimer();

  window.addEventListener("resize", onWindowResize);
}

// Crate all meshes and past and current positions for ribbons
function initMeshes() {
  for (let i = 0; i < numJoints; i++) {
    if (!meshes[i]) {
      meshes[i] = prepareMesh(i);
      nPos[i] = new THREE.Vector3();
      pos[i] = new THREE.Vector3();
    }
  }

  // Use only select joints
  // Order them how we want them in the array
  azureJointPos[0] = 7; // left hand
  azureJointPos[1] = 8;
  azureJointPos[2] = 9;
  azureJointPos[3] = 10;
  azureJointPos[4] = 14; // left hand
  azureJointPos[5] = 15;
  azureJointPos[6] = 16;
  azureJointPos[7] = 17;
}

// Create mkaterial and geometry for ribbons
function prepareMesh(colorIndex) {
  // Create 600 positions
  let geo = new Float32Array(200 * 3);

  // Make them all equal 0
  for (let j = 0; j < geo.length; j += 3) {
    geo[j] = geo[j + 1] = geo[j + 2] = 0;
  }

  // Create a new meshline
  let meshLine = new MeshLine();

  // Give it the geometry
  meshLine.setGeometry(geo, function (p) {
    return p; // returns 0
  });

  // Get color for ribbon
  const clr = map(colorIndex, 0, numJoints, 150, 200);

  // Create ribon material
  material = new MeshLineMaterial({
    useMap: true,
    map: strokeTexture,
    color: new THREE.Color(`hsl(${clr}, 100%, 50%)`),
    opacity: 1,
    resolution: resolution,
    sizeAttenuation: true,
    lineWidth: 25,
    depthTest: false,
    blending: THREE.NormalBlending,
    transparent: true,
    repeat: new THREE.Vector2(1, 2),
  });

  // Create a three.js mesh to hold meshline ribbon
  let mesh = new THREE.Mesh(meshLine.geometry, material);
  mesh.geo = geo;
  mesh.g = meshLine;

  // Add it to the scene
  scene.add(mesh);

  return mesh;
}

function initKinectron() {
  const kinectron = new Kinectron("127.0.0.1");
  kinectron.setKinectType("azure");
  kinectron.makeConnection();
  kinectron.startTrackedBodies(getJoints);
}

function getJoints(data) {
  joints = data.skeleton.joints;
}

function checkIntersection(id) {
  // Create a vector to hold the joint position
  let tmpVector = new THREE.Vector3();

  // Use past position to smooth the movement
  tmpVector.copy(nPos[id]).sub(pos[id]).multiplyScalar(0.05);
  Maf.clamp(tmpVector.x, -1, 1);
  Maf.clamp(tmpVector.y, -1, 1);
  Maf.clamp(tmpVector.z, -1, 1);

  pos[id].add(tmpVector);

  raycaster.setFromCamera(pos[id], camera);

  // See if the ray from the camera into the world hits one of our meshes
  var intersects = raycaster.intersectObject(plane);

  // Toggle rotation bool for meshes
  if (intersects.length > 0) {
    var mesh = meshes[id];
    var geo = mesh.geo;
    var g = mesh.g;

    var d = intersects[0].point.x;

    for (var j = 0; j < geo.length; j += 3) {
      geo[j] = geo[j + 3] * 1.001;
      geo[j + 1] = geo[j + 4] * 1.001;
      geo[j + 2] = geo[j + 5] * 1.001;
    }

    geo[geo.length - 3] = d * Math.cos(angle);
    geo[geo.length - 2] = intersects[0].point.y;
    geo[geo.length - 1] = d * Math.sin(angle);

    g.setGeometry(geo);
  }
}

function checkTimer() {
  for (var i in nPos) {
    checkIntersection(i);
  }
  setTimeout(checkTimer, 20);
}

function render() {
  requestAnimationFrame(render);

  if (joints.length > 0) {
    for (let i = 0; i < numJoints; i++) {
      const jointNo = azureJointPos[i];
      nPos[i].x = (joints[jointNo].cameraX / 1000) * -1;
      nPos[i].y = (joints[jointNo].cameraY / 1000) * -1;
      nPos[i].z = (joints[jointNo].cameraZ / 1000) * -1;
    }
  }

  angle += 0.005;

  controls.update();

  for (var i in meshes) {
    var mesh = meshes[i];
    mesh.rotation.y = angle;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  var w = container.clientWidth;
  var h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);

  resolution.set(w, h);
}

function map(value, inputMin, inputMax, outputMin, outputMax) {
  return (
    ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) +
    outputMin
  );
}

// The Body Everywhere and Here Class 4: Kinectron in three.js with Three.Meshline ribbons
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here/

// This example uses the Kinectron camera joint positioning
// in three.js with Three.Meshline to draw ribbons with hands

// line material from THREE.MeshLine spinner example
// https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html

// Set up three.js scene and camera
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

// Create the orbit controller for user mouse control
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

// Create a raycaster
// https://threejs.org/docs/#api/en/core/Raycaster
// Coding Train Raycaster
// https://www.youtube.com/watch?v=TOEi6T2mtHo
let raycaster = new THREE.Raycaster();

// Objects to hold new and old point positions
let pos = {}; // old position
let nPos = {}; // new positiosn

// Variable for rotation angle
let angle = 0;

// Object to hold line meshes
let meshes = {};

// Variable for line mesh material
let material;

// How many kinect points we are using
const numJoints = 8;

// Object to order joint positions
let azureJointPos = {};

// Global array to hold joints
let joints = [];

// Create plane for Raycaster intersections
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1000, 1000),
  new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
);
plane.material.visible = false;
scene.add(plane);

// Starts up the sketch
function init() {
  initMeshes();
  initKinectron();
  onWindowResize();
  render();
  checkTimer();

  window.addEventListener("resize", onWindowResize);
}

// Create all meshes and past and current positions for ribbons
function initMeshes() {
  for (let i = 0; i < numJoints; i++) {
    meshes[i] = prepareMesh(i);
    nPos[i] = new THREE.Vector3();
    pos[i] = new THREE.Vector3();
  }

  // Use only select joints
  // Order them how we want them in the array
  // The order is so the color gradient works correctly
  azureJointPos[0] = 7; // left wrist
  azureJointPos[1] = 8; // left hand
  azureJointPos[2] = 9; // left handtip
  azureJointPos[3] = 10; // left thumb
  azureJointPos[4] = 14; // right wrist
  azureJointPos[5] = 15; //  right hand
  azureJointPos[6] = 16; // right handtip
  azureJointPos[7] = 17; // right thumb
}

// Create material and geometry for ribbons
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
  meshLine.setGeometry(geo);

  // Get color for ribbon, use hsl color
  // Try 0-255
  const clr = map(colorIndex, 0, numJoints, 150, 200);

  // Create ribon material
  material = new MeshLineMaterial({
    useMap: true, // turn to false for no texture
    map: strokeTexture, // adds the texture from the stroke image file
    color: new THREE.Color(`hsl(${clr}, 100%, 50%)`), // sets color using hsl
    opacity: 1, // alter the alpha of the lines
    resolution: resolution, // screen resolution
    lineWidth: 25, // how thick are the lines
    depthTest: false, // must be off for blending to work // https://stackoverflow.com/questions/37647853/three-js-depthwrite-vs-depthtest-for-transparent-canvas-texture-map-on-three-p/37651610
    blending: THREE.NormalBlending, // see threejs blending modes
    transparent: true, // allows transparency
    repeat: new THREE.Vector2(1, 2),
  });

  // Create a three.js mesh to hold meshline ribbon
  // add geo and line to the mesh for later access
  let mesh = new THREE.Mesh(meshLine.geometry, material);
  mesh.geo = geo;
  mesh.g = meshLine;

  // Add it to the scene
  scene.add(mesh);

  // Return the mesh
  return mesh;
}

function initKinectron() {
  // Create kinectron with specified ip address
  const kinectron = new Kinectron("127.0.0.1");
  // Choose kinect type
  kinectron.setKinectType("azure");
  // Connect to the server
  kinectron.makeConnection();
  // Start the bodies feed and set a callback to use for incoming data
  kinectron.startTrackedBodies(getJoints);
}

// Runs every time we get data from the kinectron server
function getJoints(data) {
  // Set global joints array to incoming data
  joints = data.skeleton.joints;
}

// From https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html
function checkIntersection(id) {
  // Create a vector to hold the joint position
  let tmpVector = new THREE.Vector3();

  // Use past position to smooth the movement
  // Multiplyscalar controls the smoothing.
  tmpVector.copy(nPos[id]).sub(pos[id]).multiplyScalar(0.05);
  Maf.clamp(tmpVector.x, -1, 1);
  Maf.clamp(tmpVector.y, -1, 1);
  Maf.clamp(tmpVector.z, -1, 1);

  // Add vector as current position
  pos[id].add(tmpVector);

  // Set the raycaster to the curent position
  raycaster.setFromCamera(pos[id], camera);

  // See if the ray from the camera into the world hits one of the meshes
  let intersects = raycaster.intersectObject(plane);

  // If there is an intersection
  if (intersects.length > 0) {
    // Get the lines
    let mesh = meshes[id];
    let geo = mesh.geo;
    let g = mesh.g;

    // Get the intersection x position
    let iX = intersects[0].point.x;

    // Advance all of the mesh points
    for (let j = 0; j < geo.length; j += 3) {
      geo[j] = geo[j + 3] * 1.001;
      geo[j + 1] = geo[j + 4] * 1.001;
      geo[j + 2] = geo[j + 5] * 1.001;
    }

    // Create curve based on intersection and point position
    geo[geo.length - 3] = iX * Math.cos(angle);
    geo[geo.length - 2] = intersects[0].point.y;
    geo[geo.length - 1] = iX * Math.sin(angle);

    // Update geometry
    g.setGeometry(geo);
  }
}

// Check raycaster intersections every 20 milliseconds
// From // https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html
function checkTimer() {
  // For all of the new positions
  for (let i in nPos) {
    checkIntersection(i);
  }
  setTimeout(checkTimer, 20);
}

function render() {
  // Request anim frame
  // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
  requestAnimationFrame(render);

  // Update all the joint positions
  if (joints.length > 0) {
    for (let i = 0; i < numJoints; i++) {
      // Find the corresponding joint number
      const jointNo = azureJointPos[i];

      // Azure Kinect camera positioning is in mm
      // Divide by 1000 to get smaller numbers
      // Flip the rotaion with -1 to mirror user
      nPos[i].x = (joints[jointNo].cameraX / 1000) * -1;
      nPos[i].y = (joints[jointNo].cameraY / 1000) * -1;
      nPos[i].z = (joints[jointNo].cameraZ / 1000) * -1;
    }
  }

  // Rotate the ribbons
  angle += 0.005;

  for (let i in meshes) {
    let mesh = meshes[i];
    mesh.rotation.y = angle;
  }

  // Update the controls
  controls.update();

  // Render the scene
  // https://stackoverflow.com/questions/41077723/what-is-the-exact-meaning-for-renderer-in-programming
  renderer.render(scene, camera);
}

// Resize scene based on window size
function onWindowResize() {
  let w = container.clientWidth;
  let h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);

  resolution.set(w, h);
}

// Map function to easily map values
function map(value, inputMin, inputMax, outputMin, outputMax) {
  return (
    ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) +
    outputMin
  );
}

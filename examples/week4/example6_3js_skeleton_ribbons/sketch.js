// The Body Everywhere and Here Class 4: Kinectron in three.js - skeleton basics
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here/

// This example uses the Kinectron camera joint positioning
// in three.js to draw joint poisitions

// Three.js scene variables
let camera, scene, renderer;

// Variable to hold the joints
let joints = [];

// Set global width and height
let width = window.innerWidth;
let height = window.innerHeight;

function initKinectron() {
  // Define and create an instance of kinectron
  const kinectron = new Kinectron("127.0.0.1");

  // Set kinect type
  kinectron.setKinectType("azure");

  // Connect to server application
  kinectron.makeConnection();

  // Start tracked bodies feed and set function for incoming data
  kinectron.startTrackedBodies(drawJoints);
}

function initThreeJs() {
  // Three.js renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
  camera.position.set(0, 300, 3000);
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Three.js light
  let light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 10, 100).normalize();
  scene.add(light);
}

function initSkeleton() {
  // Create cubes for joints
  for (let i = 0; i < 32; i++) {
    // Create a material
    // This gives the cube its color and look
    let material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      specular: 0x666666,
      emissive: 0xee82ee,
      shininess: 10,
      opacity: 0.8,
      transparent: true,
    });

    // This gives the cube its shape
    let geometry = new THREE.BoxBufferGeometry(30, 30, 30);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));

    // The mesh is made from the shape and the material
    // https://en.wikipedia.org/wiki/Polygon_mesh
    let mesh = new THREE.Mesh(geometry, material);

    // Create an array of joint meshes for easy manipulation
    joints.push(mesh);

    // Put the mesh in the scene
    scene.add(mesh);
  }
}

function init() {
  initKinectron();
  initThreeJs();
  initSkeleton();

  // Listen for window resize
  window.addEventListener("resize", onWindowResize, false);
}

// Runs each time we get data from kinectron
function drawJoints(data) {
  // Get the new joints
  const newJoints = data.skeleton.joints;

  // Update all the box joint positions with the incoming data
  for (let j = 0; j < joints.length; j++) {
    joints[j].position.x = newJoints[j].cameraX * -1;
    joints[j].position.y = newJoints[j].cameraY * -1;
    joints[j].position.z = newJoints[j].cameraZ * -1;
  }
}

// Resize graphics when user resizes window
function onWindowResize() {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  // Request anim frame
  // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
  requestAnimationFrame(animate);

  // Render the scene
  // https://stackoverflow.com/questions/41077723/what-is-the-exact-meaning-for-renderer-in-programming
  renderer.render(scene, camera);

  // Update the controls with each frame
  controls.update();
}

init();
animate();

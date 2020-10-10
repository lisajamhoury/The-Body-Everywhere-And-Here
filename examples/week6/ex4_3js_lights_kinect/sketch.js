let scene, camera, renderer;
let controls;
let pointLight, pointLight2;

let joints = [];

let liveData = false;

// recoded data variables
let recordedData;
let sentTime = Date.now();
let currentFrame = 0;

init();

function init() {
  if (liveData) {
    initKinectron();
    initSketch();
  } else {
    fetchJSONFile("azure_recorded_skeleton.json", getData);
  }
}

function getData(data) {
  recordedData = data;
  initSketch();
}

function initSketch() {
  initThreeJs();
  animate();
}

function loopRecordedData() {
  // send data every 20 seconds
  if (Date.now() > sentTime + 20) {
    bodyTracked(recordedData[currentFrame]);
    sentTime = Date.now();

    if (currentFrame < Object.keys(recordedData).length - 1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
  }
}

function initKinectron() {
  const kinectron = new Kinectron();
  kinectron.setKinectType("azure");
  kinectron.makeConnection();
  kinectron.startTrackedBodies(bodyTracked);
}

function bodyTracked(body) {
  const newJoints = body.skeleton.joints;

  for (let i = 0; i < joints.length; i++) {
    joints[i].position.x = (newJoints[i].cameraX * -1) / 50;
    joints[i].position.y = (newJoints[i].cameraY * -1) / 50;
    joints[i].position.z = (newJoints[i].cameraZ * -1) / 50;
  }

  // index 8 is left hand
  pointLight.position.x = joints[8].position.x;
  pointLight.position.y = joints[8].position.y;
  pointLight.position.z = joints[8].position.z;

  // index 15 is right hand
  pointLight2.position.x = joints[15].position.x;
  pointLight2.position.y = joints[15].position.y;
  pointLight2.position.z = joints[15].position.z;
}

function initThreeJs() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 10, 200);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 10, 0);
  controls.update();

  //   let ambLight = new THREE.AmbientLight(0xffffff);
  //   scene.add(ambLight);

  pointLight = new THREE.PointLight(0xffffff, 1, 100, 2);
  scene.add(pointLight);

  pointLight2 = new THREE.PointLight(0xffffff, 1, 100, 2);
  scene.add(pointLight2);

  createBox();
  createSkeleton();

  window.addEventListener("resize", resizeWindow, false);
}

function createBox() {
  let geo = new THREE.BoxBufferGeometry(90, 90, 90);

  let mat = new THREE.MeshPhongMaterial({
    color: 0x10e6b7,
    specular: 0x10e6b7,
    side: THREE.BackSide,
  });

  let mesh = new THREE.Mesh(geo, mat);

  scene.add(mesh);
}

function createSkeleton() {
  for (let i = 0; i < 32; i++) {
    let geo = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);

    let mat = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      visible: false,
    });

    let mesh = new THREE.Mesh(geo, mat);

    joints.push(mesh);
    scene.add(mesh);
  }
}

function animate() {
  if (!liveData) loopRecordedData();

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function resizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax%5C
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

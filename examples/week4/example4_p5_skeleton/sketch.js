let kinectron;

function setup() {
  // Set at kinect depth resolution
  createCanvas(640, 576);

  // Create kinectron
  const kinectron = new Kinectron("127.0.0.1");

  // Set kinect type to azure
  kinectron.setKinectType("azure");

  // Connect to server
  kinectron.makeConnection();

  // Start body tracking and set a callback for when data is received
  kinectron.startTrackedBodies(getBody);
}

function draw() {}

// Runs when data is received
function getBody(data) {
  // refresh the bg
  background(0);

  // get the joints
  let joints = data.skeleton.joints;

  noStroke();
  fill(255, 20, 255);

  // draw an ellipse for each joint
  for (let i = 0; i < joints.length; i++) {
    // depthX, depthY are numbers btw 0-1 that corresponds to the depth image
    // multiply by the width or height to map the joints to the canvas
    const xPos = joints[i].depthX * width;
    const yPos = width / 2; //joints[i].depthY * width
    ellipse(xPos, yPos, 20);
  }
}

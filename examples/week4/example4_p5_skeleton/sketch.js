let kinectron;

function setup() {
  createCanvas(640, 576);
  colorMode(HSB, 255);

  kinectron = new Kinectron("e2daf0597f03.ngrok.io");
  kinectron.setKinectType("azure");
  kinectron.makeConnection();
  kinectron.startTrackedBodies(getBody);
}

function draw() {}

function getBody(data) {
  background(255);
  let joints = data.skeleton.joints;

  for (let i = 0; i < joints.length; i++) {
    fill("red");
    ellipse(joints[i].depthX * width, width / 2, 20);
  }
}

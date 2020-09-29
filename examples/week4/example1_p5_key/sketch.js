function setup() {
  createCanvas(640, 576);
  // Create kinectron
  const kinectron = new Kinectron("127.0.0.1");

  // Set kinect type to azure
  kinectron.setKinectType("azure");

  // Connect to server
  kinectron.makeConnection();

  // Start the key feed, and set a call back for when data is recieved
  kinectron.startKey(drawKey);
}

function draw() {}

function drawKey(keyImg) {
  // load the new image
  loadImage(keyImg.src, (kImg) => {
    // draw it once its loaded
    image(kImg, 0, 0);
  });
}

let kinectron;

function setup() {
  createCanvas(640, 576);
  kinectron = new Kinectron("e2daf0597f03.ngrok.io");
  kinectron.setKinectType("azure");
  kinectron.makeConnection();
  kinectron.startDepth(drawDepth);
}

function draw() {}

function drawDepth(depthImg) {
  // background(0);
  loadImage(depthImg.src, (img) => {
    image(img, 0, 0);
  });
}

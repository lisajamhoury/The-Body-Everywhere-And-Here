function setup() {
  createCanvas(640, 576);

  // Set to hsb for nice color gradients
  colorMode(HSB, 255);

  // Create kinectron
  const kinectron = new Kinectron("127.0.0.1");

  // Set kinect type to azure
  kinectron.setKinectType("azure");

  // Connect to server
  kinectron.makeConnection();

  // Start the depth feed, and set a callback for when data is recieved
  kinectron.startDepth(drawKey);
}

function draw() {}

function drawKey(depthImg) {
  // load the depth image
  loadImage(depthImg.src, (dImg) => {
    // get pixels from depth feed
    dImg.loadPixels();
    let depthPixels = dImg.pixels;

    // go through depth pixels
    // iterate by 4 -- 4 channels per pixels
    for (let i = 0; i < depthPixels.length; i += 4) {
      // get the depth value
      // grayscale depth image is 0-255 8-bit depth
      let depthVal = depthPixels[i]; // 0-255

      // map the value between somewhere 0-1 for desired hue
      let mapVal = map(depthVal, 0, 255, 0, 0.5);

      // map the hsv value to rgb
      // rgb needed for pixel manipulation
      let newRGB = HSVtoRGB(mapVal, 1, 1);

      // change the pixels to the new colors
      depthPixels[i] = newRGB.r;
      depthPixels[i + 1] = newRGB.g;
      depthPixels[i + 2] = newRGB.b;
      depthPixels[i + 3] = 255; // not transparent
    }

    // update image
    dImg.updatePixels();

    // draw it!
    image(dImg, 0, 0);
  });
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
 */
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

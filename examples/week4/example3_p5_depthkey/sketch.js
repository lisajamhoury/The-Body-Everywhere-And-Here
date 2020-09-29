let kinectron;

function setup() {
  createCanvas(640 / 2, 576 / 2);
  // Set to hsb for nice color gradients
  colorMode(HSB, 255);

  // Create kinectron
  const kinectron = new Kinectron("127.0.0.1");

  // Set kinect type to azure
  kinectron.setKinectType("azure");

  // Connect to server
  kinectron.makeConnection();

  // Start the depth key and set a call back for when we recieve data
  kinectron.startDepthKey(drawKey);
}

function draw() {}

function drawKey(depthBuffer) {
  // Depth buffer from depth key is 16-bit depth
  // So we get an array of numbers between 0-8191
  const dBuffer = depthBuffer;

  // Load pixel array from the p5 canvas
  loadPixels();

  // Set an index to go through pixel array
  let pixelIndex = 0;

  // Go through the depth buffer values
  // iterate through depth buffer by 1
  // only 1 value per pixel
  for (let i = 0; i < depthBuffer.length; i++) {
    // get the depth value
    // 16-bit depth will be between 0-8191
    let depthVal = depthBuffer[i];

    // If there is a depth value
    if (depthVal > 0) {
      // Map it btw 0-1 for hue value
      let mapVal = map(depthVal, 0, 8000, 0, 1);

      // Get the rgb value from the hsv
      // rgb needed for pixel manipulation
      let newRGB = HSVtoRGB(mapVal, 1, 1);

      // change the canvas pixels to the new rgb color
      pixels[pixelIndex] = newRGB.r;
      pixels[pixelIndex + 1] = newRGB.g;
      pixels[pixelIndex + 2] = newRGB.b;
      pixels[pixelIndex + 3] = 255;

      // otherwise, make the pixel balck
    } else {
      pixels[pixelIndex] = 0;
      pixels[pixelIndex + 1] = 0;
      pixels[pixelIndex + 2] = 0;
      pixels[pixelIndex + 3] = 255;
    }

    // iterate through pixel array by 4
    // 4 channels per pixel // rgba
    pixelIndex += 4;
  }

  // update the canvas pixels
  updatePixels();
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

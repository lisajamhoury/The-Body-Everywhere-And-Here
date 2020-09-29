let kinectron;

function setup() {
  createCanvas(640 / 2, 576 / 2);
  colorMode(HSB, 255);

  kinectron = new Kinectron("e2daf0597f03.ngrok.io");
  kinectron.setKinectType("azure");
  kinectron.makeConnection();
  kinectron.startDepthKey(drawKey);
}

function draw() {}

function drawKey(depthBuffer) {
  const dBuffer = depthBuffer;
  loadPixels(); // gives us pixels;

  let pixelIndex = 0;

  for (let i = 0; i < depthBuffer.length; i++) {
    let depthVal = depthBuffer[i];
    if (depthVal > 0) {
      let mapVal = map(depthVal, 0, 8000, 0, 1);
      let newRGB = HSVtoRGB(mapVal, 1, 1);

      pixels[pixelIndex] = newRGB.r;
      pixels[pixelIndex + 1] = newRGB.g;
      pixels[pixelIndex + 2] = newRGB.b;
      pixels[pixelIndex + 3] = 255;
    } else {
      pixels[pixelIndex] = 0;
      pixels[pixelIndex + 1] = 0;
      pixels[pixelIndex + 2] = 0;
      pixels[pixelIndex + 3] = 255;
    }

    pixelIndex += 4;
  }

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

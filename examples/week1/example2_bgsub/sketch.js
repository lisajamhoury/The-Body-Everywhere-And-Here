// The Body Everywhere and Here Class 1: Example 2 — Background Subtraction
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here/

// This example uses the webcam in p5.js to remove the background of an
// video by finding the difference between the current webcam image
// and a background image that is set by the user

// Click "set background" button to set the background

// variable for my webcam video
let myVideo;

// threshold slider
let threshSlider;

// button to set bg
let bgButton;

// initialize to an empty array with []
// this is important so that we can copy into it later
let bgPixels = [];
let secretPixels = [];

// variable to hold cat image
let secretImage;

// preload() is a p5 function
// see p5 preload documentation if this is new to you
// https://p5js.org/reference/#/p5/preload
function preload() {
  // load my image into p5
  secretImage = loadImage("../../assets/cat.jpg");
}

function setup() {
  // create a p5 canvas at the dimensions of my webcam
  createCanvas(640, 480);

  // create a p5 webcam, then hide it
  myVideo = createCapture(VIDEO);
  myVideo.size(width, height); // see p5 documentation for width, height
  myVideo.hide(); // hide the webcam which appears below the canvas by default

  // set threshold range to 0-255
  // 255 is the maximum range for the r,g,b channels of any pixels
  threshSlider = createSlider(0, 255, 100);

  // create a button that says 'set background'
  bgButton = createButton("set background");
  // when the button is presset run setBG() function
  bgButton.mousePressed(setBG);

  // load pixels tells p5 to make the image or video pixel array available at .pixels
  // see p5 documentation https://p5js.org/reference/#/p5/loadPixels
  // see Coding Train video on pixel array https://www.youtube.com/watch?v=nMUMZ5YRxHI
  secretImage.loadPixels();
  // store my secretpixels in a global variable to use later
  secretPixels = secretImage.pixels;
}

// this save the current webcam video frame to the background pixel array
function setBG() {
  console.log("Setting the background!");

  // see above documentation on loadPixels
  myVideo.loadPixels();

  // currentPixels holds the pixel array of the current webcam image
  const currentPixels = myVideo.pixels;

  // loop through the pixel array and set each pixel in the bgPixel array to the current frame
  // here's an explanation of why we have to copy each pixel rather than just using
  // bgPixels = currentPixels
  // https://www.samanthaming.com/tidbits/35-es6-way-to-clone-an-array/#why-can-t-i-use-to-copy-an-array
  for (let i = 0; i < currentPixels.length; i++) {
    bgPixels[i] = currentPixels[i];
  }
}

// draw() is a p5 function
// see this example if this is new to you
// https://p5js.org/examples/structure-setup-and-draw.html
function draw() {
  // see above documentation on loadPixels
  myVideo.loadPixels();

  // get the current pixels from pixel array (documentation above)
  const currentPixels = myVideo.pixels;

  // get the threshold value from the slider
  // all webcams will have some natural noise that looks like "movement"
  // the threshold tells the program what level of change we consider  movement
  let threshValue = threshSlider.value();

  // go through every pixel of the video
  // y moves down from row to row
  // x moves across the row
  // think of it like a typewriter — x is typing across, y is the return to new line
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // get the current position (index) in the array
      // if this is new to you watch the coding train video referenced above
      const i = (y * width + x) * 4;

      // get the difference between the saved background frame and the current frame
      // for each channel of the image: r, g, b, channels
      const rDiff = abs(currentPixels[i + 0] - bgPixels[i + 0]);
      const gDiff = abs(currentPixels[i + 1] - bgPixels[i + 1]);
      const bDiff = abs(currentPixels[i + 2] - bgPixels[i + 2]);

      // get the average difference for the pixel from the 3 color channels
      const avgDiff = (rDiff + gDiff + bDiff) / 3; // 0-255

      /////////// This shows the cat ////////////
      // if the difference between frames is less than the threshold value
      if (avgDiff < threshValue) {
        // turn the pixel black
        currentPixels[i + 0] = 0;
        currentPixels[i + 1] = 0;
        currentPixels[i + 2] = 0;
      } else {
        // otherwise, show me the cat!
        currentPixels[i + 0] = secretPixels[i + 0];
        currentPixels[i + 1] = secretPixels[i + 1];
        currentPixels[i + 2] = secretPixels[i + 2];
      }
      /////////// End Cat  ////////////

      // /////////// This does the 'greenscreen' ////////////
      // // if the difference between frames is less than the threshold value
      // if (avgDiff < threshValue) {
      //   // turn the pixel black
      //   currentPixels[i + 0] = 0;
      //   currentPixels[i + 1] = 0;
      //   currentPixels[i + 2] = 0;
      //   // currentPixels[i + 3] = 0;
      // }
      // /////////// End Greenscreen  ////////////

      // /////////// This does the 'body paint' ////////////
      // // if the difference between frames is less than the threshold value
      // if (avgDiff < threshValue) {
      //   // turn the pixel black
      //   currentPixels[i + 0] = 0;
      //   currentPixels[i + 1] = 0;
      //   currentPixels[i + 2] = 0;
      //   currentPixels[i + 3] = 10;
      // }
      // /////////// End Bodypaint  ////////////
    }
  }

  // update pixels
  // if this is not familiar watch the coding train video referenced above
  myVideo.updatePixels();

  // flip the video image to be a mirror image of the user
  // translate to the right corner of the canvas
  translate(width, 0);
  // flip the horizontal access with -1 scale
  scale(-1, 1);

  // draw the updated video to the canvas
  image(myVideo, 0, 0, width, height);
}

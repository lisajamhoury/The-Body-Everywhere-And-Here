let poses = [];
let video;

let posePosition = null;

// for recording data
let recordButton;
let recordedData = [];
let startTime;
let recordingStarted = false;

// for playing back data
let liveData = false;
let recordedPositions;
let currentPosition = null;
let posIndex = 0;
let posTime = 0;

function preload() {
  // if no live partner, load recorded data
  if (!liveData) {
    console.log("loading json");
    recordedPositions = loadJSON("recordeddata.json");
  }
}

function setup() {
  createCanvas(640, 480);

  recordButton = createButton("Toggle Recording");
  recordButton.mousePressed(toggleRecording);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  if (liveData) {
    // Create a new poseNet method
    const poseNet = ml5.poseNet(video, modelLoaded);

    // Listen to new 'pose' events
    poseNet.on("pose", (results) => gotPose(results));
  }
}

function draw() {
  background(255);

  if (!liveData) {
    if (poses.length === 0) {
      poses = recordedPositions[posIndex].pose;
      posIndex++;
      posTime = Date.now();
    } else {
      const timeBtwRecords =
        recordedPositions[posIndex].timeStamp -
        recordedPositions[posIndex - 1].timeStamp;
      const timeElapsed = Date.now() - posTime;

      if (timeElapsed > timeBtwRecords) {
        poses = recordedPositions[posIndex].pose;
        posTime = Date.now();

        if (posIndex < Object.keys(recordedPositions).length - 1) {
          // console.log(posIndex);
          posIndex++;
        } else {
          console.log("resetting");
          posIndex = 1;
        }
      }
    }
  }

  if (poses.length === 0) {
    console.log("waiting for poses");
    return;
  }

  drawKeypoints();
  drawSkeleton();
  drawWrists();
  const topMost = getTopMostPoint();

  fill("black");
  ellipse(topMost.x, topMost.y, 20);

  push();
  scale(0.25, 0.25);
  image(video, 0, 0, width, height);
  pop();
}

function gotPose(results) {
  poses = results;

  if (recordingStarted) {
    recordData(results);
  }
}

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}

function drawKeypoints() {
  // get all of my keypoints
  const keypoints = poses[0].pose.keypoints;
  // debugger;

  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    noStroke();
    fill("red");
    ellipse(keypoint.position.x, keypoint.position.y, 15);
  }
}

function drawSkeleton() {
  const bones = poses[0].skeleton;
  for (let i = 0; i < bones.length; i++) {
    const jointA = bones[i][0].position;
    const jointB = bones[i][1].position;

    strokeWeight(5);
    stroke("green");
    line(jointA.x, jointA.y, jointB.x, jointB.y);
  }
}

function drawWrists() {
  const rightWrist = poses[0].pose.rightWrist;
  const leftWrist = poses[0].pose.leftWrist;

  rectMode(CENTER);
  noStroke();
  fill("blue");
  rect(rightWrist.x, rightWrist.y, 20);
  rect(leftWrist.x, leftWrist.y, 20);
}

function getTopMostPoint() {
  // find topmost keypoint
  let topMost = {};
  topMost.y = height;

  const keypoints = poses[0].pose.keypoints;
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i].position;

    if (keypoint.y < topMost.y) {
      topMost.x = keypoint.x;
      topMost.y = keypoint.y;
    }
  }
  return topMost;
}

function recordData(data) {
  console.log("recording data");
  let newData = {
    pose: data,
    timeStamp: Date.now(),
  };
  recordedData.push(newData);
}

function toggleRecording() {
  if (!recordingStarted) {
    recordingStarted = true;
  } else {
    downloadObjectAsJson(recordedData, "posedata");
    recordingStarted = false;
  }
}

// from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

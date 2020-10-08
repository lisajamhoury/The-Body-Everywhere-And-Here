let recordedData = [];
let recordButton;
let recordingStarted = false;

let liveData = false;
let recordedPositions;
let currentPosition = null;
let posIndex = 0;
let posTime = 0;

function preload() {
  if (!liveData) {
    recordedPositions = loadJSON("recordeddata.json");
  }
}

function setup() {
  createCanvas(400, 400);

  recordButton = createButton("toggle record");
  recordButton.mousePressed(toggleRecord);
}

function draw() {
  background(220);

  if (!liveData) {
    if (currentPosition === null) {
      currentPosition = recordedPositions[posIndex].data;
      posIndex++;
      posTime = Date.now();
    } else {
      const timeBtwRecords =
        recordedPositions[posIndex].timeStamp -
        recordedPositions[posIndex - 1].timeStamp;
      const timeElapsed = Date.now() - posTime;

      if (timeElapsed > timeBtwRecords) {
        currentPosition = recordedPositions[posIndex].data;
        posTime = Date.now();

        if (posIndex < Object.keys(recordedPositions).length - 1) {
          posIndex++;
        } else {
          console.log("resetting");
          posIndex = 1;
        }
      }
    }
  } else {
    currentPosition = { x: mouseX, y: mouseY };
  }

  if (recordingStarted) recordData(currentPosition);

  ellipse(currentPosition.x, currentPosition.y, 50);
}

function recordData(data) {
  console.log("recording");
  const newData = {
    data: data,
    timeStamp: Date.now(),
  };
  recordedData.push(newData);
}

function toggleRecord() {
  if (!recordingStarted) {
    recordingStarted = true;
  } else {
    downloadObjectAsJson(recordedData, "recordeddata");
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

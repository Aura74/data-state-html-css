var stoppVariabeln = document.getElementById("stoppId");
var gulVariabeln = document.getElementById("gulId");
var goVariabeln = document.getElementById("goId");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function goAway() {
  andraBakgrund();
  await delay(300);
  stoppVariabeln.setAttribute("data-state", "greyOne");
  gulVariabeln.setAttribute("data-state", "greyOne");
  goVariabeln.setAttribute("data-state", "go");

  for (let i = 0; i < 3; i++) {
    await delay(200);
    goVariabeln.setAttribute("data-state", "greyOne");
    await delay(200);
    goVariabeln.setAttribute("data-state", "go");
  }
}

async function stopHere() {
  andraBakgrundTillRed();
  await delay(300);
  stoppVariabeln.setAttribute("data-state", "greyOne");
  goVariabeln.setAttribute("data-state", "go");
  gulVariabeln.setAttribute("data-state", "yellow");

  await delay(500);
  goVariabeln.setAttribute("data-state", "greyOne");
  gulVariabeln.setAttribute("data-state", "yellow");
  stoppVariabeln.setAttribute("data-state", "greyOne");

  await delay(500);
  goVariabeln.setAttribute("data-state", "greyOne");
  gulVariabeln.setAttribute("data-state", "yellow");
  stoppVariabeln.setAttribute("data-state", "stop");

  await delay(300);
  gulVariabeln.setAttribute("data-state", "greyOne");
  stoppVariabeln.setAttribute("data-state", "stop");
  goVariabeln.setAttribute("data-state", "greyOne");

  andraBakgrund();
}

// async function test() {
//   console.log("start timer");
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   console.log("after 1 second");
// }

// test();

const färger = [
  "lightblue",
  "lightgreen",
  "lightcoral",
  "lightgoldenrodyellow",
  "red",
  "lightpink",
];
let färgIndex = 0;

function andraBakgrund() {
  document.body.style.backgroundColor = färger[färgIndex];
  färgIndex = (färgIndex + 1) % färger.length;
}

function andraBakgrundTillRed() {
  document.body.style.backgroundColor = "red";
}

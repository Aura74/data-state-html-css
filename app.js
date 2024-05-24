var stoppVariabeln = document.getElementById("stoppId");
var gulVariabeln = document.getElementById("gulId");
var goVariabeln = document.getElementById("goId");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function goAway() {
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
}

// async function test() {
//   console.log("start timer");
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   console.log("after 1 second");
// }

// test();

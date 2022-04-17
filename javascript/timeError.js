"use strict";
let startTime = 0;
let endTime = 0;
let timeError = 0;
startMusic.addEventListener('ended', () => {
  endTime = Date.now();
  timeError = endTime - startTime;
  console.log(startMusic.duration, timeError);
});

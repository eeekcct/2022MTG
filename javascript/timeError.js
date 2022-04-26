"use strict";
let startTime = 0;
let endTime = 0;
let timeError = 0;
startMusic.addEventListener('play', () => {
  pushData('playSign','');
});
startMusic.addEventListener('ended', () => {
  pushData('endSign', '');
  window.setTimeout(() => {
    playMusic.play();
  },1000)
  // playMusic.play();
});

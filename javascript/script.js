"use strict";

const startBtn = document.getElementById('startBtn');
const form = document.getElementById('form');
const exp = document.getElementById('exp');
const play = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const answerForm = document.getElementById('answerForm');
const showAnswerBtn = document.getElementById('showAnswerBtn');

const startMusic = new Audio('mp3/start.mp3');
const columns = ['userName','sentence','value','sentenceStartTime'];
const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
let volume = 0.5;
let playList = [];
let expData = [];
let userName;
let sentenceStartTime;
let value;
let sentenceNumber;
let effect;
let playCondition;

window.onload = () => {
  nameReset();
  setPlayWaitTime(playWaitTime.value);
  setShowAnswerTime(showAnswerTime.value);
  setQuestionNumber(questionNumber.value);
  changeAnswerCondition(showAnswer1.checked);
};

Array.prototype.shuffle = function() {
  let i = this.length;
  while(i){
    const j = Math.floor(Math.random()*i);
    const t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
}

startBtn.addEventListener('click', () => {
  document.body.requestFullscreen();
  expData = [];
  expData.push([]);
  columns.forEach(c => {
    expData[0].push(c);
  });
  playList = [];
  let i = questionNumber.value;
  while (i > 0) {
    playList.push(i--);
  }
  playList.shuffle();
  console.log(playList);
  //expData.push(columns);
  form.style.display = 'none';
  exp.style.display = 'block';
  userName = document.getElementById('userName').value;
  formReset(); 

  for (const e of document.getElementsByName('effect')) {
    if (e.checked) {
      switch (e.value) {
        case 'spin':
        case 'load':
          effect = new Effect(e.value);
          break;
        case 'breath':
        case 'pulse':
          effect = new EffectClass(e.value);
          break;
      }
    }
  }
  if (document.getElementById('showAnswer2').checked === true) {
    playCondition = new DefaultShowAnswer();
  }
  else if (document.getElementById('moveAnswer1').checked === true) {
    playCondition = new PlayAfterAuto();
  }
  else {
    playCondition = new PlayAfterManual();
  }
});

play.addEventListener('click', () => {
  if(play.classList.contains('play') === true){
    return;
  }
  startTime = Date.now();
  effect.start();
  play.classList.add('play');
  sentenceNumber = playList.pop();
  const musicName = 'mp3/'+ sentenceNumber + 'ban.mp3';
  const playMusic = new Audio(musicName);
  playMusic.volume = 0.7 * volume;
  startMusic.volume = 0.4 * volume;
  playMusic.addEventListener('ended', () => {
    playCondition.playEnd();
  });
  // playMusic.addEventListener('ended', () => {
  //   play.style.display = 'none';
  //   play.classList.remove('play');
  //   effect.end();
  //   answerForm.style.display = 'block';
  // });
  window.setTimeout(() => {
    startMusic.play();
    window.setTimeout(() => {
      sentenceStartTime = Date.now();
      playMusic.play();
    }, 1000);
  },playWaitTime.value*1000);
});

nextBtn.addEventListener('click',()=>{
  const answers = document.getElementsByName('answer');
  let flag = false;
  for(let i in answers){
    if(answers[i].checked === true){
      flag = true;
      value = answers[i].value;
    }
  }
  if(flag === true){
    playCondition.nextAnswer();
    expData.push([userName,sentenceNumber,value,sentenceStartTime]);
    formReset(); 
    if(playList.length == 0){
      playCondition.endExp();
      document.exitFullscreen();
      console.log(expData);
      exp.style.display = 'none';
      form.style.display = 'block';
      makeResultFile();
      nameReset();
    }
  }
});

function formReset(){
  const forms = document.getElementsByName('answer');
  for (const i of forms){
    i.checked = false;
  }
}

function makeResultFile(){
  let csvData = '';
  expData.forEach( e =>{
    e[e.length-1] += '\n';
    csvData += e.join(',');
  });
  const blob = new Blob([bom,csvData],{type:'text/csv'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = userName+'.csv';
  link.click();
}

function nameReset(){
  document.querySelector('input[type="text"]').value = '';
}

class PlayAfterAuto {
  constructor() {
    this.showAnswerTime = showAnswerTime.value;
  }
  playEnd() {
    effect.end();
    window.setTimeout(() => {
      play.style.display = 'none';
      play.classList.remove('play');
      answerForm.style.display = 'block';
    },this.showAnswerTime * 1000);
  }
  nextAnswer() {
    answerForm.style.display = 'none';
    play.style.display = 'block';
  }
  endExp() {
  }
}
class PlayAfterManual {
  constructor() {
    this.showAnswerTime = showAnswerTime.value;
    showAnswerBtn.addEventListener('click', () => {
      play.classList.remove('play');
      play.style.display = 'none';
      showAnswerBtn.style.display = 'none';
      answerForm.style.display = 'block';
    });
  }
  playEnd() {
    effect.end();
    window.setTimeout(() => {
      showAnswerBtn.style.display = 'block';
    },this.moveAnswerTime * 1000);
  }
  nextAnswer() {
    answerForm.style.display = 'none';
    play.style.display = 'block';
  }
  endExp() {
  }
}
class DefaultShowAnswer{
  constructor() {
    answerForm.style.display = 'block';
    answerForm.style.left = '75%';
    play.style.left = '25%';
    answerForm.classList.add('notSelect');
  }
  playEnd() {
    effect.end();
    play.classList.remove('play');
    play.classList.add('notSelect');
    answerForm.classList.remove('notSelect');
  }
  nextAnswer() {
    play.classList.remove('notSelect');
    answerForm.classList.add('notSelect');
  }
  endExp() {
    answerForm.style.left = '50%';
    play.style.left = '50%';
    answerForm.style.display = 'none';
    answerForm.classList.remove('notSelect');
  }
}

class Effect{
  constructor(id) {
    this.element = document.getElementById(id);
    this.id = id;
  }
  start() {
    this.element.style.display = 'inline-block';
    if (this.id === 'load') {
      play.classList.add('inPlay');
    }
  }
  end() {
    this.element.style.display = 'none';
    if (this.id === 'load') {
      play.classList.remove('inPlay');
    }
  }
}
class EffectClass{
  constructor(className) {
    this.className = className;
  }
  start() {
    play.classList.add(this.className);
  }
  end() {
    play.classList.remove(this.className);
  }
}
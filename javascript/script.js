"use strict";

const startBtn = document.getElementById('startBtn');
const form = document.getElementById('form');
const exp = document.getElementById('exp');
const play = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const answerForm = document.getElementById('answerForm');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const gazePoint = document.getElementById('gazePoint');
const expStart = document.getElementById('expStartBtn');

const startMusic = new Audio('audio/start.wav');
const columns = ['index','userName','sentence','event','value','computerTimeStamp'];
const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
let volume = 0.2;
let playList = [];
let expData = [];
let userName='';
let value='';
let sentenceNumber='';
let effect;
let playCondition;
let playMusic;
let dir;

window.onload = () => {
  nameReset();
  setPlayWaitTime(playWaitTime.value);
  setShowAnswerTime(showAnswerTime.value);
  setQuestionNumber(questionNumber.value);
  changeAnswerCondition(showAnswer1.checked);
  expSound.forEach((e) => {
    if (e.checked) changeMaxQuestionNumber(e.value);
  });
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
    if (dir == 'silence') {
      playList.push(0);
      i--;
    }
    else {
      playList.push(i--);
    }
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
        case 'playback':
          effect = new Effect(e.value);
          break;
        case 'breath':
        case 'pulse':
          effect = new EffectClass(e.value);
          break;
      }
    }
  }
  gazePoint.style.display = 'none';
  answerForm.style.display = 'none';
  play.style.display = 'none';
  expStart.style.display = 'block';
});
expStart.addEventListener('click', (e) => {
  const expStartTime = Date.now();
  expData.push([userName,'','startExp','',expStartTime]);
  e.target.style.display = 'none';
  showGazePoint();
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
  sentenceNumber = playList.pop();
  pushData('clickPlayStart', '');

  effect.start();
  document.body.classList.add('hideCursor');
  play.classList.add('play');
  const musicName = 'audio/'+dir+'/'+sentenceNumber+'.wav';

  playMusic = new Audio(musicName);
  playMusic.volume = soundValue[dir] * volume;
  startMusic.volume = 0.4 * volume;
  playMusic.addEventListener('play', () => {
    pushData('playSentence', '');
  });
  playMusic.addEventListener('ended', () => {
    pushData('endSentence', '');
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
    // window.setTimeout(() => {
    //   playMusic.play();
    // }, 1000);
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
    // expData.push([userName,sentenceNumber,value,sentenceStartTime]);
    pushData('answer', value);
    sentenceNumber = '';
    formReset(); 
    if(playList.length == 0){
      pushData('endExp', '');
      playCondition.endExp();
      document.exitFullscreen();
      console.log(expData);
      exp.style.display = 'none';
      form.style.display = 'block';
      makeResultFile();
      nameReset();
    }
    else {
      playCondition.nextAnswer();
    }
  }
});

function showGazePoint(){
  pushData('showGazePoint', '');
  answerForm.style.display = 'none';
  play.style.display = 'none';
  gazePoint.style.display = 'block';
  document.body.classList.add('hideCursor');
  window.setTimeout(()=>{
    document.body.classList.remove('hideCursor');
    gazePoint.style.display = 'none';
    play.style.display = 'block';
  },2000);
}

function formReset(){
  const forms = document.getElementsByName('answer');
  for (const i of forms){
    i.checked = false;
  }
}

function makeResultFile(){
  let csvData = '';
  expData.forEach( (e,i) =>{
    if (i != expData.length - 1) {
      e[e.length-1] += `\n${i}`;
    }
    else {
      e[e.length-1] += '\n';
    }
    // csvData += e.join(',');
  });
  // const blob = new Blob([bom,csvData],{type:'text/csv'});
  const blob = new Blob([bom,expData],{type:'text/csv'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = userName+'.csv';
  link.click();
}

function nameReset(){
  document.querySelector('input[type="text"]').value = '';
}

function pushData(event,value) {
  const timeStamp = Date.now();
  expData.push([userName,sentenceNumber,event,value,timeStamp]);
}

class PlayAfterAuto {
  constructor() {
    this.showAnswerTime = showAnswerTime.value;
  }
  playEnd() {
    window.setTimeout(() => {
      effect.end();
      play.style.display = 'none';
      play.classList.remove('play');
      answerForm.style.display = 'block';
      pushData('showAnswer', '');
      document.body.classList.remove('hideCursor');
    },this.showAnswerTime * 1000);
  }
  nextAnswer() {
    // answerForm.style.display = 'none';
    // play.style.display = 'block';
    showGazePoint();
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
    window.setTimeout(() => {
      effect.end();
      showAnswerBtn.style.display = 'block';
      pushData('showAnswer', '');
      document.body.classList.remove('hideCursor');
    },this.moveAnswerTime * 1000);
  }
  nextAnswer() {
    // answerForm.style.display = 'none';
    // play.style.display = 'block';
    showGazePoint();
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
    document.body.classList.remove('hideCursor');
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
    if (this.id != 'spin') {
      play.classList.add('inPlay');
    }
  }
  end() {
    this.element.style.display = 'none';
    if (this.id != 'spin') {
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
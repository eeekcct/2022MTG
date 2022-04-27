"use strict";

const playWaitTime = document.getElementById("playWaitTime");
const showAnswerTime = document.getElementById("showAnswerTime");
const questionNumber= document.getElementById("questionNumber");
const showAnswer1 = document.getElementById("showAnswer1");
const showAnswer2 = document.getElementById("showAnswer2");
const expSound = document.getElementsByName("expSound")

const soundValue = {
  'start':2.0,
  'practice': 2.5,
  'production': 5.0,
  'silence': 0.0,
};

playWaitTime.addEventListener('input', (e) => {
  setPlayWaitTime(e.target.value);
});
showAnswerTime.addEventListener('input', (e) => {
  setShowAnswerTime(e.target.value);
});
questionNumber.addEventListener('input', (e) => {
  setQuestionNumber(e.target.value);
});
showAnswer1.addEventListener('input', (e) => {
  changeAnswerCondition(e.target.checked);
});
showAnswer2.addEventListener('input', (e) => {
  document.getElementById('answerCondition').style.display='none';
});
expSound.forEach((e, i) => {
  e.addEventListener('input', (e) => {
    changeMaxQuestionNumber(e.target.value);
  });
});

function setPlayWaitTime(val){
  document.getElementById('playWaitTimeText').textContent = val+'秒後';
}
function setShowAnswerTime(val){
  document.getElementById('showAnswerTimeText').textContent = val+'秒後';
}
function setQuestionNumber(val){
  document.getElementById('questionNumberText').textContent = val+'つ';
}
function changeAnswerCondition(val) {
  if (val === true) {
    document.getElementById('answerCondition').style.display='block';
  }
  else {
    document.getElementById('answerCondition').style.display='none';
  }
}
function changeMaxQuestionNumber(val) {
    dir = val;
    if (val == 'practice') {
      questionNumber.max = 3;
      setQuestionNumber(questionNumber.value);
    }
    else {
      questionNumber.max = 9;
      setQuestionNumber(questionNumber.value);
    }
}
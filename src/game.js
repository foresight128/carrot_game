'use strict';
import {Field, ItemType } from './field.js';
import * as sound from './sound.js';

export const Reason = Object.freeze({
  win:'win',
  lose:'lose',
  cancel:'cancel',
});

//Builder Pattern
export class Gamebuilder{
  withGameDuration(duration){
    this.gameDuration = duration;
    return this;
  }

  withCarrotCount(num){
    this.carrotCount = num;
    return this;
  }

  withBugCound(num){
    this.bugCound = num;
    return this;
  }

  build(){
    return new Game(
      this.gameDuration, 
      this.carrotCount,
      this.bugCound
    );
  }
}

class Game{
  constructor(gameDuration, carrotCount, bugCount){
    this.gameDuration = gameDuration;
    this.carrotCount = carrotCount;
    this.bugCount = bugCount;

    this.gameTimer = document.querySelector('.game__timer');
    this.gameScore = document.querySelector('.game__score');
    this.gameBtn = document.querySelector('.game__button');
    this.gameBtn.addEventListener('click', () => {
      if(this.started){
        this.stop(Reason.cancel);
      }else{
        this.start();
      }
    });

    this.gameField = new Field(carrotCount, bugCount);
    this.gameField.setClickListener(this.onItemClick);

    this.started = false;
    this.score = 0;
    this.timer = undefined;
  }

  onItemClick = (item) => {
    if(!this.started){
      return;
    }
    if(item === ItemType.carrot){
      this.score++;
      this.updateScoreBoard();
      if(this.score === this.carrotCount){
        this.stop(Reason.win);
      }
    } else if(item === ItemType.bug){
      this.stop(Reason.lose);
    }
  };

  showStopButton(){
    const icon = this.gameBtn.querySelector('.fas');
    icon.classList.add('fa-stop');
    icon.classList.remove('fa-play');
    this.gameBtn.style.visibility = 'visible';
  }
  
  hideGameButton(){
    this.gameBtn.style.visibility = 'hidden';
  }
  
  showTimerAndScore(){
    this.gameTimer.style.visibility = 'visible';
    this.gameScore.style.visibility = 'visible';
  }
  
  startGameTimer(){
    let remainingTimeSec = this.gameDuration;
    this.updateTimerText(remainingTimeSec);
    this.timer = setInterval(() => {
      if(remainingTimeSec <= 0){
        clearInterval(this.timer);
        this.stop(this.carrotCount === this.score ? Reason.win : Reason.lose);
        return;
      }
      this.updateTimerText(--remainingTimeSec);
    }, 1000);
  }
  
  stopGameTimer(){
    clearInterval(this.timer);
  }
  
  updateTimerText(time){
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    this.gameTimer.innerText = `${minutes}:${seconds}`;
  }
  
  initGame(){
    this.score = 0;
    this.gameScore.innerText = this.carrotCount;
    this.gameField.init();
  }
  
  updateScoreBoard(){
    this.gameScore.innerText = this.carrotCount - this.score;
  }
  
  start(){
    this.started = true;
    this.initGame();
    this.showStopButton();
    this.showTimerAndScore();
    this.startGameTimer();
    sound.playBackground();
  }

  setGameStopListener(onGameStop){
    this.onGameStop = onGameStop;
  }

  stop(reason){
    this.started = false;
    this.stopGameTimer();
    this.hideGameButton();
    sound.stopBackground();
    this.onGameStop && this.onGameStop(reason);
  }
}
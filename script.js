class AudioController {
    constructor() {
        this.bgMusic = new Audio('/assets/Audio/backgroundsound.wav');
        this.flipSound = new Audio('/assets/Audio/flip.wav');
        this.matchSound = new Audio('/assets/Audio/match.wav');
        this.victorySound = new Audio('/assets/Audio/victory.wav');
        this.gameOverSound = new Audio('/assets/Audio/gameover.wav');
        this.bgMusic.volume = 0.1;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip() {
        this.flipSound.volume = 0.2;
        this.flipSound.play();
    }

    match() {
        this.matchSound.play();
    }

    victory() {
        this.stopMusic();
        this.victorySound.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class Memory {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('timer');
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame() {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards();
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500);

        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    flipCard(card) {
        if (this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible'); // adds the visible class to the html element

            if(this.cardToCheck) {
                // check for match
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }

    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck)) {
            this.cardMatch(card, this.cardToCheck);
        } else {
            this.cardMisMatch(card, this.cardToCheck);
        }

        this.cardToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length) {
            this.victory();
        }
    }

    cardMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }

    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000); // >> calls this every 1000ms (= 1 second)
    }

    gameOver()  {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }

    victory() {
        clearInterval(this.countdown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
    }

    shuffleCards() {
        // use the Fisher-Yates-Shuffle algorithm
        for(let i = this.cardsArray.length - 1; i > 0; i--) {
            // Math.random creates a random float (between 0 and <1)
            // i starts at the highest index of the array
            // add 1 to the current index and multiply it with the random float
            // Math.floor rounds the product of this multiplication to the next lower integer
            let randIndex = Math.floor(Math.random() * (i+1));
            // shuffle cards by changing their grid order
            // get the card which is at the index-position we just randomly picked and swap it with the card which sits on the index-position i
            // (.style to make change in css and .order is the property to be used in css)
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex;
        }
    }

    canFlipCard(card) { // check if flipping a card is allowed
        // if this.busy is false AND clicked card is not already matched AND clicked card is not already flipped >> return true (=> flipping is allowed)
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text')); // creates an array from the HTML collection, which itself is not an array
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new Memory(100, cards);
    
    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => { 
            overlay.classList.remove('visible'); // for each item in the array "overlays" applies: when clicked on, remove the class "visible"
            game.startGame();
        });
    });

    // for each card applies: when clicked >> flip and show front
    cards.forEach(card => {
        card.addEventListener('click', () => {
        game.flipCard(card);
        });
    });
}

if(document.readyState === 'loading') { // check if document is still loading
    document.addEventListener('DOMContentLoaded', ready()) // once the document has loaded >> call ready()
} else {
    ready(); // if document is already fully loaded >> call ready()
}
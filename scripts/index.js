// DICE ROLL ---
// Check if dice input values are valid
function checkDice() {
  let diceCount = document.getElementById("dice-count");
  let sidesCount = document.getElementById("sides-count");
  
  if(diceCount.value < 1)
    diceCount.value = 1;
  if(sidesCount.value < 2)
    sidesCount.value = 6;
}

// Rolls sets of dice, returning values and total
function rollDice() {
	let diceCount = document.getElementById("dice-count");
	let sidesCount = document.getElementById("sides-count");
	let output = document.getElementById("dice-result");   
	let stack = [];
	let sum = 0;

  if(diceCount.value == 1) {
    output.innerHTML = "<p>" + (Math.floor(Math.random() * sidesCount.value) + 1) + "</p>";
  }
  else {
    output.innerHTML = "";
    for(let c = 0; c < diceCount.value; c++) {
      output.innerHTML += "<p>" + (stack[c] = Math.floor(Math.random() * sidesCount.value) + 1) + "</p>";
      if(c < diceCount.value - 1) {
        output.innerHTML += "<p>";
      }
    }
  }
	if(diceCount.value > 1) {
		for(let j = 0; j < diceCount.value; j++) {
			sum += stack[j];
		}
		output.innerHTML += "<br> Total: " + sum;
	}
}

// CARD PICKER ---
// Converts face cards from numbers to text
function convertFace(n) {
		switch(n) {
			case 1 :
				return "A";
			case 11:
				return "J";
			case 12:
				return "Q";
			case 13:
				return "K";
			default:
				return n;
		}
}
// Converts suits from numbers to text
function convertSuit(n) {
		switch(n) {
			case 0:
				return "&spades;";
			case 1:
				return "&clubs;";
			case 2:
				return "&diams;";
			case 3:
				return "&hearts;";
		}
}
// Checks if number of cards exceeds maximum available in decks
function checkCards() {
	let cardCount = document.getElementById("card-count");
	let deckCount = document.getElementById("deck-count");

  if(cardCount.value < 1)
    cardCount.value = 1;
  if(deckCount.value < 1)
    deckCount.value = 1;
	if(cardCount.value > deckCount.value * 52)
		cardCount.value = deckCount.value * 52;
}
// Draws cards randomly from 52-card deck(s)
function drawCards() {
	let cardCount = document.getElementById("card-count");
	let deckCount = document.getElementById("deck-count");
	let output = document.getElementById("card-result");
	let deckCollection = [];
	let card = [];
	let number = 1;

	// Shuffle a deck using Fisher-Yates (Knuth) Shuffle
	function shuffle(array) {
		let currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		
		return array;
	}

	// Generate deck(s)
	function generateDecks() {
		let deck = [];
		for(let n = 1; n < 14; n++) {
			for(let s = 0; s < 4; s++) {
				let newCard = [n, s];
				deck.push(newCard);
			}
		}
		for(let i = 0; i < deckCount.value; i++) {
			let shuffledDeck = [];
			shuffledDeck = shuffle(deck).slice();
			deckCollection.push(shuffledDeck);
		}
	}
	
	// Main of drawCards()
	generateDecks();
	if(deckCollection.length == 0) {
		console.log("Error: Deck not found");
		return;
  }
  output.innerHTML = "";
	for(let i = 0; i < cardCount.value; i++) {
		do {
			number = Math.floor(Math.random() * deckCount.value);
		} while(deckCollection[number].length == 0);
    card = deckCollection[number].pop();
    if(card[1] < 2)
      output.innerHTML += "<p>" + (convertFace(card[0]) + convertSuit(card[1])) + "</p>";
    else 
      output.innerHTML += "<p style='color:#f00'>" + (convertFace(card[0]) + convertSuit(card[1])) + "</p>";
		if(i < cardCount.value - 1)
			output.innerHTML += "<p>";
  }
}

// ROULETTE WHEEL ---
// Check if roulette wheel input values are valid
function checkWheel() {
  let spinCount = document.getElementById("spin-count");
  let zeroCount = document.getElementById("zero-count");

  if(spinCount.value < 1)
    spinCount.value = 1;
  if(zeroCount.value < 1)
    zeroCount.value = 1;
  else if(zeroCount.value > 3)
    zeroCount.value = 3;
}
// Spins random numbers between 0 and 36; 37 = 00, 38 = 000
function spinWheel() {
  let spinCount = document.getElementById("spin-count");
  let zeroCount = document.getElementById("zero-count");
  let output = document.getElementById("wheel-result");

  output.innerHTML = "";
  for(let s = 0; s < spinCount.value; s++) {
    let result = 0;
    
    if(zeroCount.value < 2) 
      result = Math.floor(Math.random() * 37);
    else if(zeroCount.value < 3)
      result = Math.floor(Math.random() * 38);
    else
      result = Math.floor(Math.random() * 39);

    if(result < 1 || result > 36) {
      let newResult = "0";
      if(result > 37) {
        newResult = "000";
      }
      else if(result > 36) {
        newResult = "00";
      }
      output.innerHTML += "<p style='background-color:#090'>" + newResult + "</p>";
    }
    else if((result > 0 && result < 11) || (result > 18 && result < 29)) {
      if (result % 2 > 0)
        output.innerHTML += "<p style='background-color:#c00'>" + result + "</p>";
      else
        output.innerHTML += "<p style='background-color:#333'>" + result + "</p>";
    }
    else if((result > 10 && result < 19) || (result > 28 && result < 37)) {
      if (result % 2 > 0)
        output.innerHTML += "<p style='background-color:#333'>" + result + "</p>";
      else
        output.innerHTML += "<p style='background-color:#c00'>" + result + "</p>";
    }
  }
}

// SLOT MACHINE ---
// Check if slot machine input values are valid
function checkSlots() {
  let rowCount = document.getElementById("row-count");
  let colCount = document.getElementById("col-count");

  if(rowCount.value < 1)
    rowCount.value = 1;
  else if(rowCount.value > 22)
    rowCount.value = 22;
  if(colCount.value < 1)
    colCount.value = 1;
  else if(colCount.value > 7)
    colCount.value = 7;
}
// Spins 22-stop slot machine and displays rows and columns specified by input
function spinSlots() {
  let rowCount = document.getElementById("row-count");
  let colCount = document.getElementById("col-count");
  let output = document.getElementById("slots-result");
  let reels = [];

  output.innerHTML = "";
  for(let r = 0; r < rowCount.value; r++) {
    outputString = "<table id='slot-table'><tr>";
    for(let c = 0; c < colCount.value; c++) {
      let stopNumber = Math.floor(Math.random() * 22);
      while(checkReel(stopNumber, reels, c)) {
        stopNumber = Math.floor(Math.random() * 22);
      }
      try {
        reels[c].push(stopNumber);
      }
      catch {
        reels.push([stopNumber]);
      }
      let stopString = stopNumber.toString();
      if(stopNumber > 9) {
        stopString = String.fromCharCode(stopNumber + 55);
      }
      outputString += "<td style='background-color:" + slotColor(stopNumber) + ";width:" + 100/colCount.value + "%'>" + stopString + "</td>";
    }
    outputString += "</tr></table>"
    output.innerHTML += outputString;
  }
}
// Color backgrounds of stops differently depending on number
function slotColor(stop) {
  if(stop > 15) 
    return "#790";
  else if(stop > 9)
    return "#780";
  else if(stop > 7)
    return "#770";
  else if(stop < 7)
    return "#760";
  else
    return "#070";
}
// True if stop already exists on reel, false if not
function checkReel(stop, reel, index) {
  if(reel[index]) {
    for(let s = 0; s < reel[index].length; s++) {
      if(stop == reel[index][s])
        return true;
    }
    return false;
  }
}
// Vincent Nguyen 2018-2019
const MAXCARDSHELD = 11
let deck_collection = []
let deck = []
let player_hand = []
let split_hand  = []
let dealer_hand = []
let balance = 2500
let player_bet = split_bet = 0
let player_turn = true
let player_stand = split_stand = false

function updateTheme(theme) {
    if(theme == "light") {
        $('input[value = "light"]').prop('checked', true)
        $('body').css('background-color', '#fff')
        $('body').css('color', '#000')
        $('#action-bar').css('background-color', '#ccf')
        $('.menu-content').css('background-color', '#ddd')
        $('.container').css('background-color', '#ddd')
        $('.card-box-cards').css('background-color', '#cfd')
        $('.card-box-info').css('background-color', '#ccf')
        $('.win-banner').css('background-color', '#afa')
        $('.bust-banner').css('background-color', '#faa')
    }
    else {
        $('input[value = "dark"]').prop('checked', true)
        $('body').css('background-color', '#212121')
        $('body').css('color', '#fff')
        $('#action-bar').css('background-color', '#449')
        $('.menu-content').css('background-color', '#444')
        $('.container').css('background-color', '#444')
        $('.card-box-cards').css('background-color', '#495')
        $('.card-box-info').css('background-color', '#449')
        $('.win-banner').css('background-color', '#0a0')
        $('.bust-banner').css('background-color', '#a00')
    }
}
// Updates game rules
function updateSettings(type) {
    if(type == "decks") {
        let count = document.querySelector('input[name = "decks"]')
        let deckCount = parseInt(count.value)

        if(deckCount < 1)
            count.value = 1
        else if(deckCount > 8)
            count.value = 8
    }
    // Change theme
    else if(type == "theme") {
        let theme  = $('input[name = "theme"]:checked').val()
        updateTheme(theme)
        setThemeCookie(theme)
    }
    else if(type == "buttons") {
        let btnPref = $('input[name = "buttons"]:checked').val()
        updateButtons(btnPref)
        setButtonsCookie(btnPref)
    }
}
function whichTurn() {
    if(player_turn && !player_stand) {
        document.getElementById("game-info").innerHTML = "Your Turn"
        return player_hand
    }
    else if(split_hand.length > 0 && !split_stand) {
        document.getElementById("game-info").innerHTML = "Split Hand's Turn"
        return split_hand
    }
    else {
        document.getElementById("game-info").innerHTML = "Dealer's Turn"
        return dealer_hand
    }
}
function actionCheck() {
    let player = whichTurn()

    disableActions()
    document.getElementById("stand").disabled = false
    if(player_hand.length == 2 && split_hand.length == 0) {
        document.getElementById("surrender").disabled = false
        if((player_hand[0][0] == player_hand[1][0]) || (player_hand[0][0] > 9 && player_hand[1][0] > 9) && player_bet < balance)
            document.getElementById("split").disabled = false
    }
    if((!player_stand && player_hand.length < MAXCARDSHELD) || (!split_stand && split_hand.length < MAXCARDSHELD))
        document.getElementById("hit").disabled = false
    if((player_turn && player_bet <= balance) || (!player_turn && split_bet <= balance))
        document.getElementById("double-down").disabled = false
    if((handTotal(player_hand) == 21 && player_turn)|| (handTotal(split_hand) == 21 && !player_turn))
        actionStand()
}
function payout(bet, multiplier) {
    let increase = bet * multiplier
    let i = 0

    function incrementBalance() {
        if(i < increase) {
            i += increase/100
            balance += increase/100
            updateText()
            setTimeout(incrementBalance, 2)
        }
        else
            clearIncrement()
    }
    function clearIncrement() {
        balance = Math.floor(balance * 100)/100
        player_bet = split_bet = 0
        setBalance()
        updateDisplay()
    }
    incrementBalance()
}
function resolveWinner() {
    document.getElementById("game-info").innerHTML = "Game complete."
    if(handTotal(dealer_hand) > handTotal(player_hand)) {
        document.getElementById("dealer-win").style.display = "inline"
        player_bet = 0
    }
    else if(handTotal(dealer_hand) < handTotal(player_hand)) {
        document.getElementById("player-win").style.display = "inline"
        payout(player_bet, 1.5)
    }
    else {
        if(handTotal(player_hand) == 21 && dealer_hand.length > 2) {
            document.getElementById("player-win").style.display = "inline";
            payout(player_bet, 1.5)
        }
        else if(handTotal(player_hand) > 0) {
            payout(player_bet, 1)
            document.getElementById("game-info").innerHTML = "Your hand tied with dealer. <br> Bet returned to balance."
        }
    }
    if(split_hand.length > 0) {
        if(handTotal(dealer_hand) > handTotal(split_hand)) {
            document.getElementById("dealer-win").style.display = "inline"
            split_bet = 0
        }
        else if(handTotal(dealer_hand) < handTotal(split_hand)) {
            document.getElementById("split-win").style.display = "inline"
            payout(split_bet, 1.5)
        }
        else {
            if(handTotal(split_hand) == 21 && dealer_hand.length > 2) {
                document.getElementById("split-win").style.display = "inline"
                payout(split_bet, 1.5)
            }
            else if(handTotal(split_hand) > 0) {
                payout(split_bet, 1)
                document.getElementById("game-info").innerHTML = "Split hand tied with dealer. <br> Bet returned to balance."
            }
        }
    }
    updateDisplay()
    disableActions()
    document.getElementById("deal").disabled = false
}
function actionHit() {
    let player = whichTurn()
    let deckCount = document.getElementById("deck-count")
    let r = Math.floor(Math.random() * deckCount.value)

    if(player == player_hand)
        player_hand.push(deck_collection[r].pop())
    else if(player == split_hand)
        split_hand.push(deck_collection[r].pop())
    else
        dealer_hand.push(deck_collection[r].pop())
    if(handTotal(player) == -1) {
        if(player == player_hand) {
            document.getElementById("player-bust").style.display = "inline"
            player_stand = true
            if(split_hand.length == 0) {
                resolveWinner()
                return
            }
            else {
                player_turn = false
                actionCheck()
            }
        }
        else if(player == split_hand) {
            document.getElementById("split-bust").style.display = "inline"
            split_stand = true
            if(player_stand || handTotal(player_hand) < 0)
                resolveWinner()
            else {
                player_turn = true
                actionCheck()
            }
        }
        else {
            document.getElementById("dealer-bust").style.display = "inline"
            return
        }
    }
    else
        actionCheck()
    updateDisplay()
}
// Stand on current cards
function actionStand() {
    let player = whichTurn()

    disableActions()
    if(player == player_hand) {
        if(handTotal(player_hand) < 0)
            return
        player_stand = true
        player_turn = false
        if(split_hand.length == 0 || split_stand) {
            let dealerTotal = handTotal(dealer_hand)
            while(dealerTotal > 0 && dealerTotal < 17) {
                actionHit()
                dealerTotal = handTotal(dealer_hand)
            }
            resolveWinner()
            return
        }
    }
    else {
        if(handTotal(split_hand) < 0)
            return
        split_stand = true
        if(player_stand) {
            let dealerTotal = handTotal(dealer_hand)
            while(dealerTotal > 0 && dealerTotal < 17) {
                actionHit()
                dealerTotal = handTotal(dealer_hand)
            }
            resolveWinner()
            return
        }
        else
            player_turn = true
    }
    updateDisplay()
    actionCheck()
}
// Double bet and draw one more card
function actionDoubleDown() {
    balance -= player_bet
    player_bet *= 2
    actionHit()
    actionStand()
}
// Split initial hand if values are the same
function actionSplit() {
    let deckCount = document.getElementById("deck-count")
    let r = Math.floor(Math.random() * deckCount.value)
    split_hand.push(player_hand.pop())
    player_hand.push(deck_collection[r].pop())
    split_hand.push(deck_collection[r].pop())
    split_bet = player_bet
    balance -= split_bet
    updateDisplay()
    actionCheck()
}
// Surrender half the bet to end the game (initial hand)
function actionSurrender() {
    balance += player_bet/2
    balance = Math.floor(balance*100)/100
    player_bet = 0
    setBalance()
    disableActions()
    updateText()
    document.getElementById("deal").disabled = false
    document.getElementById("game-info").innerHTML = "You surrendered. <br> Half your bet was returned."
}
// Create and shuffle decks
function generateDecks () {
    let deckCount = document.getElementById("deck-count")

    // Shuffle a deck using Fisher-Yates (Knuth) Shuffle
    function shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
        }
        
        return array
    }
    // Create a standard deck
    deck = []
    for(let num = 1; num < 14; num++)
        for(let suit = 0; suit < 4; suit++) {
            let card = [num, suit]
            deck.push(card)
        }
    deck_collection = []
    // Shuffle decks and add to collection
    for(let i = 0; i < deckCount.value; i++) {
        let shuffledDeck = shuffle(deck.slice())
        deck_collection.push(shuffledDeck)
    }
}
// Deal two cards to the player and one to the dealer
function dealCards() {
    let deckCount = document.getElementById("deck-count")
    let r = 0 // Random index of deck in collection

    for(let i = 0; i < 2; i++) {
        r = Math.floor(Math.random() * deckCount.value)
        player_hand.push(deck_collection[r].pop())
    }
    updateDisplay()
    setTimeout(function() {
        r = Math.floor(Math.random() * deckCount.value)
        dealer_hand.push(deck_collection[r].pop())
        updateDisplay()
        actionCheck()
    }, 200)
}
// Add the value of the cards in a hand
function handTotal(player) {
    let sum = 0
    let hand = player.slice()
    // Send aces to back to be added last
    for(let i = 0; i < hand.length; i++)
        if(hand[i][0] == 1)
            hand.push(hand.splice(i,1)[0])
    for(let c = 0; c < hand.length; c++) {
        let card = hand[c]
        switch(card[0]) {
        case 1:
            if(sum + 11 > 21)
                sum++
            else
                sum += 11
            break
        case 11:
        case 12:
        case 13:
            sum += 10
            break
        default:
            sum += card[0]
        }
    }
    if(sum > 21)
        return -1
    return sum
}
function convertCard(card) {
    let num = card[0]
    let suit = card[1]
    let str = "<div class='card'>"

    switch(num) {
        case 1:
            str += "A"
            break
        case 11:
            str += "J"
            break
        case 12:
            str += "Q"
            break
        case 13:
            str += "K"
            break
        default:
            str += num
            break
    }
    switch(suit) {
        case 0:
            str += "&clubs;"
            break
        case 1:
            str += "&spades;"
            break
        case 2:
            str += "<span style='color:rgb(200, 0, 0);'>&diams;</span>"
            break
        case 3:
            str += "<span style='color:rgb(200, 0, 0);'>&hearts;</span>"
            break
    }
    str += "</div>"
    return str
}
function updateText() {
    document.getElementById("bank-balance").innerHTML = balance.toFixed(2)
    document.getElementById("player-bet").innerHTML = player_bet.toFixed(2)
    document.getElementById("split-bet").innerHTML = split_bet.toFixed(2)
}
function updateDisplay() {
    let dealerCards = document.getElementById("dealer-hand")
    let playerCards = document.getElementById("player-hand")
    let splitCards = document.getElementById("split-hand")
    dealerCards.innerHTML = playerCards.innerHTML = splitCards.innerHTML = ""
    for(let i = 0; i < dealer_hand.length; i++)
        dealerCards.innerHTML += convertCard(dealer_hand[i])
    for(let j = 0; j < player_hand.length; j++)
        playerCards.innerHTML += convertCard(player_hand[j])
    for(let k = 0; k < split_hand.length; k++)
        splitCards.innerHTML += convertCard(split_hand[k])
    updateText()
}
function disableActions() {
    let actions = document.getElementsByClassName("action-btn")
    for(a in actions)
        actions[a].disabled = true
}
function resetHands() {
    player_hand = []
    split_hand = []
    dealer_hand = []
}
function startGame() {
    let input = initalBet = 0
    let rx = /^( *)(0*)(\d+)?(?:\.\d{1,2})?(0*)( *)?$/ // Accept only number values up to two decimal places

    getBalance()
    input = prompt("Place a starting bet", balance)
    initialBet = parseFloat(input)
    if(input == null)
        return
    if(!rx.test(input)) {
        alert("Invalid bet. Try again.")
        return
    }
    balance -= initialBet
    setBalance()
    player_bet = initialBet
    split_bet = 0
    player_turn = true
    player_stand = split_stand = false
    document.getElementById("game").style.display = "block"
    document.getElementById("title").style.display = 
    document.getElementById("dealer-win").style.display  =
    document.getElementById("player-win").style.display  =
    document.getElementById("split-win").style.display   =
    document.getElementById("dealer-bust").style.display =
    document.getElementById("player-bust").style.display =
    document.getElementById("split-bust").style.display  = "none"
    resetHands()
    generateDecks()
    dealCards()
    updateDisplay()
}
function exitGame() {
    document.getElementById("title").style.display = "block"
    document.getElementById("game").style.display = "none"
}
function getBalance() {
    if(typeof(Storage) == "undefined") {
        updateText()
        return
    }
    try {
        balance = localStorage.getItem("blackjackV2Balance")
        if(balance == null)
            balance = 2500
        if(balance > 0)
            updateText()
        else
            if(confirm("You're out of money. Reset balance to $2500?")) {
                balance = 2500
                setBalance()
                updateText()
            }
    }
    catch(e) {
        document.getElementById("bank-balance").innerHTML = balance
    }
}
function setBalance() {
    if(typeof(Storage) == "undefined")
        return
    try {
        localStorage.setItem("blackjackV2Balance", balance)
    }
    catch(e) {
        return
    }
}
function resetBalance() {
    if(typeof(Storage) == "undefined")
        return
    if(confirm("Reset balance to $2500?")) {
        balance = 2500
        setBalance()
        updateDisplay()
    }
}
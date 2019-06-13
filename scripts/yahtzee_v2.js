// Vincent Nguyen 2018-2019
const MAXROLLS = 3
const MAXROUNDS = 13
const ONE   = '<img src="../images/dice-one.svg"/>'
const TWO   = '<img src="../images/dice-two.svg"/>'
const THREE = '<img src="../images/dice-three.svg"/>'
const FOUR  = '<img src="../images/dice-four.svg"/>'
const FIVE  = '<img src="../images/dice-five.svg"/>'
const SIX   = '<img src="../images/dice-six.svg"/>'
let rolling  // Controls dice roll animation
let selected = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]
let roll = round = 1
let high_score = grand_total = upper_total = lower_total = upper_bonus = 0
let joker = false
let prefer_dots = exit_reset = true

$(document).click(function(event) {
    switch(event.target) {
        case document.getElementById("settings-menu"):
        case document.getElementById("help-menu"):
        case document.getElementById("version-menu"):
        case document.getElementById("cookie-menu"):
            event.target.style.display = "none"
            break
        default:
            break
    }
})
function toggleMenu(menu) {
    let which = document.getElementById(menu)
    if(which.style.display == "block")
        which.style.display = "none"
    else
        which.style.display = "block"
}
function loadTheme() {
    if(theme = getThemeCookie())
        updateTheme(theme)
    else
        updateTheme('light')
}
function updateTheme(theme) {
    if(theme == "light") {
        $('input[value = "light"]').prop('checked', true)
        $('body').css('color', '#000')
        $('body').css('background-color', '#fff')
        $('.menu-content').css('background-color', '#ddd')
        $('.container').css('background-color', '#ddd')
        $('.category').removeClass('dark-cat')
    }
    else {
        $('input[value = "dark"]').prop('checked', true)
        $('body').css('color', '#fff')
        $('body').css('background-color', '#212121')
        $('.menu-content').css('background-color', '#444')
        $('.container').css('background-color', '#444')
        $('.category').addClass('dark-cat')
    }
}
function updateSettings(type) {
    if(type == 'reset') {
        let resetPref = $('input[name = "reset"]:checked')
        if(resetPref.val() == "on")
            exit_reset = true
        else
            exit_reset = false
    }
    else if(type == 'faces') {
        let facePref = $('input[name = "face"]:checked')
        if(facePref.val() == "dots")
            prefer_dots = true
        else
            prefer_dots = false
        for(let n = 0; n < 5; n++) {
            let die = document.getElementById("die" + n)
            if(prefer_dots) {
                switch(selected[n][0]) {
                    case 1: die.innerHTML = ONE
                        break
                    case 2: die.innerHTML = TWO
                        break
                    case 3: die.innerHTML = THREE
                        break
                    case 4: die.innerHTML = FOUR
                        break
                    case 5: die.innerHTML = FIVE
                        break
                    case 6: die.innerHTML = SIX
                        break
                }
            }
            else
                die.innerHTML = selected[n][0]
        }
    }
    else if(type == 'theme') {
        let theme = $('input[name = "theme"]:checked').val()
        updateTheme(theme);
        setThemeCookie(theme);
    }
}
function updateDisplay() {
    let roundDisplay = document.getElementById("round")
    let rollDisplay  = document.getElementById("roll")
    let upperBonus   = document.getElementById("bonus-score")
    let upperTotal   = document.getElementById("upper-total")
    let lowerTotal   = document.getElementById("lower-total")
    let grandTotal   = document.getElementById("grand-total")
    if(round > MAXROUNDS)
        roundDisplay.innerHTML = MAXROUNDS
    else
        roundDisplay.innerHTML = round
    if(roll > MAXROLLS)
        rollDisplay.innerHTML = MAXROLLS
    else
        rollDisplay.innerHTML = roll
    upperBonus.innerHTML = upper_bonus
    upperTotal.innerHTML = upper_total
    lowerTotal.innerHTML = lower_total
    grandTotal.innerHTML = grand_total
}
function yahtzeeFlair() {
    let banner = document.getElementById("yahtzee-banner")
    let bannerOpacity = 0
    let animating
    function setAnimation(reverse) {
        clearInterval(animating)
        animating = setInterval(function() {animateBanner(reverse ? true : false)}, 10)
    }
    function animateBanner(reverse) {
        if(reverse) {
            if(bannerOpacity <= 0) {
                clearInterval(animating)
                banner.style.display = "none"
            }
            else {
                bannerOpacity -= 0.05
                banner.style.opacity = bannerOpacity
            }
        }
        else {
            if(bannerOpacity >= 1)
                clearInterval(animating)
            else {
                bannerOpacity += 0.05
                banner.style.opacity = bannerOpacity
            }
        }
    }
    setAnimation(false)
    banner.style.display = "block"
    setTimeout(function() { setAnimation(true) }, 1000)
}
function resetGame() {
    selected = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]
    roll = round = 1
    high_score = grand_total = upper_total = lower_total = upper_bonus = 0
    joker = false
    $('.disabled').addClass('category')
    $('.category').removeClass('disabled')
    $('.score').html('')
    updateDisplay()
}
function startGame() {
    document.getElementById("title").style.display = "none"
    document.getElementById("game").style.display = "block"
    document.getElementById("high-score").innerHTML = getHighScore()
    updateSettings('faces')
    if(exit_reset)
        resetGame()
    if(round == 1) {
        disableActions('categories')
        document.getElementById("roll-button").disabled = false
    }
}
function exitGame() {
    document.getElementById("title").style.display = "block"
    document.getElementById("game").style.display = "none"
    $('.die').removeClass('disabled')
}
function disableActions(type) {
    if(type == 'categories' || type == 'all') {
        $('.category').addClass('disabled')
        if($('input[name = "theme"]:checked').val() == 'dark')
            $('.category').addClass('dark-cat')
    }
    if(type == 'dice' || type == 'all') {
        $('.die').addClass('disabled')
        $('.selected').addClass('disabled')
        document.getElementById("roll-button").disabled = true
    }
}
function enableActions(type) {
    let yahtzeeScore = document.getElementById("yahtzee-score")
    if(yahtzeeScore.innerHTML !== "") {
        document.getElementById("yahtzee").disabled = true
        if(checkOfKind() == "yahtzee") {
            document.getElementById("roll-button").disabled = true
            yahtzeeFlair()
            if(yahtzeeScore.innerHTML > 0)
                yahtzeeScore.innerHTML = parseInt(yahtzeeScore.innerHTML) + 100
            joker = true
        }
    }
    if(roll > 1) {
        if(type == 'categories' || type == 'all')
            $('.category').removeClass('disabled')
        if(type == 'dice' || type == 'all') {
            $('.die').removeClass('disabled')
            $('.selected').removeClass('disabled')
            document.getElementById("roll-button").disabled = false
        }
    }
}
function animateDice() {
    for(let n = 0; n < 5; n++) {
        let die = document.getElementById("die" + n)
        if(selected[n][1] == 0) {
            selected[n][0] = Math.floor(Math.random() * 6 + 1)
            if(prefer_dots) {
                switch(selected[n][0]) {
                    case 1: die.innerHTML = ONE
                        break
                    case 2: die.innerHTML = TWO
                        break
                    case 3: die.innerHTML = THREE
                        break
                    case 4: die.innerHTML = FOUR
                        break
                    case 5: die.innerHTML = FIVE
                        break
                    case 6: die.innerHTML = SIX
                        break
                }
            }
            else
                die.innerHTML = selected[n][0]
        }
    }
}
function clearAnimateDice() {
    clearInterval(rolling)
    for(let n = 0; n < 5; n++) {
        selected[n][1] = 0
        document.getElementById("die" + n).className = "die"
    }
    if(roll < 4)
        enableActions('all')
    else
        enableActions('categories')
    updateDisplay()
}
function rollDice() {
    roll++
    disableActions('all')
    rolling = setInterval(animateDice, 50)
    setTimeout(clearAnimateDice, 1000)
}
function selectDie(n) {
    if(roll > 3 || roll == 1)
        return
    let die = document.getElementById("die" + n)
    if(die.className == "die") {
        selected[n][1] = 1
        die.className = "selected"
    }
    else {
        selected[n][1] = 0
        die.className = "die"
    }
}
// Check for a small or large straight
function checkStraight() {
    let largeStraights = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]
    let smallStraights = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]
    let dieArray = []
    let sorted   = []
    let matches = 0
    for(let n = 0; n < 5; n++)
        dieArray[n] = selected[n][0]
    sorted = dieArray.slice()
    sorted = sorted.filter(function(item, pos) {
        return sorted.indexOf(item) == pos
    })
    if(sorted.length < 4)
        return
    sorted.sort()
    for(let i = 0; i < largeStraights.length; i++) {
        matches = 0
        for(let j = 0; j < sorted.length; j++)
            if(largeStraights[i].indexOf(sorted[j]) != -1)
                matches++
        if(matches == 5)
            return "lgStraight"
    }
    for(let i = 0; i < smallStraights.length; i++) {
        matches = 0
        for(let j = 0; j < sorted.length; j++)
            if(smallStraights[i].indexOf(sorted[j]) != -1)
                matches++
        if(matches == 4)
            return "smStraight"
    }
    return null
}
function checkOfKind() {
    let dieArray = []
    let sorted   = []
    let current = null
    let count   = pair = 0
    for(let n = 0; n < 5; n++)
        dieArray[n] = selected[n][0]
    sorted = dieArray.slice()
    sorted.sort()
    for(let i = 0; i < 5; i++) {
        if(sorted[i] !== current) {
            if(count == 4)
                return "4kind"
            else if(count == 3)
                if(pair == 2)
                    return "fullHouse"
                else
                    pair = 3
            else if(count == 2)
                if(pair == 3)
                    return "fullHouse"
                else
                    pair = 2
            current = sorted[i]
            count = 1
        }
        else
            count++
    }
    if(count == 5)
        return "yahtzee"
    if(count == 4)
        return "4kind"
    if(count == 3)
        if(pair == 2)
            return "fullHouse"
        else
            return "3kind"
    if(count == 2)
        if(pair == 3)
            return "fullHouse"
    if(pair == 3)
        return "3kind"
    return null
}
function playCategory(id) {
    let total = 0
    let straightCheck = ""
    let kindCheck = ""
    
    document.getElementById(id).className = "disabled"
    for(let n = 0; n < 5; n++) {
        selected[n][1] = 0
        document.getElementById("die" + n).className = "die"
    }
    switch(id) {
        case "aces":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 1)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("ace-score").innerHTML = total
            break
        case "twos":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 2)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("two-score").innerHTML = total
            break
        case "threes":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 3)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("three-score").innerHTML = total
            break
        case "fours":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 4)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("four-score").innerHTML = total
            break
        case "fives":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 5)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("five-score").innerHTML = total
            break
        case "sixes":
            for(let i = 0; i < 5; i++)
                if(selected[i][0] == 6)
                    total += selected[i][0]
            upper_total += total
            document.getElementById("six-score").innerHTML = total
            break
        case "3kind":
            kindCheck = checkOfKind()
            if(kindCheck !== "fullHouse" && kindCheck !== "3kind" && kindCheck !== "4kind")
                total = 0
            else
                for(let i = 0; i < 5; i++)
                    total += selected[i][0]
            lower_total += total
            document.getElementById("3kind-score").innerHTML = total
            break
        case "4kind":
            kindCheck = checkOfKind()
            if(kindCheck !== "4kind")
                total = 0
            else
                for(let i = 0; i < 5; i++)
                    total += selected[i][0]
            lower_total += total
            document.getElementById("4kind-score").innerHTML = total
            break
        case "fullHouse":
            kindCheck = checkOfKind()
            if(kindCheck !== "fullHouse" && !joker)
                total = 0
            else
                total = 25
            lower_total += total
            document.getElementById("fullhouse-score").innerHTML = total
            break
        case "smStraight":
            straightCheck = checkStraight()
            if(straightCheck !== "smStraight" && straightCheck !== "lgStraight" && !joker)
                total = 0
            else
                total = 30
            lower_total += total
            document.getElementById("smstraight-score").innerHTML = total
            break
        case "lgStraight":
            straightCheck = checkStraight()
            if(straightCheck !== "lgStraight" && !joker)
                total = 0
            else
                total = 40
            lower_total += total
            document.getElementById("lgstraight-score").innerHTML = total
            break
        case "yahtzee":
            kindCheck = checkOfKind()
            if(kindCheck !== "yahtzee")
                total = 0
            else {
                total = 50
                yahtzeeFlair()
            }
            lower_total += total
            document.getElementById("yahtzee-score").innerHTML = total
            break
        case "chance":
            for(let i = 0; i < 5; i++)
                total += selected[i][0]
            lower_total += total
            document.getElementById("chance-score").innerHTML = total
            break
    }
    if(upper_total > 62)
        upper_bonus = 35
    joker = false
    round++
    grand_total = upper_total + lower_total
    if(round > MAXROUNDS) {
        setHighScore()
        getHighScore()
        alert("Game Finished")
        disableActions('all')
    }
    else {
        roll = 1
        document.getElementById("roll-button").disabled = false
        disableActions('categories')
    }
    updateDisplay()
}
function getHighScore() {
    if(typeof(Storage) !== "undefined")
        try {
            high_score = localStorage.getItem("yahtzeeV2HighScore")
            if(high_score > 0)
                document.getElementById("high-score").innerHTML = high_score
            return high_score
        }
        catch(e) {
            document.getElementById("high-score").innerHTML = high_score
        }
    else
        document.getElementById("high-score").innerHTML = high_score
}
function setHighScore() {
    if(grand_total > high_score)
        high_score = grand_total
    if(typeof(Storage) == "undefined")
        return
    if(grand_total > getHighScore())
        localStorage.setItem("yahtzeeV2HighScore", grand_total)
}
function clearHighScore() {
    if(typeof(Storage) == "undefined")
        return
    if(confirm("Delete your high score?"))
        try {
            localStorage.removeItem("yahtzeeV2HighScore")
            document.getElementById("high-score").innerHTML = 0
        }
        catch(e) {
            console.log("Failed to remove high score.")
        }
}
function getThemeCookie() {
    if(typeof(Storage)) {
        try {
            theme = localStorage.getItem("yahtzeeV2Theme")
            return theme
        }
        catch(e) {
            return
        }
    }
}
function setThemeCookie() {
    if(!typeof(Storage))
        return
    if(checkCookieConsent()) {        
        let theme = $('input[name = "theme"]:checked').val()
        localStorage.setItem("yahtzeeV2Theme", theme)
    }
}
function checkCookieConsent() {
    if(typeof(Storage))
        try {
            let cookie_consent = localStorage.getItem("yahtzeeV2CookieConsent")
            if(cookie_consent == "true")
                document.getElementById("cookie-menu").style.display = "none"
            return true
        }
        catch(e) {
            return false
        }
    else
        return false
}
function setCookieConsent() {
    if(!typeof(Storage))
        return
    else
        localStorage.setItem("yahtzeeV2CookieConsent", true)
}
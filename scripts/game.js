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
function updateButtons(btnPref) {
    if(btnPref == "round") {
		$('input[value = "round"]').prop('checked', true)
        $('button').css('border-radius', '2vmin')
        $('#title button').css('border-radius', '10vmin')
        $('circle-btn').css('border-radius', '6vmin')
    }
    else {
		$('input[value = "rectangular"]').prop('checked', true)
        $('button').css('border-radius', '0')
    }
}
function loadTheme() {
    if(theme = getThemeCookie())
        updateTheme(theme)
    else
        updateTheme('light')
}
function loadBtnPref() {
	if(btnPref = getButtonsCookie())
		updateButtons(btnPref)
	else
		updateButtons('round')
}
function loadAll() {
	loadTheme()
	loadBtnPref()
}
function checkCookieConsent() {
	if(typeof(Storage)) {		
		try {
			let game = $('#game-title').html()
			let cookie_consent = ""
			switch(game) {
				case "Snake":
					cookie_consent = localStorage.getItem("snakeV2CookieConsent")
					break
				case "Yahtzee":
					cookie_consent = localStorage.getItem("yahtzeeV2CookieConsent")
					break
				case "Blackjack":
					cookie_consent = localStorage.getItem("blackjackV2CookieConsent")
					break
				default:
					break
			}
			if(cookie_consent == "true")
				document.getElementById("cookie-menu").style.display = "none"
			return true
		}
		catch(e) {
			return false
		}
	}
	else
		return false
}
function setCookieConsent() {
	if(!typeof(Storage))
		return
	let game = $('#game-title').html()
	switch(game) {
		case "Snake":
			localStorage.setItem("snakeV2CookieConsent", true)
			break
		case "Yahtzee":
			localStorage.setItem("yahtzeeV2CookieConsent", true)
			break
		case "Blackjack":
			localStorage.setItem("blackjackV2CookieConsent", true)
			break
		default:
			break
	}	
}
function getThemeCookie() {
	if(typeof(Storage)) {		
		try {
			let game = $('#game-title').html()
			let theme = ""
			switch(game) {
				case "Snake":
					theme = localStorage.getItem("snakeV2Theme")
					break
				case "Yahtzee":
					theme = localStorage.getItem("yahtzeeV2Theme")
					break
				case "Blackjack":
					theme = localStorage.getItem("blackjackV2Theme")
					break
				default:
					break
			}
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
		let game = $('#game-title').html()
		let theme = $('input[name = "theme"]:checked').val()
		switch(game) {
			case "Snake":
				localStorage.setItem("snakeV2Theme", theme)
				break
			case "Yahtzee":
				localStorage.setItem("yahtzeeV2Theme", theme)
				break
			case "Blackjack":
				localStorage.setItem("blackjackV2Theme", theme)
				break
			default:
				break
		}
	}
}
function getButtonsCookie() {
	if(typeof(Storage)) {		
		try {
			let game = $('#game-title').html()
			let btn  = ""
			switch(game) {
				case "Snake":
					btn = localStorage.getItem("snakeV2Buttons")
					break
				case "Yahtzee":
					btn = localStorage.getItem("yahtzeeV2Buttons")
					break
				case "Blackjack":
					btn = localStorage.getItem("blackjackV2Buttons")
					break
				default:
					break
			}
			return btn
		}
		catch(e) {
			return
		}
	}
}
function setButtonsCookie() {
	if(!typeof(Storage))
		return
	if(checkCookieConsent()) {
		let game = $('#game-title').html()
		let btn = $('input[name = "buttons"]:checked').val()
		switch(game) {
			case "Snake":
				localStorage.setItem("snakeV2Buttons", btn)
				break
			case "Yahtzee":
				localStorage.setItem("yahtzeeV2Buttons", btn)
				break
			case "Blackjack":
				localStorage.setItem("blackjackV2Buttons", btn)
				break
			default:
				break
		}
	}
}
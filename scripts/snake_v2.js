// Vincent Nguyen 2018-2019
let in_game = in_settings = in_help = false
let paused = true
let updating
let keys  = {}
let high_score = score = 0
let board_size = 20
let snake = {
    x_pos: 1,
    y_pos: 1,
    body: [],
    vel: [0, 0]
}
let apple = {
    pos: [0, 0]
}

$(document).keydown(function(e) {
    keys[e.keyCode] = true
})
$(document).keyup(function(e) {
    delete keys[e.keyCode]
})
function updateTheme(theme) {
    if(theme == "light") {
        $('input[value = "light"]').prop('checked', true)
        $('body').css('color', '#000')
        $('body').css('background-color', '#fff')
        $('#grid').css('background-color', $('input[name = "bgColor"]:checked').val())
        $('.menu-content:not(#gameover-menu-content)').css('background-color', '#ddd')
        $('.container').css('background-color', '#ddd')
    }
    else {
        $('input[value = "dark"]').prop('checked', true)
        $('body').css('color', '#fff')
        $('body').css('background-color', '#212121')
        $('#grid').css('background-color', $('input[name = "bgColor"]:checked').val())
        $('.menu-content:not(#gameover-menu-content)').css('background-color', '#444')
        $('.container').css('background-color', '#444')
    }
}
function updateSettings(type) {
    if(type == "board") {
        let size = document.getElementById("board-size")
        let max = parseInt(size.max)
        let min = parseInt(size.min)

        if(size.value > max)
            size.value = max
        else if(size.value < min)
            size.value = min
    }
    else if(type == "speed") {
        let speed = document.getElementById("update-speed")
        let max = parseInt(speed.max)
        let min = parseInt(speed.min)

        if(speed.value > max)
            speed.value = max
        else if(speed.value < min)
            speed.value = min
    }
    else if(type == "theme") {
        let theme = $('input[name = "theme"]:checked').val()
        updateTheme(theme)
        setThemeCookie()       
    }
    else if(type == "buttons") {
        let btnPref = $('input[name = "buttons"]:checked').val()
        updateButtons(btnPref)
        setButtonsCookie(btnPref)
    }
}
function updateBoard() {
    let snakeColor = $('input[name = "snakeColor"]:checked').val()
    let appleColor = $('input[name = "appleColor"]:checked').val()
    let emptyColor = $('input[name = "bgColor"]:checked').val()
    if(snakeColor == "custom")
        $('.snake').css('background-color', $('#snake-color').val())
    else
        $('.snake').css('background-color', snakeColor)
    if(appleColor == "custom")
        $('.apple').css('background-color', $('#apple-color').val())
    else
        $('.apple').css('background-color', appleColor)
    if($('#round-apple').is(':checked')) {
        $('.apple').css('border-radius', '50%')
        if(emptyColor == "custom")
            $('.apple').parent().css('background-color', $('#bg-color').val())
        else
            $('.apple').parent().css('background-color', emptyColor)
    }
    else
        $('.apple').css('border-radius', '0')
    if(emptyColor == "custom")
        $('.empty').css('background-color', $('#bg-color').val())
    else
        $('.empty').css('background-color', emptyColor)
}
function undraw() {
    if(!in_game)
        return
    let coord = ''
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString()
    document.getElementById(appleCoord).innerHTML = '<div class="empty"></div>'
    for(let x = 0; x < snake.body.length; x++) {
        if(snake.body[x] !== null) {
            coord = snake.body[x][0].toString() + ',' + snake.body[x][1].toString()
            document.getElementById(coord).innerHTML = '<div class="empty"></div>'
        }
    }
}
function draw() {
    if(!in_game)
        return
    let appleCoord = coord = ''
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString()
    document.getElementById(appleCoord).innerHTML = '<div class="apple"></div>'
    for(let x = 0; x < snake.body.length; x++)
        if(snake.body[x] !== null) {
            coord = snake.body[x][0].toString() + ',' + snake.body[x][1].toString()
            document.getElementById(coord).innerHTML = '<div class="snake"></div>'
        }
    updateBoard()
}
function eat() {
    snake.body.push(apple.pos)
    apple.pos = spawnApple()
    score++
    document.getElementById("score").innerHTML = score
}
function turn() {
    let up    = (38 in keys || 87 in keys)
    let down  = (40 in keys || 83 in keys)
    let left  = (37 in keys || 65 in keys)
    let right = (39 in keys || 68 in keys)
    if(!in_game)
        in_game = true
    if(up && snake.vel[1] !== -1)
        snake.vel = [0, 1]
    else if(down && snake.vel[1] !== 1)
        snake.vel = [0, -1]
    else if(left && snake.vel[0] !== 1)
        snake.vel = [-1, 0]
    else if(right && snake.vel[0] !== -1)
        snake.vel = [1, 0]
}
function move() {
    if(snake.vel[0] == 0 && snake.vel[1] == 0)
        return
    else if(snake.vel[0] == 1)
        snake.x_pos++
    else if(snake.vel[0] == -1)
        snake.x_pos--
    else if(snake.vel[1] == 1)
        snake.y_pos--
    else if(snake.vel[1] == -1)
        snake.y_pos++
    let snakePos = [snake.x_pos, snake.y_pos]
    if(snake.x_pos < 0 || snake.y_pos < 0 || 
        snake.x_pos > board_size - 1 || snake.y_pos > board_size - 1)
        gameOver()
    if(inSnakeBody(snakePos))
        gameOver()
    snake.body.push([snake.x_pos, snake.y_pos])
    snake.body.shift()
}
function update() {
    if(in_game && !paused) {
        undraw()
        turn()
        move()
        if(snake.x_pos == apple.pos[0] && snake.y_pos == apple.pos[1])
            eat()
        draw()
    }
}
function spawnApple() {
    let appleX = appleY = 0
    let pos = []
    do {
        appleX = Math.floor(Math.random() * board_size)
        appleY = Math.floor(Math.random() * board_size)
        pos = [appleX, appleY]
    } while(inSnakeBody(pos))
    return pos
}
function makeBoard() {
    let board = appleCoord = ''
    board_size = parseInt($("#board-size").val())
    for(let y = 0; y < board_size; y++) {
        board += '<tr>'
        for(let x = 0; x < board_size; x++)
            if(x == 1 && y == 1) {
                board += '<td class="cell" id="' + x + ',' + y + '"style="height:' + Math.floor(100/board_size) + '%"><div class="snake"></div></td>'
                snake.body.push([x, y])
            }
            else
                board += '<td class="cell" id="' + x + ',' + y + '"style="height:' + Math.floor(100/board_size) + '%"><div class="empty"></div></td>'
        board += '</tr>'
    }
    apple.pos = spawnApple()
    document.getElementById("grid").innerHTML = board
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString()
    document.getElementById(appleCoord).innerHTML = '<div class="apple"></div>'
    updateSettings('all')
    updateBoard()
}
function inSnakeBody(pos) {
    let i, j, current
    for(i = 0; i < snake.body.length; i++) {
        current = snake.body[i]
        for(j = 0; j < pos.length && pos[j] == current[j]; j++)
            if(j == pos.length - 1)
                return true
    }
    return false
}
function startGame() {
    let update_speed = parseInt($("#update-speed").val())
    in_game = true
    paused = false
    $('#title').css('display', 'none')
    $('#board').css('display', 'block')
    $('#score').html(score)
    updating = setInterval(update, 1000/update_speed)
    makeBoard()
    getHighScore()
}
function pauseGame() {
    clearInterval(updating)
    paused = true
    $('#pause-button').css('display', 'none')
    $('#resume-button').css('display', 'inline')
}
function resumeGame() {
    let update_speed = parseInt($("#update-speed").val())
    clearInterval(updating)
    paused = false
    $('#pause-button').css('display', 'inline')
    $('#resume-button').css('display', 'none')
    updating = setInterval(update, 1000/update_speed)
}
function reset() {
    in_game = false
    paused = true
    keys = {}
    score = 0
    snake.x_pos = snake.y_pos = 1
    snake.body = []
    snake.vel = [0, 0]
    apple.pos = []
    clearInterval(updating)
}
function gameOver() {
    in_game = false
    if(typeof(Storage)) {
        setHighScore()
        getHighScore()
    }
    reset()
    toggleMenu('gameover-menu')
}
function exitGame() {
    in_game = false
    paused = true
    reset()
    $('#title').css('display', 'block')
    $('#board').css('display', 'none')
}
function getHighScore() {
    if(typeof(Storage)) {
        try {
            high_score = localStorage.getItem("snakeV2HighScore")
            $('#high-score').html(high_score)
            return high_score
        }
        catch(e) {
            $('#high-score').html(high_score)
        }
    }
    else {
        $('#high-score').html(high_score)
    }
}
function setHighScore() {
    if(score > high_score)
        high_score = score
    if(!typeof(Storage))
        return
    if(checkCookieConsent() && score > getHighScore())
        localStorage.setItem("snakeV2HighScore", score)
}
function clearHighScore() {
    if(!typeof(Storage))
        return
    if(confirm("Delete your high score?"))
        try {
            localStorage.removeItem("snakeV2HighScore")
            document.getElementById("high-score").innerHTML = 0
        }
        catch(e) {
            console.log("Failed to remove high score.")
        }
}
// Vincent Nguyen 2018
let in_game = in_settings = in_help = false;
let paused = true;
let updating;
let keys  = {};
let high_score = score = 0;
let board_size = 20;
let snake = {
    x_pos: 1,
    y_pos: 1,
    body: [],
    vel: [0, 0]
};
let apple = {
    pos: [0, 0]
};

addEventListener("keydown", function(e) {
    keys[e.keyCode] = true
}, false)
addEventListener("keyup", function(e) {
    delete keys[e.keyCode]
}, false)
window.onclick = function(event) {
    let settingsMenu  = document.getElementById("settings-menu");
    let helpMenu = document.getElementById("help-menu");
    let versionMenu   = document.getElementById("version-menu");
    let cookieMenu  = document.getElementById("cookie-menu");
    let modals = [settingsMenu, helpMenu, versionMenu, cookieMenu];
    if(modals.includes(event.target))
        event.target.style.display = "none";
}
function toggleMenu(menu) {
    let which = document.getElementById(menu);
    if(which.style.display == "block")
        which.style.display = "none";
    else
        which.style.display = "block";
    if(menu == 'settings-menu')
        if(in_settings)
            in_settings = false;
        else
            in_settings = true;
    else if(menu == 'help-menu')
        if(in_help)
            in_help = false;
        else
            in_help = true;
}
function updateSettings(type) {
    if(type == "board" || type == "all") {
        let size = document.getElementById("board-size");
        let current = parseInt(size.value);
        let max = parseInt(size.max);
        let min = parseInt(size.min);
        if(!Number.isInteger(current))
            size.value = 20;
        if(current > max)
            size.value = max;
        else if(current < min)
            size.value = min;
    }
    else if(type == "speed" || type == "all") {
        let speed = document.getElementById("update-speed");
        let current = parseInt(speed.value);
        let max = parseInt(speed.max);
        let min = parseInt(speed.min);
        if(!Number.isInteger(current))
            speed.value = 10;
        if(current > max)
            speed.value = max;
        else if(current < min)
            speed.value = min;
    }
    else if(type == "theme" || type == "all") {
        let theme = document.querySelector('input[name = "theme"]:checked').value;
        let menus = document.getElementsByClassName("menu-content");
        let containers = document.getElementsByClassName("container");
        if(theme == "light") {
            document.body.style.color = "#000";
            document.body.style.backgroundColor = "#fff";
            document.getElementById("grid").style.backgroundColor = document.querySelector('input[name = "bgColor"]:checked').value;
            for(let i = 0; i < menus.length; i++)
                if(menus[i].id != "gameover-menu-content")
                    menus[i].style.backgroundColor = "#ddd";
            for(let c = 0; c < containers.length; c++)
                containers[c].style.backgroundColor = "#ddd";
        }
        else {
            document.body.style.color = "#fff";
            document.body.style.backgroundColor = "#212121";
            document.getElementById("grid").style.backgroundColor = document.querySelector('input[name = "bgColor"]:checked').value;
            for(let i = 0; i < menus.length; i++)
                if(menus[i].id != "gameover-menu-content")
                    menus[i].style.backgroundColor = "#444";
            for(let c = 0; c < containers.length; c++)
                containers[c].style.backgroundColor = "#444";
        }
    }
}
function updateBoard() {
    let snakeCells = document.getElementsByClassName("snake");
    let appleCell = document.getElementsByClassName("apple");
    let emptyCells = document.getElementsByClassName("empty");
    let snakeColor = document.querySelector('input[name = "snakeColor"]:checked').value;
    let appleColor = document.querySelector('input[name = "appleColor"]:checked').value;
    let emptyColor = document.querySelector('input[name = "bgColor"]:checked').value;
    let roundApple = document.getElementById("round-apple");
    for(let d = 0; d < snakeCells.length; d++) {
        if(snakeColor != "custom")
            snakeCells[d].style.backgroundColor = snakeColor;
        else
            snakeCells[d].style.backgroundColor = document.getElementById("snake-color").value;
    }
    for(let e = 0; e < appleCell.length; e++) {
        if(appleColor != "custom")
            appleCell[e].style.backgroundColor = appleColor;
        else
            appleCell[e].style.backgroundColor = document.getElementById("apple-color").value;
        if(roundApple.checked)
            appleCell[e].style.borderRadius = '50%';
        else
            appleCell[e].style.borderRadius = '0';
    }
    for(let f = 0; f < emptyCells.length; f++) {
        if(emptyColor != "custom")
            emptyCells[f].style.backgroundColor = emptyColor;
        else
            emptyCells[f].style.backgroundColor = document.getElementById("bg-color").value;
        emptyCells[f].style.backgroundColor = document.querySelector('input[name = "bgColor"]:checked').value;
    }
}
function undraw() {
    if(!in_game)
        return;
    let coord = '';
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString();
    document.getElementById(appleCoord).innerHTML = '<div class="empty"></div>';
    for(let x = 0; x < snake.body.length; x++) {
        if(snake.body[x] !== null) {
            coord = snake.body[x][0].toString() + ',' + snake.body[x][1].toString();
            document.getElementById(coord).innerHTML = '<div class="empty"></div>';
        }
    }
}
function draw() {
    if(!in_game)
        return;
    let appleCoord = coord = '';
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString();
    document.getElementById(appleCoord).innerHTML = '<div class="apple"></div>';
    for(let x = 0; x < snake.body.length; x++)
        if(snake.body[x] !== null) {
            coord = snake.body[x][0].toString() + ',' + snake.body[x][1].toString();
            document.getElementById(coord).innerHTML = '<div class="snake"></div>';
        }
    updateBoard();
}
function eat() {
    snake.body.push(apple.pos);
    apple.pos = spawnApple();
    score++;
    document.getElementById("score").innerHTML = score;
}
function turn() {
    let up    = (38 in keys || 87 in keys);
    let down  = (40 in keys || 83 in keys);
    let left  = (37 in keys || 65 in keys);
    let right = (39 in keys || 68 in keys);
    if(!in_game)
        in_game = true;
    if(up && snake.vel[1] !== -1)
        snake.vel = [0, 1];
    else if(down && snake.vel[1] !== 1)
        snake.vel = [0, -1];
    else if(left && snake.vel[0] !== 1)
        snake.vel = [-1, 0];
    else if(right && snake.vel[0] !== -1)
        snake.vel = [1, 0];
}
function move() {
    if(snake.vel[0] == 0 && snake.vel[1] == 0)
        return;
    else if(snake.vel[0] == 1)
        snake.x_pos++;
    else if(snake.vel[0] == -1)
        snake.x_pos--;
    else if(snake.vel[1] == 1)
        snake.y_pos--;
    else if(snake.vel[1] == -1)
        snake.y_pos++;
    let snakePos = [snake.x_pos, snake.y_pos];
    if(snake.x_pos < 0 || snake.y_pos < 0 || 
        snake.x_pos > board_size - 1 || snake.y_pos > board_size - 1)
        gameOver();
    if(inSnakeBody(snakePos))
        gameOver();
    snake.body.push([snake.x_pos, snake.y_pos]);
    snake.body.shift();
}
function update() {
    if(in_game && !paused) {
        undraw();
        turn();
        move();
        if(snake.x_pos == apple.pos[0] && snake.y_pos == apple.pos[1])
            eat();
        draw();
    }
}
function spawnApple() {
    let appleX = appleY = 0;
    let pos = [];
    do {
        appleX = Math.floor(Math.random() * board_size);
        appleY = Math.floor(Math.random() * board_size);
        pos = [appleX, appleY];
    } while(inSnakeBody(pos));
    return pos;
}
function makeBoard() {
    let board = appleCoord = '';
    board_size = parseInt(document.getElementById("board-size").value);
    for(let y = 0; y < board_size; y++) {
        board += '<tr>';
        for(let x = 0; x < board_size; x++)
            if(x == 1 && y == 1) {
                board += '<td class="cell" id="' + x + ',' + y + '"style="height:' + Math.floor(100/board_size) + '%"><div class="snake"></div></td>';
                snake.body.push([x, y]);
            }
            else
                board += '<td class="cell" id="' + x + ',' + y + '"style="height:' + Math.floor(100/board_size) + '%"><div class="empty"></div></td>';
        board += '</tr>';
    }
    apple.pos = spawnApple();
    document.getElementById("grid").innerHTML = board;
    appleCoord = apple.pos[0].toString() + ',' + apple.pos[1].toString();
    document.getElementById(appleCoord).innerHTML = '<div class="apple"></div>';
    updateSettings('all');
    updateBoard();
}
function inSnakeBody(pos) {
    let i, j, current;
    for(i = 0; i < snake.body.length; i++) {
        current = snake.body[i];
        for(j = 0; j < pos.length && pos[j] == current[j]; j++)
            if(j == pos.length - 1)
                return true;
    }
    return false;
}
function startGame() {
    let update_speed = parseInt(document.getElementById("update-speed").value);
    in_game = true;
    paused = false;
    document.getElementById("title").style.display = "none";
    document.getElementById("board").style.display = "block";
    document.getElementById("score").innerHTML = score;
    updating = setInterval(update, 1000/update_speed);
    makeBoard();
    getHighScore();
}
function pauseGame() {
    clearInterval(updating);
    paused = true;
    document.getElementById("pause-button").style.display  = 'none';
    document.getElementById("resume-button").style.display = 'inline';                
}
function resumeGame() {
    let update_speed = parseInt(document.getElementById("update-speed").value);
    clearInterval(updating);
    paused = false;
    document.getElementById("pause-button").style.display  = 'inline';
    document.getElementById("resume-button").style.display = 'none';
    updating = setInterval(update, 1000/update_speed);
}
function reset() {
    in_game = false;
    paused = true;
    keys = {};
    score = 0;
    snake.x_pos = snake.y_pos = 1;
    snake.body = [];
    snake.vel = [0, 0];
    apple.pos = [];
    clearInterval(updating);
}
function gameOver() {
    in_game = false;
    if(typeof(Storage) !== undefined) {
        setHighScore();
        getHighScore();
    }
    reset();
    toggleMenu('gameover-menu');
}
function exitGame() {
    in_game = false;
    paused = true;
    reset();
    document.getElementById("title").style.display = "block";
    document.getElementById("board").style.display = "none";
}
function getHighScore() {
    if(typeof(Storage) !== "undefined") {
        try {
            high_score = localStorage.getItem("snakeV2HighScore");
            if(high_score > 0)
                document.getElementById("high-score").innerHTML = high_score;
            return high_score;
        }
        catch(e) {
            document.getElementById("high-score").innerHTML = high_score;
        }
    }
    else {
        document.getElementById("high-score").innerHTML = high_score;
    }
}
function setHighScore() {
    if(score > high_score)
        high_score = score;
    if(typeof(Storage) == "undefined")
        return;
    if(score > getHighScore())
        localStorage.setItem("snakeV2HighScore", score);
}
function clearHighScore() {
    if(typeof(Storage) == "undefined")
        return;
    if(confirm("Delete your high score?"))
        try {
            localStorage.removeItem("snakeV2HighScore");
            document.getElementById("high-score").innerHTML = 0;
        }
        catch(e) {
            console.log("Failed to remove high score.");
        }
}
function checkCookie() {
    if(typeof(Storage) !== "undefined")
        try {
            let cookie_consent = localStorage.getItem("snakeV2CookieConsent");
            if(cookie_consent == "true")
                document.getElementById("cookie-menu").style.display = "none";
            return;
        }
        catch(e) {
            return;
        }
    else
        return;
}
function setCookie() {
    if(typeof(Storage) == "undefined")
        return;
    else
        localStorage.setItem("snakeV2CookieConsent", true);
}
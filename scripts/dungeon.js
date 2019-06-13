// Dungeon Dilemma v0.3.0
// Vincent Nguyen 2018
// ************************
// *** GLOBAL VARIABLES ***
// ************************
// Difficulty values
const EASY      = 0;
const NORMAL    = 1;
const HARD      = 2;
const INSANE    = 3;
const NIGHTMARE = 4;
const CUSTOM    = 5;
// SVG Icons
const PLAYER   =  "<svg width='100%' viewbox='0 0 100 100'>"
                + "<polygon points='50,25 75,75 25,75'/>"
                + "</svg>";
const EXIT     =  "<svg class='exitSVG' width='100%' viewbox='0 0 100 100'>"
                + "<line x1='25' y1='5' x2='25' y2='75'/>"
                + "<line x1='75' y1='5' x2='75' y2='75'/>"
                + "<line x1='25' y1='20' x2='75' y2='20'/>"
                + "<line x1='25' y1='40' x2='75' y2='40'/>"
                + "<line x1='25' y1='60' x2='75' y2='60'/>"
                + "</svg>";
const MONSTER  =  "<svg width='100%' viewbox='0 0 100 100'>"
                + "<polygon points='50,25 75,50 50,75 25,50'/>"
                + "</svg>";
const ELITE    =  "<svg width='100%' viewbox='0 0 100 100'>"
                + "<polygon points='50,20 75,75 20,40 80,40 25,75'/>"
                + "</svg>";
const ITEM     =  "<svg width='100%' viewbox='0 0 100 100'>"
                + "<polygon points='25,35 35,25 65,25 75,35 75,45 25,45'/>"
                + "<polygon points='25,50 75,50 75,75 25,75'/>"
                + "</svg>";
// Starting values for game
const MAXPLAYERHP  = 100;
const MAXMONSTERHP = 10;
const MAXELITEHP   = 20;
const MAXSTAMINA   = 5;
// Item Values
const TOTALITEMS  = 4; // Update when adding new items
//    ----------
const SMHEALTHPOT = 0;
const LGHEALTHPOT = 1;
const DOUBLEDMG   = 2;
const MADMASK     = 3;
// Settings
let difficulty   = 0;
let room_count   = 
    room_width   = 5;
let monster_rate = 
    item_rate    = 4;
let elite_rate   = 2;
// Game State
let room_number = 1;
let player_pos  = [0, 0];
let exit_pos    = [1, 1];
let keys        = {};
let moving      = 
    inMenu      = 
    inCombat    = 
    inGame      = false;
// Room Progress
let mons_defeated   = 
    elites_defeated = 
    items_found     = 
    tiles_explored  = 0;
// Combat State
let player_hp      = MAXPLAYERHP;
let monster_hp     = MAXMONSTERHP;
let elite_hp       = MAXELITEHP;
let stamina        = MAXSTAMINA;
let dmg_multiplier = mon_dmg_multiplier = 1;
// For each array in selected: [0] = die number, [1] = 1 if selected or 0 if not
let selected     = [[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]]; 
let monster_dice = [0, 0, 0];

// *****************
// *** FUNCTIONS ***
// *****************
// Change the advanced settings unless set to CUSTOM
function updateDifficulty() {
    let roomCount   = document.getElementById("roomCount");
    let roomWidth   = document.getElementById("roomWidth");
    let monsterRate = document.getElementById("monSpawnRate");
    let eliteRate   = document.getElementById("eliteSpawnRate");
    let itemRate    = document.getElementById("itemSpawnRate");

    difficulty = parseInt(document.querySelector("input[name='difficulty']:checked").value);
    switch(difficulty) {
        case EASY:      // 0
            roomCount.value   = roomWidth.value = 4;
            monsterRate.value = 2;
            eliteRate.value   = 1;
            itemRate.value    = 3;
            break;
        default:
        case NORMAL:    // 1
            roomCount.value   = roomWidth.value = 5;
            monsterRate.value = 4;
            eliteRate.value   = 2;
            itemRate.value    = 4;
            break;
        case HARD:      // 2
            roomCount.value   = roomWidth.value = 6;
            monsterRate.value = 8;
            eliteRate.value   = 3;
            itemRate.value    = 6;
            break;
        case INSANE:    // 3
            roomCount.value   = roomWidth.value = 8;
            monsterRate.value = 12;
            eliteRate.value   = 5;
            itemRate.value    = 8;
            break;
        case NIGHTMARE: // 4
            roomCount.value   = roomWidth.value = 10;
            monsterRate.value = 16;
            eliteRate.value   = 10;
            itemRate.value    = 10;
            break;
        case CUSTOM:    // 5
            break;
    }
    updateSettingsDisplay();
}
// Update display to show values of settings
function updateSettingsDisplay() {
    let roomCountText  = document.getElementById("roomCountText");
    let roomWidthText  = document.getElementById("roomWidthText");
    let monSRText      = document.getElementById("monSpawnRateText");
    let eliteSRText    = document.getElementById("eliteSpawnRateText");
    let itemSRText     = document.getElementById("itemSpawnRateText");

    roomCountText.innerHTML = room_count   = parseInt(document.getElementById("roomCount").value);
    roomWidthText.innerHTML = room_width   = parseInt(document.getElementById("roomWidth").value);
    monSRText.innerHTML     = monster_rate = parseInt(document.getElementById("monSpawnRate").value);
    eliteSRText.innerHTML   = elite_rate   = parseInt(document.getElementById("eliteSpawnRate").value);
    itemSRText.innerHTML    = item_rate    = parseInt(document.getElementById("itemSpawnRate").value);
    document.getElementById("roomSizeText").innerHTML = room_width * room_width;
}
// Configure settings while maintaining limits
function updateSettings() {
    let maxSpawns = 0;
    let currentSpawns  = monster_rate + elite_rate + item_rate;
    let monSpawnRate   = document.getElementById("monSpawnRate");
    let eliteSpawnRate = document.getElementById("eliteSpawnRate");
    let itemSpawnRate  = document.getElementById("itemSpawnRate");

    room_count = document.getElementById("roomCount").value;
    room_width = document.getElementById("roomWidth").value;
    maxSpawns  = roomWidth.value * roomWidth.value - 2;
    // Keep lowering highest spawn rate until sum fits within the max spawn rate.
    while(currentSpawns > maxSpawns) {
        if(monster_rate < elite_rate)
            if(elite_rate < item_rate)
                itemSpawnRate.value = item_rate--;
            else 
                eliteSpawnRate.value = elite_rate--;
            else if(monster_rate < item_rate)
                itemSpawnRate.value = item_rate--;
        else
            monSpawnRate.value = monster_rate--;
        currentSpawns = monster_rate + elite_rate + item_rate;
    }
    document.getElementById("roomSizeText").innerHTML = maxSpawns;
    monster_rate = parseInt(monSpawnRate.value);
    currentSpawns = monster_rate + elite_rate + item_rate;
    if(currentSpawns > maxSpawns)
        monSpawnRate.value = monster_rate = maxSpawns - elite_rate - item_rate;
    elite_rate = parseInt(eliteSpawnRate.value);
    currentSpawns = monster_rate + elite_rate + item_rate;
    if(currentSpawns > maxSpawns)
        eliteSpawnRate.value = elite_rate = maxSpawns - monster_rate - item_rate;
    item_rate = parseInt(itemSpawnRate.value);
    currentSpawns = monster_rate + elite_rate + item_rate;
    if(currentSpawns > maxSpawns)
        itemSpawnRate.value = item_rate = maxSpawns - elite_rate - monster_rate;
    document.getElementsByName("difficulty")[5].checked = true;
    updateDifficulty();
}
// Open or close a modal based on option
function toggleMenu(option) {
    let menu;

    if(option == 'settings')
        menu = document.getElementById("settingsMenu");
    else if(option == 'help')
        menu = document.getElementById("helpMenu");
    else if(option == 'credits')
        menu = document.getElementById("creditsScreen");
    else if(option == 'patchNotes')
        menu = document.getElementById("patchNotesScreen");
    else if(option == 'combat')
        menu = document.getElementById("combatScreen");
    else if(option == 'room')
        menu = document.getElementById("roomInfoScreen");
    else if(option == 'character')
        menu = document.getElementById("characterScreen");
    else if(option == 'combatHelp')
        menu = document.getElementById("combatHelpMenu");
    else if(option == 'exit')
        menu = document.getElementById("exitRoomMenu");
    if(menu.style.display == "block") {
        menu.style.display = "none";
        inMenu = false;
        if(option == 'combat')
            inCombat = false;
    }
    else {
        menu.style.display = "block";
        inMenu = true;
        if(option == 'character')
            document.getElementById("characterHealth").innerHTML = player_hp;
        else if(option == 'room')
            updateProgress();
    }
}
// When the user clicks anywhere outside of a modal, close it
window.onclick = function(event) {
    let settingsMenu     = document.getElementById("settingsMenu");
    let helpMenu         = document.getElementById("helpMenu");
    let creditsScreen    = document.getElementById("creditsScreen");
    let patchNotesScreen = document.getElementById("patchNotesScreen");
    let roomInfoScreen   = document.getElementById("roomInfoScreen");
    let characterScreen  = document.getElementById("characterScreen");
    let combatHelpMenu   = document.getElementById("combatHelpMenu");

    if(event.target == settingsMenu)
        settingsMenu.style.display = "none";
    else if(event.target == helpMenu)
        helpMenu.style.display = "none";
    else if(event.target == creditsScreen)
        creditsScreen.style.display = "none";
    else if(event.target == patchNotesScreen)
        patchNotesScreen.style.display = "none";
    else if(event.target == roomInfoScreen)
        roomInfoScreen.style.display = "none";
    else if(event.target == characterScreen)
        characterScreen.style.display = "none";
    else if(event.target == combatHelpMenu)
        combatHelpMenu.style.display = "none";
    else
        return;
    inMenu = false;
}
// Listens for keypresses
addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    movePlayer();
    delete keys[e.keyCode];
}, false)
// Move the player token on keypress
function movePlayer() {
    let up     = (38 in keys || 87 in keys);
    let down   = (40 in keys || 83 in keys);
    let left   = (37 in keys || 65 in keys);
    let right  = (39 in keys || 68 in keys);
    let player = document.getElementById("player");
    let item   = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.item");

    if($("#player").length < 1 || moving || inMenu || inCombat || !inGame)
        return;
    if(up && player_pos[0] > 0)
        player_pos[0]--;
    else if(down && player_pos[0] < room_width - 1)
        player_pos[0]++;
    else if(left && player_pos[1] > 0)
        player_pos[1]--;
    else if(right && player_pos[1] < room_width - 1)
        player_pos[1]++;
    else
        return;
    moving = true;
    player.remove();
    if(item.length > 0)
        item[0].remove();
    updateBoard();
}
// Place the player on the board
function placePlayer(row, col) {
    player_pos[0] = row;
    player_pos[1] = col;
}
// Place object in a random empty cell
function placeRandom(object) {
    let cell;
    do {
        tempRow = Math.floor(Math.random() * room_width);
        tempCol = Math.floor(Math.random() * room_width);
        cell = document.getElementById(tempRow + "," + tempCol);
    } while(cell.innerHTML != "" || (tempRow == player_pos[0] && tempCol == player_pos[1]));
    if(object == 'exit') {
        exit_pos = [tempRow, tempCol];
        cell.innerHTML += "<div id='" + object + "'>" + EXIT + "</div>";
    }
    else {
        let str = "<div class='" + object + "'>";
        if(object == 'monster')
            str += MONSTER;
        else if(object == 'elite')
            str += ELITE;
        else if(object == 'item')
            str += ITEM;
        str += "</div>";
        cell.innerHTML += str;
    }
}
// Place fog over the whole room
function placeFog() {
    let cell;

    for(let row = 0; row < room_width; row++)
        for(let col = 0; col < room_width; col++) {
            cell = document.getElementById(row + "," + col);
            cell.innerHTML += "<div class='fog'></div>";
        }
}
// Select die and all dice to the left while unselected those to the right
function selectDie(n) {
    for(let i = n; i >= 0; i--) {
        selected[i][1] = 1;
        document.getElementById("die" + i).style.backgroundColor = "#FFC107";
    }
    for(let j = n + 1; j < stamina; j++) {
        selected[j][1] = 0;
        document.getElementById("die" + j).style.backgroundColor = "#E0E0E0";
    }
    document.getElementById("attackButton").disabled = false;
}
// Disable all combat actions
function disableActions() {
    for(let i = 0; i < selected.length; i++)
        document.getElementById("die" + i).disabled = true;
    document.getElementById("attackButton").disabled = 
    document.getElementById("defendButton").disabled =
    document.getElementById("itemButton").disabled   =
    document.getElementById("fleeButton").disabled   = true;
}
// Enable 'Defend', 'Item', and 'Flee' buttons while resetting stats modified by items
function enableActions() {
    document.getElementById("defendButton").disabled =
    document.getElementById("itemButton").disabled   =
    document.getElementById("fleeButton").disabled   = false;
    document.getElementById("playerDice").style.boxShadow  = 
    document.getElementById("monsterDice").style.boxShadow = "none";
    dmg_multiplier = mon_dmg_multiplier = 1;
}
// Perform an action based on input button
function playerAction(action) {
    let playerAttackValue = monsterAttackValue = 0;

    if(action == 'attack') {
        disableActions();
        playerAttack();
        if(document.getElementById("monDie2").style.display == "none") {
            monsterAttack(2);
            setTimeout(function() {
                for(let i = 0; i < selected.length; i++) {
                    playerAttackValue += selected[i][0];
                    selected[i][0] = 0;
                }
                for(let j = 0; j < monster_dice.length; j++)
                    monsterAttackValue += monster_dice[j];
                playerAttackValue *= dmg_multiplier;
                monsterAttackValue = Math.ceil(monsterAttackValue * mon_dmg_multiplier);
                if(playerAttackValue > monsterAttackValue) {
                    monster_hp -= (playerAttackValue - monsterAttackValue);
                    document.getElementById("monsterHealth").innerHTML = monster_hp + " (<b>" + (monsterAttackValue - playerAttackValue) + "</b>)";
                    document.getElementById("playerHealth").innerHTML  = player_hp;
                }
                else if(playerAttackValue < monsterAttackValue) {
                    player_hp -= (monsterAttackValue - playerAttackValue);
                    document.getElementById("playerHealth").innerHTML  = player_hp + " (<b>" + (playerAttackValue - monsterAttackValue) + "</b>)";
                    document.getElementById("monsterHealth").innerHTML = monster_hp;
                }
                else {
                    document.getElementById("playerHealth").innerHTML  = player_hp;
                    document.getElementById("monsterHealth").innerHTML = monster_hp;
                }
                if(monster_hp <= 0)
                    setTimeout(function() {
                        let monster = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.monster");
                        monster[0].remove();
                        mons_defeated++;
                        toggleMenu('combat');
                    }, 500);
                else
                    enableActions();
            }, 500);
        }
        else {
            monsterAttack(3);
            setTimeout(function() {
                for(let i = 0; i < selected.length; i++) {
                    playerAttackValue += selected[i][0];
                    selected[i][0] = 0;
                }
                for(let j = 0; j < monster_dice.length; j++)
                    monsterAttackValue += monster_dice[j];
                playerAttackValue *= dmg_multiplier;
                monsterAttackValue = Math.ceil(monsterAttackValue * mon_dmg_multiplier);
                if(playerAttackValue > monsterAttackValue) {
                    elite_hp -= (playerAttackValue - monsterAttackValue);
                    document.getElementById("monsterHealth").innerHTML = elite_hp + " (<b>" + (monsterAttackValue - playerAttackValue) + "</b>)";
                    document.getElementById("playerHealth").innerHTML  = player_hp;
                }
                else if(playerAttackValue < monsterAttackValue) {
                    player_hp -= (monsterAttackValue - playerAttackValue);
                    document.getElementById("playerHealth").innerHTML  = player_hp + " (<b>" + (playerAttackValue - monsterAttackValue) + "</b>)";
                    document.getElementById("monsterHealth").innerHTML = elite_hp;
                }
                else {
                    document.getElementById("playerHealth").innerHTML  = player_hp;
                    document.getElementById("monsterHealth").innerHTML = elite_hp;
                }
                if(elite_hp <= 0)
                    setTimeout(function() {
                        let monster = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.elite");
                        monster[0].remove();
                        elites_defeated++;
                        toggleMenu('combat');
                    }, 500);
                else
                    enableActions();
            }, 500);
        }
    }
    else if(action == 'defend') {
        disableActions();
        if(document.getElementById("monDie2").style.display == "none")
            monsterAttack(1);
        else 
            monsterAttack(2);
        setTimeout(function() {
            for(let n = 0; n < selected.length; n++) {
                selected[n][0] = selected[n][1] = 0;
                document.getElementById("die" + n).disabled = false;
                document.getElementById("die" + n).style.backgroundColor = "#E0E0E0";
                document.getElementById("die" + n).innerHTML = selected[n][0];
            }
            stamina += 2;
            if(stamina > MAXSTAMINA)
                stamina = MAXSTAMINA;
            if(stamina < 5)
                for(let i = stamina; i < selected.length; i++)
                document.getElementById("die" + i).disabled = true;
            for(let j = 0; j < monster_dice.length; j++)
                monsterAttackValue += monster_dice[j];
            player_hp -= monsterAttackValue;
            document.getElementById("playerHealth").innerHTML  = player_hp + " (<b>-" + monsterAttackValue + "</b>)";
            if(document.getElementById("monDie2").style.display == "none")
                document.getElementById("monsterHealth").innerHTML = monster_hp;
            else
                document.getElementById("monsterHealth").innerHTML = elite_hp;
            enableActions();
        }, 500); 
    }
    else if(action == 'item')
        toggleMenu('character');
    else if(action == 'flee') {
        disableActions();
        monsterAttack(1);
        setTimeout(function() {
            for(let j = 0; j < monster_dice.length; j++)
                monsterAttackValue += monster_dice[j];
            player_hp -= monsterAttackValue;
            document.getElementById("playerHealth").innerHTML  = player_hp + " (<b>-" + monsterAttackValue + "</b>)";
            if(document.getElementById("monDie2").style.display == "none")
                document.getElementById("monsterHealth").innerHTML = monster_hp;
            else
                document.getElementById("monsterHealth").innerHTML = elite_hp;
            setTimeout(function() {
                toggleMenu('combat');
                enableActions();
            }, 500);
        }, 500);
    }
    setTimeout(function() {
        if(player_hp <= 0) {
            inGame = false;
            toggleMenu('combat');
            alert("You died. Game over.");
        }
    }, 500);
}
// Use an item in battle
function useItem(item) {
    let amount = 0;

    if(!inCombat)
        return;
    switch(item) {
        case SMHEALTHPOT: // 0
            amount = parseInt(document.getElementById("smHealthPot").innerHTML);
            if(amount <= 0)
                return;
            document.getElementById("smHealthPot").innerHTML = --amount;
            player_hp += 20;
            if(player_hp > MAXPLAYERHP)
                player_hp = MAXPLAYERHP;
            document.getElementById("playerHealth").innerHTML = player_hp + " (<b>+20</b>)";
            break;
        case LGHEALTHPOT: // 1
            amount = parseInt(document.getElementById("lgHealthPot").innerHTML);
            if(amount <= 0)
                return;
            document.getElementById("lgHealthPot").innerHTML = --amount;
            player_hp += 40;
            if(player_hp > MAXPLAYERHP)
                player_hp = MAXPLAYERHP;
            document.getElementById("playerHealth").innerHTML = player_hp + " (<b>+40</b>)";
            break;
        case DOUBLEDMG:   // 2
            amount = parseInt(document.getElementById("doubleDamage").innerHTML);
            if(amount <= 0)
                return;
            document.getElementById("playerDice").style.boxShadow = "0 0 4vmin 0.5vmin #FF6F00 inset, 0 0 2vmin 0 #FF6F00";
            document.getElementById("doubleDamage").innerHTML = --amount;
            dmg_multiplier = 2;
            break;
        case MADMASK:     // 3
            amount = parseInt(document.getElementById("madMask").innerHTML);
            if(amount <= 0)
                return;
            document.getElementById("monsterDice").style.boxShadow = "0 0 4vmin 0.5vmin #01579B inset, 0 0 2vmin 0 #01579B";
            document.getElementById("madMask").innerHTML = --amount;
            mon_dmg_multiplier = 0.5;
            break;
        default:
            break;
    }
    toggleMenu('character');
    document.getElementById("itemButton").disabled = true;
}
// Roll player's dice up to amount selected
function playerAttack() {
    let rolling;

    rolling = setInterval(function() {
        for(let n = 0; n < stamina; n++)
            if(selected[n][1] == 1)
                document.getElementById("die" + n).innerHTML = selected[n][0] = Math.floor(Math.random() * 6 + 1);
            else
                document.getElementById("die" + n).innerHTML = selected[n][0] = 0;
    }, 50);
    setTimeout(function() {
        clearInterval(rolling);
        for(let n = 0; n < selected.length; n++) {
            if(selected[n][1] == 1)
                stamina--;
            selected[n][1] = 0;
            document.getElementById("die" + n).disabled = false;
            document.getElementById("die" + n).style.backgroundColor = "#E0E0E0";
        }
        stamina++;
        if(stamina < 5)
            for(let i = stamina; i < selected.length; i++)
                document.getElementById("die" + i).disabled = true;
    }, 500);
    document.getElementById("attackButton").disabled = true;
}
// Roll monster's dice
function monsterAttack(amount) {
    let rolling;

    monster_dice = [0, 0, 0];
    for(let m = 0; m < monster_dice.length; m++)
        document.getElementById("monDie" + m).innerHTML = monster_dice[m];
    rolling = setInterval(function() {
        for(let n = 0; n < amount; n++)
            document.getElementById("monDie" + n).innerHTML = monster_dice[n] = Math.floor(Math.random() * 6 + 1);
    }, 50);
    setTimeout(function() {
        clearInterval(rolling);
    }, 500);
}
// Obtain a random item
function obtainItem() {
    let token = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.item");
    let popup = document.getElementById("popup");
    let rng   = Math.floor(Math.random() * TOTALITEMS);
    let item, itemName, itemAmount;

    // Fades out the popup over half a second
    function fadePopup() {
        if(popup.style.opacity > 0) {
            popup.style.opacity -= 0.05;
            setTimeout(fadePopup, 10);
        }
        else
            popup.style.display = "none";
    }
    switch(rng) {
        default:
        case SMHEALTHPOT: // 0
            itemName = "Small Health Potion";
            item     = document.getElementById("smHealthPot");
            break;
        case LGHEALTHPOT: // 1
            itemName = "Large Health Potion";
            item     = document.getElementById("lgHealthPot");
            break;
        case DOUBLEDMG:   // 2
            itemName = "2x Damage Booster";
            item     = document.getElementById("doubleDamage");
            break;
        case MADMASK:     // 3
            itemName = "Menacing Mask";
            item     = document.getElementById("madMask");
            break;
    }
    popup.style.display = "block";
    popup.style.opacity = 1;
    popup.innerHTML     = "Found a " + itemName;
    itemAmount     = parseInt(item.innerHTML);
    item.innerHTML = ++itemAmount;
    setTimeout(fadePopup, 1000);
    token.fadeTo(0, 0);
    items_found++;
}
// Initialize the combat screen
function combatSequence(type) {
    selected = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
    inCombat = true;
    stamina  = 5;
    document.getElementById("playerHealth").innerHTML = player_hp;
    document.getElementById("attackButton").disabled  = true;
    toggleMenu('combat');
    enableActions();
    for(let i = 0; i < selected.length; i++) {
        document.getElementById("die" + i).style.backgroundColor = "#E0E0E0";
        document.getElementById("die" + i).disabled  = false;
        document.getElementById("die" + i).innerHTML = selected[i][0];
    }
    if(type == 'monster') {
        monster_hp   = MAXMONSTERHP;
        monster_dice = [0, 0];
        document.getElementById("monsterHealth").innerHTML = monster_hp;
        document.getElementById("monDie2").style.display   = "none";
        document.getElementById("monsterTag").innerHTML    = "Monster";
    }
    else if(type == 'elite') {
        elite_hp     = MAXELITEHP;
        monster_dice = [0, 0, 0];
        document.getElementById("monsterHealth").innerHTML = elite_hp;
        document.getElementById("monDie2").style.display   = "inline-block";
        document.getElementById("monsterTag").innerHTML    = "Elite Monster";
    }
    for(let j = 0; j < monster_dice.length; j++)
        document.getElementById("monDie" + j).innerHTML = monster_dice[j];
}
// Update room progress
function updateProgress() {
    document.getElementById("monsterProgress").innerHTML = mons_defeated   + "/" + monster_rate + " (" + Math.floor(100 * mons_defeated/monster_rate) + "%)";
    document.getElementById("eliteProgress").innerHTML   = elites_defeated + "/" + elite_rate   + " (" + Math.floor(100 * elites_defeated/elite_rate) + "%)";
    document.getElementById("itemProgress").innerHTML    = items_found     + "/" + item_rate    + " (" + Math.floor(100 * items_found/item_rate) + "%)";
    document.getElementById("tileProgress").innerHTML    = tiles_explored  + "/" + (room_width * room_width) + " (" + Math.floor(100 * tiles_explored/(room_width * room_width)) + "%)";
}
// Clear fog and trigger events
function updateBoard() {
    let playerCell = document.getElementById(player_pos[0] + "," + player_pos[1]);
    let monster    = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.monster");
    let elite      = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.elite");
    let item       = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.item");

    // Fade fog tile and allow player to move
    function animateFog() {
        let fog = $("#" + player_pos[0] + "\\," + player_pos[1] + " div.fog");

        if(fog.length <= 0) {
            moving = false;
            return;
        }
        fog.fadeTo(0, 0);
        setTimeout(function() {
            moving = false; 
            fog[0].remove();
            tiles_explored++;
        }, 500);
    }
    playerCell.innerHTML += "<div id='player'><div id='popup'>test</div>" + PLAYER + "</div>";
    animateFog();
    if(monster.length > 0)
        combatSequence('monster');
    else if(elite.length > 0)
        combatSequence('elite');
    else if(item.length > 0)
        obtainItem();
    else if(player_pos[0] == exit_pos[0] && player_pos[1] == exit_pos[1])
        toggleMenu('exit');
}
// Create a room according to settings
function generateBoard() {
    let str     = "";
    let tempRow = tempCol = 0;

    // Reset progress
    mons_defeated = elites_defeated = items_found = tiles_explored = 0;
    for(let row = 0; row < room_width; row++) {
        str += "<tr style='height:" + Math.floor(100/room_width) + "%'>";
        for(let col = 0; col < room_width; col++)
            str += "<td style='width:" + Math.floor(100/room_width) + "%' id='" + row + "," + col + "'></td>";
        str += "</tr>";
    }
    document.getElementById("room").innerHTML = str;
    if(room_number == 1)
        placePlayer(0, 0);
    else
        placePlayer(exit_pos[0], exit_pos[1]);
    placeRandom('exit');
    for(let i = 0; i < monster_rate; i++)
        placeRandom('monster');
    for(let j = 0; j < elite_rate; j++)
        placeRandom('elite');
    for(let k = 0; k < item_rate; k++)
        placeRandom('item');
    placeFog();
    updateBoard();
    document.getElementById("roomNo").innerHTML = room_number;
}
// Generates a new room
function nextRoom() {
    room_number++;
    if(room_number > room_count) {
        inGame = false;
        alert("You escaped!");
    }
    else
        generateBoard();
    toggleMenu('exit');
}
// Generate a table based on settings then display the gameBoard div
function startGame() {
    inGame      = true;
    room_number = 1;
    player_hp   = MAXPLAYERHP;
    document.getElementsByClassName("gameBoard")[0].style.display   = "block";
    document.getElementsByClassName("titleScreen")[0].style.display = "none";
    // Reset items
    document.getElementById("smHealthPot").innerHTML  =
    document.getElementById("lgHealthPot").innerHTML  =
    document.getElementById("doubleDamage").innerHTML = 0;
    generateBoard();
    document.body.style.backgroundColor = "#263238";
    document.body.style.color = "#FFF";
}
// Return to the title screen
function quitGame() {
    if(confirm("Progress is not saved. Quit?")) {
        inGame = false;
        document.getElementsByClassName("gameBoard")[0].style.display   = "none";
        document.getElementsByClassName("titleScreen")[0].style.display = "block";
        document.body.style.backgroundColor = "#FFF";
        document.body.style.color = "#000";
    }
}
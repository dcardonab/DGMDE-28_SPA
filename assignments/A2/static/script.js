//-------------------- GLOBAL VARIABLES --------------------//
var PLAY_STATE = true;
var CURRENT_PLAYER = 'X';
var SCORE_X = 0;
var SCORE_O = 0;


//-------------------- INIT --------------------//
window.onload = () => {

    create_grid();

    // Turn cell divs into clickable buttons
    cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.addEventListener('click', play_move));

    // Insert event listener to the "New Game" button
    document.getElementById('new_game_button').addEventListener('click', reset);
};


//-------------------- HELPER FUNCTIONS --------------------//
check_equal = (a, b, c) => a.innerText === b.innerText && a.innerText === c.innerText && a.innerText != '';

display_message = message => document.getElementById('messages').innerHTML = message;


function create_grid() {
    // Create container
    let grid = '';

    // Nested loops to create nine cells
    // CSS will create the grid using flexbox
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid += '<div class="cell empty" id="cell_' + (j + 1 + (i * 3)) + '"></div>';
        }
    }

    // Add grid to HTML div
    document.getElementById('board').innerHTML = grid;
};


function check_winner() {
    cells = document.querySelectorAll('.cell');

    // Check rows
    if (check_equal(cells[0], cells[1], cells[2]))
        return game_over(cells[0].innerText);
    else if (check_equal(cells[3], cells[4], cells[5]))
        return game_over(cells[3].innerText);
    else if (check_equal(cells[6], cells[7], cells[8]))
        return game_over(cells[6].innerText);

    // Check columns
    else if (check_equal(cells[0], cells[3], cells[6]))
        return game_over(cells[0].innerText);
    else if (check_equal(cells[1], cells[4], cells[7]))
        return game_over(cells[1].innerText);
    else if (check_equal(cells[2], cells[5], cells[8]))
        return game_over(cells[2].innerText);

    // Check diagonals
    else if (check_equal(cells[0], cells[4], cells[8]))
        return game_over(cells[0].innerText);
    else if (check_equal(cells[2], cells[4], cells[6]))
        return game_over(cells[2].innerText);

    // If no player has won, check if there are any available cells
    // REF: https://developer.mozilla.org/en-US/docs/Web/API/NodeList/values
    for (let cell of cells.values()) {
        if (cell.classList.contains('empty'))
            // Exit function if there are available moves remaining
            return;
    }

    // Finish game if there are no more available moves
    game_over();
};


function game_over(winner='') {
    // Switch boolean to prevent additional user input
    PLAY_STATE = false;

    // Display message
    if (winner != '') {
        // Update score
        if (winner === 'X')
            document.getElementById('X_score').innerText = 'X = ' + ++SCORE_X;
        else
            document.getElementById('O_score').innerText = 'O = ' + ++SCORE_O;

        display_message("Player " + winner + " won! Congratulations!");
    }
    else
        display_message("Stalemate!");

    // Display 'GAME OVER' div
    document.getElementById('game_over').style.display = 'block';
};


function reset() {
    // Clear all cells by removing text and styling classes, and setting them as empty
    cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        // Reset classes and content of non-empty cells
        if (!cell.classList.contains('empty')) {
            cell.classList.contains('X_player') ? cell.classList.remove('X_player') : cell.classList.remove('O_player');
            cell.classList.add('empty');
            cell.innerHTML = '';
        }
    });

    // Set initial settings
    CURRENT_PLAYER = 'X';
    PLAY_STATE = true;

    // Hide messages
    document.getElementById('messages').innerHTML = '';
    document.getElementById('game_over').style.display = 'none';
}


function play_move() {
    // Only allow user to input moves in PLAY state
    if (PLAY_STATE) {
        cell = this;

        // Clear messages on each move
        document.getElementById('messages').innerHTML = '';
        
        // Make move only if cell is available
        if (cell.classList.contains('empty')) {
            // Style and add player's the icon to the cell
            cell.classList.add(CURRENT_PLAYER + '_player');
            cell.innerText = CURRENT_PLAYER;

            // Switch player
            CURRENT_PLAYER = CURRENT_PLAYER === 'X' ? 'O' : 'X';
            
            // Make cell unavailable
            // This will also prevent changing background when hovering
            cell.classList.remove('empty');
            
            // Check if the move caused a player to win.
            check_winner();
        }

        else
            display_message("You must play and empty cell!");
    }
}

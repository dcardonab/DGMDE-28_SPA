
/**********************************************************************/
// CLASSES

class Card {
    constructor(rank, suit, value) {
        this.rank = rank;
        this.suit = suit;
        this.value = value;
        this.visibile = true;
    }
    show_hide(bool) {
        // Switch the state of the hidden boolean property.
        this.visibile = bool;
    }
    print() {
        // Determine card color
        let c = this.suit === 'spades' || this.suit === 'clubs' || !this.visibile ? 'black' : 'red';

        // Create card string
        let s = this.visibile ? `<span class='card_text'>${this.rank}</span> <img src='media/${this.suit}.png' class='icon' />` : 'HIDDEN<br />CARD';

        return `<span class=${c}>${s}</span>`;
    }
}

class Deck {
    constructor() {
        this.create_deck();
        this.reset = false;
    }

    add_cards_to_deck(played_cards) {
        // Add played cards back to the deck pile
        // REF: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
        this.cards = this.cards.concat(played_cards);
        this.shuffle(this.cards);
        // The reset flag is used as an indicator to reset the
        // PLAYED_CARDS array.
        this.reset = true;
    }

    create_deck() {
        let ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
        let suits = ['spades', 'hearts', 'clubs', 'diamonds'];

        let cards = [];
        for (let r = 0; r < ranks.length; r++) {
            for (let s = 0; s < suits.length; s++) {
                // Generate a card and ensure that the card is not in
                // play when generating a new deck.
                // REF: https://www.w3schools.com/jsref/jsref_includes_array.asp
                let v = 0;
                if (typeof(ranks[r]) == 'number')
                    v = r + 1;
                else if (ranks[r] === 'A')
                    v = 11;
                else
                    v = 10;

                cards.push(new Card(ranks[r], suits[s], v));
            }
        }

        this.shuffle(cards);
    }

    display_cards_in_deck(cards_num=this.cards.length) {
        document.getElementById('cards_in_deck').innerHTML = "Remaining Deck Cards: " + cards_num;
    }

    draw(played_cards) {
        if (this.cards.length <= 0)
            this.add_cards_to_deck(played_cards);

        // The minus 1 is to compensate for the card that will be
        // popped in the following line.
        this.display_cards_in_deck(this.cards.length - 1);

        return this.cards.pop();
    }

    shuffle(cards) {
        // Fisher-Yates shuffle algorithm
        // REF: https://en.m.wikipedia.org/wiki/Fisher-Yates_shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            // Choose index at random
            const j = Math.floor(Math.random() * (i + 1));
            // Swap
            const temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }
        this.cards = cards;

        // Display the number of cards left in the deck.
        this.display_cards_in_deck(this.cards.length);
    }
}

class Dealer {
    constructor() {
        this.hand = [];
        this.div = document.getElementById('dealer_cards');
    }

    hand_total() {
        if (this.hand.length != 0) {
            // Sort hand so that the 'A' is considered last.
            // REF: https://www.delftstack.com/howto/javascript/sort-array-based-on-some-property-javascript/
            this.hand = this.hand.sort((a, b) => a.value - b.value);
            let sum = 0;
            // Keep track of the 'A' indices in case it is necessary to
            // verify that all As in a hand are using the minimum values.
            let a_indices = [];
            for (let i = 0; i < this.hand.length; i++) {
                let card = this.hand[i];

                // Skip dealer's hidden card
                if (!card.visibile)
                    continue;    

                // If there is an A, update the value of the card to 1
                // if the total sum exceeds 21.
                if (card.rank === 'A' && sum + card.value > 21) {
                    card.value = 1;
                    a_indices.push(i)
                }

                sum += card.value;
            }

            // Check if there is more than one A in the hand, and if
            // the total sum is greater than 21. If that is the case,
            // ensure that all As in the hand have their values set to
            // 1, and update the sum accordingly.
            if (a_indices.length > 1 && sum > 21){
                for (a in a_indices) {
                    if (this.hand[a_indices[a]].value === 11) {
                        this.hand[a_indices[a]].value = 1;
                        sum -= 10;
                        // This ensures that the value of all A cards
                        // isn't updated if unnecessary.
                        if (sum > 21)
                            break;
                    }
                }
            }

            return sum;
        }
        else {
            return 0;
        }
    }

    show_cards() {
        let card_stream = '<table><tr>';
        for (let card in this.hand) {
            // card_stream += '<div>' + this.hand[card].print() + '</div>';
            card_stream += '<td class="card">' + this.hand[card].print() + '</td>';
        }
        card_stream += '</tr></table><br />';
        card_stream += 'Total amount: ' + this.hand_total();

        this.div.innerHTML = card_stream;
    }
}

class Player extends Dealer {
    constructor() {
        super();
        this.div = document.getElementById('player_cards');
        this.wallet = new Wallet();
        this.bet = 0;
    }

    display_bet() {
        // 'replace' method in use to remove leading zeros
        // REF: https://www.codegrepper.com/code-examples/javascript/javascript+remove+leading+zeros+from+string
        document.getElementById('current_bet').innerHTML = 'Current bet: $' + this.bet.toString().replace(/^0+/, '');
    }

    double_bet() {
        this.place_bet(this.bet);
    }

    place_bet(value) {
        if (value === '0') {
            display_message('You must place a bet!')
            return false;
        }

        else if (value <= this.wallet.amount) {
            value = parseInt(value);
            this.wallet.subtract(value);
            this.bet += value;

            this.display_bet();

            return true;
        }
        
        else {
            this.wallet.insufficient_funds();
            return false;
        }
    }
}

class Wallet {
    constructor() {
        this.amount = 50;
        this.div = document.getElementById('player_wallet');
        this.display_value();
    }
    add(value) {
        this.amount += value;
        this.display_value();
    }
    subtract(value) {
        this.amount -= value;
        this.display_value();
    }
    insufficient_funds() {
        document.getElementById('messages').innerHTML = "You don't have enough funds in your wallet!<br />Please try again.";
    }
    display_value() {
        this.div.innerHTML = 'Wallet: $' + this.amount;
    }
}


/**********************************************************************/
// GAME FUNCTIONS

function check_winner() {
    let player_sum = PLAYER.hand_total();
    let dealer_sum = DEALER.hand_total();

    // The 'victory' function with a value of 'true' means that the
    // player won. A value of 'false' means that the dealer won.
    if (player_sum > 21)
        victory('dealer');
    else if (dealer_sum > 21)
        victory('player');
    else if (dealer_sum === player_sum)
        victory('tie');
    else
        victory(player_sum > dealer_sum ? 'player' : 'dealer');
}

function deal() {
    // Flush both player's hands
    if (PLAYER.hand.length != 0)
        flush_hand(PLAYER);
    if (DEALER.hand.length != 0)
        flush_hand(DEALER);

    draw(PLAYER);
    draw(DEALER, false);    // The boolean draws card hidden.
    draw(PLAYER);
    draw(DEALER);

    show_hide_element('play_options', true);
}

function draw(p, visibile=true) {
    // Hide messages.
    show_hide_element('messages', false);

    // Pass the player and the dealer in case it is necessary to
    // generate a new deck that takes into account the cards in play.
    let card = DECK.draw(PLAYED_CARDS);
    if (!visibile)
        card.show_hide(false);
    p.hand.push(card);
    p.show_cards();

    if (PLAYER.hand_total() > 21) {
        // Show hidden card
        DEALER.hand.forEach(card => card.show_hide(true));
        DEALER.show_cards();
        // Declare victory
        victory(false);
    }
}

function double_down() {
    // Make sure the player has enough to complete the double down
    if (PLAYER.wallet.amount > PLAYER.bet) {
        // A double down is a request for 1 last card and doubles the bet.
        display_message('Bet doubled!');
        PLAYER.double_bet();
        draw(PLAYER);
        stand();
    }
    else {
        show_hide_element('messages', true);
        PLAYER.wallet.insufficient_funds();
    }
}

function flush_hand(p) {
    // Revert value of A cards back to 11 when flushing.
    for (let c in p.hand) {
        if (p.hand[c].value === 1)
            c.value = 11;
    }

    if (DECK.reset){
        PLAYED_CARDS = [];
        DECK.reset = false;
    }

    PLAYED_CARDS = PLAYED_CARDS.concat(p.hand);
    p.hand = [];
    p.show_cards();
}

function place_bet() {
    // Retrieve bet from input field.
    let bet_value = document.getElementById('bet_value').value;

    // Ensure player has sufficient funds.
    let success = PLAYER.place_bet(bet_value);

    // Proceed with the game if the bet is valid.
    if (success) {
        show_hide_element('bet_div', false);
        deal();
    }
}

function play_again() {
    // Give player a new wallet and reset bet field.
    PLAYER.wallet = new Wallet();
    PLAYER.wallet.display_value();
    document.getElementById('bet_value').max = PLAYER.wallet.amount;

    // Reset bet.
    PLAYER.bet = 0;

    // Flush hands and pass all played cards into the deck.
    flush_hand(PLAYER);
    flush_hand(DEALER);
    DECK.add_cards_to_deck(PLAYED_CARDS);

    // Set UI.
    show_hide_element('current_bet', false);
    show_hide_element('messages', false);
    show_hide_element('play_again', false);
    show_hide_element('bet_div', true);
}

function stand() {
    // Hide all buttons
    show_hide_element('play_options', false);

    // Show hidden card
    DEALER.hand.forEach(card => card.show_hide(true));
    DEALER.show_cards();

    // This condition is important since the 'double_down' function
    // executes 'draw' followed by the 'stand' function. Without this
    // condition, The dealer will continue to draw even if the player's
    // draw were to result in a value over 21.
    if (PLAYER.hand_total() <= 21) {
        /* As per Vegas rules, the dealer will draw cards as long as
            * their hand's total is lesser than 17. This is not dependent
            * on the value that the player has. The player can choose to
            * stand if they think that the dealer will bust. The player's
            * actions are inconsequential to the dealer's action as
            * blackjack is generally a 1:6 game and not a 1:1 game.
            * See "The Dealer's Play" at: https://bicyclecards.com/how-to-play/blackjack/
            */ 
        while (DEALER.hand_total() < 17) {
            draw(DEALER);
        }
    }

    check_winner();
}

function victory(victor) {
    // Reset bet input field
    document.getElementById('bet_value').value = 0;
    show_hide_element('play_options', false);

    if (victor === 'player') {
        // Pay player.
        PLAYER.wallet.add(PLAYER.bet * 2);
        victory_message('Player won!<br />Place a new bet to play again!', 'bet_div');
    }
    else if (victor === 'tie') {
        // Return bet to player
        PLAYER.wallet.add(PLAYER.bet);
        victory_message('Tie!<br />Place a new bet to play again!', 'bet_div');
    }
    else {
        // Declare game over when the player has no money left.
        if (PLAYER.wallet.amount == 0)
            victory_message('Dealer won.<br />GAME OVER!', 'play_again');
        else
            victory_message('Dealer won.<br />Place a new bet to play again!', 'bet_div');
    }

    // Reset bet
    PLAYER.bet = 0;
}

function victory_message(message, element) {
    // Update max value of input field
    document.getElementById('bet_value').max = PLAYER.wallet.amount;
    display_message(message);
    // Show betting elements
    show_hide_element(element, true);
}


/**********************************************************************/
// UI AND UTILS

function add_events() {
    document.getElementById('bet').addEventListener('click', place_bet);
    document.getElementById('stand').addEventListener('click', stand);
    // To add a method as a function triggered by an event, it is
    // necessary to add it as an anonymous function. This is also the
    // case when passing parameters.
    // REF: https://stackoverflow.com/questions/696241/class-method-cant-access-properties
    document.getElementById('hit').addEventListener('click', () => draw(PLAYER));
    document.getElementById('double').addEventListener('click', double_down);
    document.getElementById('play_again').addEventListener('click', play_again);
}

display_message = (message) => {
    show_hide_element('messages', true);
    document.getElementById('messages').innerHTML = message;
};

show_hide_element = (name, show) => document.getElementById(name).style.display = show ? 'block' : 'none';

// REF: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}


/**********************************************************************/
// INIT

var PLAYER;
var DEALER;
var DECK;
var PLAYED_CARDS = [];

window.onload = () => {
    // Initialize objects
    PLAYER = new Player();
    DEALER = new Dealer();
    DECK = new Deck();

    // Init routine
    show_hide_element('play_options', false);
    show_hide_element('play_again', false);
    add_events();
}

const socket = io();
const GAME_START = '/rpc';
const GAME_WORDS = ['paper', 'rock', 'scissors'];

let messageInput = document.getElementById('message');
let messages = document.getElementById('chatMessages');
let thisUserId;

const messageIsPartOfGame = (message) => {
  let isGame = false;
  const messageContents = message.split(' ');
  
  messageContents.forEach(message => {
    if ((GAME_START === message) || GAME_WORDS.indexOf(message) > -1) {
      isGame = true;
      return;
    }
  });
  return isGame;
}

/**
 * Create new list element for message
 */
const createMessageListElement = (message, messageIsNew = false) => {
  const newListItem = document.createElement('li');
  const newSpan = document.createElement('span');
  let messages = document.getElementById('chatMessages');

  let messageData = message;
  if (messageIsNew) {
    messageData = {
      createdAt: moment(),
      message
    };
  }

  messages.appendChild(newListItem).append(messageData.message);
  $(`<span>${formatDateTimeStamp(messageData.createdAt)}</span>`).appendTo(newListItem);
}

const formatDateTimeStamp = (dateTimeStamp) => {
  const momentDateTimeStamp = moment(dateTimeStamp);
  const formmattedDate = momentDateTimeStamp.format('M/D/YY');
  const formmattedTime = momentDateTimeStamp.format('h:mmA');
  return `${formmattedDate} @ ${formmattedTime}`;
}

// Send chat message
$('form').submit(async (e) => {
  // Keep the page from reloading
  e.preventDefault();
  const message = $('#message').val();
  socket.emit('chatMessage', message);

  const isMessageGame = await messageIsPartOfGame(message);
  if (!isMessageGame) {
    await createMessageListElement(message, true);
  }

  // Reset message value
  $('#message').val('');
  return false;
});

// user started typing
messageInput.addEventListener('keypress', () => {
  socket.emit('typingStarted');
});

// user stopped typing
messageInput.addEventListener('keyup', () => {
  socket.emit('typingStopped');
});

const isWinner = (isInitiator, initiatorResult) => {
  if ((isInitiator && initiatorResult === 'winner')
  || (!isInitiator && initiatorResult !== 'winner')) {
    return true;
  }
  return false;
}

socket.on('gameKeeper', async (data) => {
  const { gameMoves, gameResults, initiatedBy, isGameStarted } = data;
  const { counterMove, initiatedMove } = gameMoves;
  const gameIsComplete = !!(counterMove && initiatedMove);

  if (isGameStarted) {
    $('.game-wrapper').css('display', 'block');
    const thisUserIsInitiator = thisUserId === initiatedBy;
    // Show text that a game has been started
    if (thisUserIsInitiator) {
      $('#waitingText').css('display', 'block');
    } else {
      $('#userId').text(initiatedBy);
      $('#initiatedText').css('display', 'block');
    }

    // game is complete
    if (gameIsComplete) {
      if (thisUserIsInitiator) {
        // made initial move
        $('#counterMove').text(`Their move: ${counterMove}`);
        $('#initiatedMove').text(`Your move: ${initiatedMove}`);
      } else {
        // made counter move
        $('#counterMove').text(`Your move: ${counterMove}`);
        $('#initiatedMove').text(`Their move: ${initiatedMove}`);
      }

      $('#initiatedText').css('display', 'none');
      $('#waitingText').css('display', 'none');

      const thisUserIsWinner = await isWinner(thisUserIsInitiator, gameResults.initiatedResult);
      if (thisUserIsWinner) {
        $('#gameResult').text('Congratulations! You won!');
      } else {
        $('#gameResult').text('Sorry. You lost.');
      }
      $('#gameResult').css('display', 'block');
      $('#resultsText').css('display', 'block');
    }
  }
});

socket.on('receivedMessage', async ({ isGameFinished, isGameStarted, message }) => {
  const isMessageGame = await messageIsPartOfGame(message);
  // Only show non-game messages here
  if (!isMessageGame && (!isGameStarted || (isGameStarted && isGameFinished))) {
    await createMessageListElement(message, true); 
  }
});

socket.on('typingStartedNotifier', () => {
  $('#typingWrap').css('display', 'block');
  $('#userTyping').text('...typing');
});

socket.on('typingStoppedNotifier', () => {
  setTimeout(() => {
    $('#typingWrap').css('display', 'none');
    $('#userTyping').text('');
  }, 1000)
});

socket.on('userTracker', ({ userId }) => {
  thisUserId = userId;
});

const app = require('./app');
const dotenv = require('dotenv');
const http = require('http').Server(app);
const io = require('socket.io')(http);

dotenv.config({ path: '.env' });

const GAME_START = '/rpc';
const GAME_WORDS = ['paper', 'rock', 'scissors'];

const gameMoves = {
  counterMove: null,
  initiatedMove: null
}
const gameResults = {
  counterResult: null,
  initiatedResult: null
}
let isGameFinished = false;
let isGameStarted = false;
let initiatedBy = null;

const gameTracker = async (message, userId) =>  {
  const messageContents = message.split(' ');
  let playerMove = null;
  let userInitiated = false;

  messageContents.forEach(message => {
    if (GAME_START === message) {
      isGameStarted = true;
      userInitiated = true;
    }
    if (GAME_WORDS.indexOf(message) > -1) {
      playerMove = message;
      if (userInitiated) {
        initiatedBy = userId;
        gameMoves.initiatedMove = playerMove;
      } else {
        gameMoves.counterMove = playerMove;
      }
    }
  });

  if (gameMoves.counterMove && gameMoves.initiatedMove) {
    isGameFinished = true;
    await getWinner(gameMoves);
  }

  return {
    gameMoves,
    gameResults,
    initiatedBy,
    isGameFinished,
    isGameStarted
  };
}

const getWinner = ({ counterMove, initiatedMove }) => {
  if (counterMove === initiatedMove) {
    gameResults.counterResult = 'draw';
    gameResults.initiatedResult = 'draw';
  }

  // default initiator to winner
  gameResults.counterResult = 'loser';
  gameResults.initiatedResult = 'winner';

  // condition if counter move wins against initiater
  switch (initiatedMove) {
    case 'rock':
        if (counterMove === 'paper') {
          gameResults.counterResult = 'winner';
          gameResults.initiatedResult = 'loser';
        }
      break;
    case 'paper':
        if (counterMove === 'scissors') {
          gameResults.counterResult = 'winner';
          gameResults.initiatedResult = 'loser';
        }
      break;
    case 'scissors':
        if (counterMove === 'rock') {
          gameResults.counterResult = 'winner';
          gameResults.initiatedResult = 'loser';
        }
      break;
  }
}

io.on('connection', socket => {
  // Initializers: userId
  const userId = socket.id;

  // Emit initializers
  io.to(socket.id).emit('userTracker', { userId });

  socket.emit('gameKeeper', { gameMoves, isGameStarted });

  // socket methods
  socket.on('chatMessage', async (message) => {
    const gameKeeperData = await gameTracker(message, userId);

    // Send to both sender and receiver
    socket.broadcast.emit('gameKeeper', gameKeeperData);
    socket.emit('gameKeeper', gameKeeperData);

    const { isGameFinished, isGameStarted } = gameKeeperData;

    socket.broadcast.emit('receivedMessage', {
      isGameFinished,
      isGameStarted,
      message
    });
  });

  socket.on('typingStarted', () => {
    socket.broadcast.emit('typingStartedNotifier');
  });

  socket.on('typingStopped', () => {
    socket.broadcast.emit('typingStoppedNotifier');
  });
});

const startServer = () => {
  app.set('host', process.env.HOSTNAME || '127.0.0.1');
  app.set('port', process.env.PORT || 3000);

  http.listen(app.get('port'), () => {
    console.log(`Chatty McChatterson is running at http://${app.get('host')}:${app.get('port')}`)
  });
}

try {
  startServer();
} catch(err) {
  console.log('An error occurred connecting: ', JSON.stringify(err));
}

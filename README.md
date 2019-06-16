# chatty-mcchatterson

A work-in-progress chat application currently built with the power of:
* [Node.js (v10+)](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [Socket.IO](https://socket.io/)

At the moment, this chat allows for:
 - two people to write messages back and forth to each other
 - two people to play one game of "Rock, Paper, Scissors"

(Yes, extremely basic).

### Run locally

Ensure Node v10+ is installed.
Next, install all dependencies, and start the server.

```sh
$ npm i
$ node ./server.js
```

Alternatively, you can start the server with [nodemon](https://nodemon.io/) (if installed).
```sh
$ nodemon ./server.js
```

Once the server is started, verify the application is up and running by connecting through a browser:

```sh
localhost:4000
```

Changes to host and port can be updated in the `.env` file.

##### Play "Rock, Paper, Scissors"

A user can play a game of "Rock, Paper, Scissors" by typing `/rpc` followed by one of three words: `rock`, `paper`, `scissors`. Another user can play by typing back one of the same three words.

*Note:* The app currently only allows for one game to be played during the start of the chat. Additionally, there is neither error handling nor allowance for these three words to be used in messages. Beware.

### Future Features

The base of this chat application be expanded by a number of features (including better UI handling, but we'll forego style for function...at least right now...).

##### User Accounts / Registration

Faux `userId`s are created with the `socket.id` of each connection. Definitely not a longstanding nor secure solution. Replace with authentication tokens that are created when a user logs into the application. In order to login to the explication, however, users need the ability to register an account with the system. Ideally, the implementation of this feature would go hand-in-hand with integrating a data-store solution.

##### Database

Depending on how expansive we want this chat application to become, the database solution may vary. At the moment, the plan is to integrate with a [Mongo](https://www.mongodb.com/) database as it is both Javascript based and quick to setup. Longterm, another NoSQL solution, such as a graph database, might better suit future endeavors.

##### Basic chat features

Many of the additional features users would likely want to see would go hand-in-hand with any database integration and API expansion. Such features may include:
 - historical chats
 - message search features
 - resource uploading and sharing

##### Game expansion

Two users can play one game of "Rock, "Paper, Scissors". For the game to be fully up and running, we would want to implement:
 - error handling (i.e. user types a capitalized word [`Paper`])
 - message handling (i.e. allow `rock`, `paper`, `scissors` to be used in messages)
 - handling when a user mistypes a word when they meant to participate in the game
 - more than one game on initialization
 - more than to users

Methods supporting this game are also defined in a manner that are not easily expandable (i.e. `isGameStarted` and `isGameFinished`). For the expansion of this game and addition of any other games, we would want to implement a much more architecturely sound and expandable platform.

##### Group chats

Users would likely also want the ability to have different chat rooms with one or more users having the ability to send messages to one single chat window. With the addition of chat rooms comes with a solution, if not already defined, of how a user may come to chat with another user. Would there be integration with contacts from another source? Would users have a specific chat handle? Would users be able to search via email, first and last name? Along with the thought of how all other features would interact with each other, there are plenty of possibilities to architect.
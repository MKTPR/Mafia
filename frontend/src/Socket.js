import socketIOClient from 'socket.io-client';

// rename the socketIOClient because eslint does not allow constructor name which starts in lower case
const socket = new socketIOClient('mafia-hands-backend-cd.herokuapp.com');
// const socket = new socketIOClient('localhost:4001');

export default socket;

// socket.js
import { io } from "socket.io-client"
import { SERVER_IP } from '../Store/.IPdata'

const socket = io(SERVER_IP, {
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default socket;

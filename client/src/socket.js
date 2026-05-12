import { io } from "socket.io-client";

export const socket = io("http://localhost:5000");
//export const socket = io(
  //process.env.REACT_APP_API_URL || "http://localhost:5000",
//);

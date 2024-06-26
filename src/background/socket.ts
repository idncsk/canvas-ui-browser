import config from '@/general/config';
import io, { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { canvasFetchContext, canvasFetchTabsForContext } from './canvas';
import index from './TabIndex';
import { setContext, updateContext } from './context';
import { sendRuntimeMessage } from './utils';
import { RUNTIME_MESSAGES, SOCKET_EVENTS } from '@/general/constants';
import { createSession, updateSessionsList } from './session';

const socketOptions: Partial<ManagerOptions & SocketOptions> = { 
  withCredentials: true,
  upgrade: false,
  secure: false,
  transports: ['websocket'],
  auth: { token: config.transport.token || "" } 
};

class MySocket {
  socket: Socket;
  constructor() {
    this.socket = io(this.connectionUri(), socketOptions).connect();
    this.initializeSocket(false);
  }

  connect() {
    this.socket = io(this.connectionUri(), socketOptions).connect();
  }

  connectionUri() {
    return `${config.transport.protocol}://${config.transport.host}:${config.transport.port}`;
  }

  reconnect() {
    if (this.socket) this.socket.disconnect();
    this.connect();
  }
  
  initializeSocket(reconn = true) {
    if(reconn) this.reconnect();
  
    this.socket.on('connect', () => {
      console.log('background.js | [socket.io] Browser Client connected to Canvas');
  
      this.sendSocketEvent(SOCKET_EVENTS.connect);

      createSession().then(() => {
        updateSessionsList();
        canvasFetchContext().then((ctx: IContext) => {
          console.log('background.js | [socket.io] Received context: ', ctx);
          updateContext(ctx);
        });
        
        updateLocalCanvasTabsData();
      });
    });
  
    this.socket.on('connect_error', (error) => {
      this.sendSocketEvent(SOCKET_EVENTS.connect_error);
      console.log(`background.js | [socket.io] Browser Connection to "${this.connectionUri()}" failed`);
      console.log("ERROR: " + error.message);
    });
    
    this.socket.on('connect_timeout', () => {
      this.sendSocketEvent(SOCKET_EVENTS.connect_timeout);
      console.log('background.js | [socket.io] Canvas Connection Timeout');
    });
  
    this.socket.on('disconnect', () => {
      this.sendSocketEvent(SOCKET_EVENTS.disconnect);
      console.log('background.js | [socket.io] Browser Client disconnected from Canvas');
    });
    
    this.socket.on('context:update', setContext);
  }

  sendSocketEvent(e: string) {
    sendRuntimeMessage({ type: RUNTIME_MESSAGES.socket_event, payload: { event: e } });
  }  

  emit(endpoint: string, ...args: any[]) {
    return this.socket.emit(endpoint, ...args);
  }

  isConnected() {
    return this.socket.connected;
  }
}

let socket: MySocket;

export const getSocket = async () => {
  await config.load();
  if(socket) return socket;
  socket = new MySocket();
  return socket;
}

export const updateLocalCanvasTabsData = () => {
  canvasFetchTabsForContext().then((res: any) => {
    if (!res || res.status !== 'success') {
      sendRuntimeMessage({ type: RUNTIME_MESSAGES.error_message, payload: 'Error fetching tabs from Canvas'}); 
      return console.log('ERROR: background.js | Error fetching tabs from Canvas');
    }
    index.insertCanvasTabArray(res.data);
  }).then(() => {
    index.updateBrowserTabs();
  });
}

export default MySocket;

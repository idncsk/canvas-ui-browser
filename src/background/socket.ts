import config from '@/general/config';
import io, { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { canvasFetchContext, canvasFetchTabsForContext } from './canvas';
import index from './TabIndex';
import { context, updateContext } from './context';
import { browserCloseNonContextTabs, browserOpenTabArray, sleep } from './utils';

const socketOptions: Partial<ManagerOptions & SocketOptions> = { 
  withCredentials: true,
  upgrade: false,
  secure: false,
  transports: ['websocket'],
  auth: { token: config.transport.token } 
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
    // this.sendSocketEvent("connecting");
    if (this.socket) this.socket.disconnect();
    this.connect();
  }
  
  initializeSocket(reconn = true) {
    if(reconn) this.reconnect();
  
    this.socket.on('connect', () => {
      console.log('background.js | [socket.io] Browser Client connected to Canvas');
  
      this.sendSocketEvent("connect");

      canvasFetchContext().then((res: any) => {
        console.log('background.js | [socket.io] Received context object: ', res.data);
        updateContext(res.data);
      });

      canvasFetchTabsForContext().then((res: any) => {
        if (!res || res.status !== 'success') return console.log('ERROR: background.js | Error fetching tabs from Canvas')
        index.insertCanvasTabArray(res.data);
      }).then(() => {
        index.updateBrowserTabs().then(() => {
          console.log('background.js | Index updated: ', index.counts());
        })
      });
  
      this.socket.emit("authenticate", { token: config.transport.token }, result => {
        if (result === 'success') {
          console.log('background.js | [socket.io] Authenticated successfully!');
          this.sendSocketEvent("authenticated");

          // on authenticate...
  
        } else {
          console.log('background.js | [socket.io] Invalid auth token! disconnecting...');
          this.sendSocketEvent("invalid_token");
          this.socket.disconnect();
        }
      });
    });
  
    this.socket.on('connect_error', (error) => {
      this.sendSocketEvent("connect_error");
      console.log(`background.js | [socket.io] Browser Connection to "${this.connectionUri()}" failed`);
      console.log("ERROR: " + error.message);
    });
    
    this.socket.on('connect_timeout', () => {
      this.sendSocketEvent("connect_timeout");
      console.log('background.js | [socket.io] Canvas Connection Timeout');
    });
  
    this.socket.on('disconnect', () => {
      this.sendSocketEvent("disconnect");
      console.log('background.js | [socket.io] Browser Client disconnected from Canvas');
    });

    this.socket.on('context:url', async (url) => {
      console.log('background.js | [socket.io] Received context URL update: ', url);
      context.url = url.payload;
    
      let res: any = await canvasFetchTabsForContext();
      await index.updateBrowserTabs();
    
      index.insertCanvasTabArray(res.data);
    
      // Automatically close existing tabs if enabled
      if (config.sync.autoCloseTabs) await browserCloseNonContextTabs();
    
      // Automatically open new canvas tabs if enabled
      if (config.sync.autoOpenTabs) await browserOpenTabArray(index.getCanvasTabArray());
    
      // Try to update the UI (might not be loaded(usually the case))
      chrome.runtime.sendMessage({ type: 'context:url', data: context.url }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(`background.js | Unable to connect to UI, error: ${chrome.runtime.lastError}`);
        } else {
          console.log('background.js | Message to UI sent successfully');
        }
      });
    
    });
  }

  sendSocketEvent(e: string) {
    chrome.runtime.sendMessage({ type: 'socket-event', data: { event: e } }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`background.js | Unable to connect to UI, error: ${chrome.runtime.lastError}`);
      } else {
        console.log('background.js | Message to UI sent successfully');
      }
    });
  }  

  emit(...args: any) {
    return this.socket.emit(args[0], args[1], args[2]);
  }

  isConnected() {
    return this.socket.connected;
  }
}

let socket: MySocket;

export const getSocket = async () => {
  await config.initialize();
  if(socket) return socket;
  socket = new MySocket();
  return socket;
}

export default MySocket;
"use strict";

const { MongoClient } = require('mongodb');
const express = require('express');
const websocket = require('ws');

// ---------------------------------------------------------------------------------------------
// 根据实际情况调整以下常量

const uri = 'mongodb://user:psw@127.0.0.1:27017/dbname?authSource=admin';

const INTERVAL_DB_RECONNECT = 1000;     // 失去与数据库连接后自动重连数据库的间隔 (ms)
const INTERVAL_STATUS_UPDATE = 1000;    // 发送状态的间隔 (ms)

const PORT_PAGE_SERVER = 8000;
const PORT_WS_SERVER = 8888;

const TEXT_DB_CONNECTING = '[数据库连接] 正在连接数据库...';
const TEXT_DB_CONNECTED = '[数据库连接] 成功连接数据库';
const TEXT_DB_CONNECTION_FAIL = '[数据库连接] 连接数据库失败!';
const TEXT_DB_CONNECTION_LOST = '[数据库连接] 失去与数据库的连接!';
const TEXT_PAGE_LISTENING = `[网页服务器] 正在监听${PORT_PAGE_SERVER}端口...`;
const TEXT_WS_LISTENING = `[WebSocket服务器] 正在监听${PORT_WS_SERVER}端口...`;

// ---------------------------------------------------------------------------------------------

const client = new MongoClient(uri);
const app = express();
let connected = false, connecting = false;

// 启动WebSocket服务器
const wss = new websocket.Server({port: PORT_WS_SERVER}, () => {
  console.log(TEXT_WS_LISTENING);
});

/**
 * 函数: updateStatus
 * 描述: 往所有的WebSocket客户端发送最新的数据库状态
 */
function updateStatus() {
  connecting = true;
  console.log(TEXT_DB_CONNECTING);

  client.connect().then(() => {
    connecting = false;
    connected = true;
    console.log(TEXT_DB_CONNECTED);

    const dyDb = client.db('dreamy');

    setInterval(() => {
      try {
        dyDb.command({ serverStatus: 1 }).then(result => {
          let newStat = {
            curr_conn: result.connections.current,
            timestamp: result.localTime.getTime(),
            b_in: result.network.bytesIn,
            b_out: result.network.bytesOut,
            cmd_cnt: result.opcounters.command,
            del_cnt: result.opcounters.delete,
            more_cnt: result.opcounters.getmore,
            ins_cnt: result.opcounters.insert,
            query_cnt: result.opcounters.query,
            update_cnt: result.opcounters.update,
            uptime: result.uptime
          };  // newStat

          wss.clients.forEach(client => {
            if (client.readyState == websocket.OPEN) {
              client.send(JSON.stringify(newStat));
            }
          }); // wss.clients.forEach

        }); // dyDb.command
      } // try
      catch (e) {
        connected = false;
        console.log(TEXT_DB_CONNECTION_LOST);
      }
    }, INTERVAL_STATUS_UPDATE); // setInterval

  }).catch(() => {
    client.close();
    connected = false;
    connecting = false;
    console.log(TEXT_DB_CONNECTION_FAIL);
  }); // catch
} // function updateStatus
updateStatus();

// 定时检查数据库连接状态. 若失去连接则重连
setInterval(() => {
  if (!connected && !connecting) {
    updateStatus();
  }
}, INTERVAL_DB_RECONNECT);

// 处理静态资源请求
app.use(express.static('public'));

// 处理404页面
app.get('*', (req, res) => {
  res.send("求求你不要乱翻! 这里没别的东西了!", 404);
});

// 启动页面服务器
app.listen(PORT_PAGE_SERVER, '0.0.0.0', () => {
  console.log(TEXT_PAGE_LISTENING);
});

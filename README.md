# mongoStat
用来监视MongoDB操作数的小服务器

后端使用node.js实现, 与客户端使用WebSockets通信以实时更新状态

弄得很简单... 就一个监视状态的东西罢了 挺轻量级的

# 使用到的东西
## 前端
- [chart.js](https://www.chartjs.org/) 负责折线图
- [jQuery](https://jquery.com/)

## 后端
- [Express](https://expressjs.com/) 作为页面服务器
- [ws](https://github.com/websockets/ws) 作为WebSockets服务器
- [MongoDB Node Driver](https://docs.mongodb.com/drivers/node/current/)

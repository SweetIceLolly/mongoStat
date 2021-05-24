$(() => {
  // 创建折线图
  const emptyLabels = [];
  const statData = {
    labels: emptyLabels,
    datasets: [
      {
        label: '数据库命令',
        backgroundColor: 'rgb(39, 144, 255)',
        borderColor: 'rgb(39, 144, 255)'
      },
      {
        label: '更新',
        backgroundColor: 'rgb(255, 165, 0)',
        borderColor: 'rgb(255, 165, 0)'
      },
      {
        label: '查询',
        backgroundColor: 'rgb(255, 99, 71)',
        borderColor: 'rgb(255, 99, 71)'
      },
      {
        label: '新建',
        backgroundColor: 'rgb(50, 150, 50)',
        borderColor: 'rgb(50, 150, 50)'
      },
      {
        label: '删除',
        backgroundColor: 'rgb(60, 179, 113)',
        borderColor: 'rgb(60, 179, 113)'
      },
      {
        label: '获取更多',
        backgroundColor: 'rgb(106, 90, 205)',
        borderColor: 'rgb(106, 90, 205)'
      }
    ]
  };

  const statConfig = {
    type: 'line',
    data: statData,
    options: {
      maintainAspectRatio: false,
      elements: {
        point: { radius: 0 }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: '数据库操作',
          padding: { top: 12, bottom: 12 },
          font: { size: 18 }
        }
      }
    }
  };

  let statChart = new Chart($('#opchart'), statConfig);

  const netLabels = [];
  const netData = {
    labels: netLabels,
    datasets: [
      {
        label: '接收',
        backgroundColor: 'blue',
        borderColor: 'blue'
      },
      {
        label: '发送',
        backgroundColor: 'red',
        borderColor: 'red'
      }
    ]
  };
  
  const netConfig = {
    type: 'line',
    data: netData,
    options: {
      maintainAspectRatio: false,
      elements: {
        point: { radius: 0 }
      },
      scales: {
        y: {
          display: true,
          title: { display: true, text: '单位: KB'}
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: '数据库网络流量',
          padding: { top: 12, bottom: 12 },
          font: { size: 18 }
        }
      }
    }
  };
  
  let netChart = new Chart($('#netchart'), netConfig);

  // -----------------------------------------------------
  // 连接服务器
  let connstatus = $('#connstatus');
  let uptime = $('#uptime');
  let cmdcnt = $('#cmdcnt');
  let cmdcnt_total = $('#cmdcnttotal');
  let updatecnt = $('#updatecnt');
  let updatecnt_total = $('#updatecnttotal');
  let querycnt = $('#querycnt');
  let querycnt_total = $('#querycnttotal');
  let inscnt = $('#inscnt');
  let inscnt_total = $('#inscnttotal');
  let delcnt = $('#delcnt');
  let delcnt_total = $('#delcnttotal');
  let morecnt = $('#morecnt');
  let morecnt_total = $('#morecnttotal');
  let conncnt = $('#conncnt');
  let netin = $('#netin');
  let netout = $('#netout');
  let prevStat, stat;

  window.WebSocket = window.WebSocket || window.MozWebSocket;
  if (!window.WebSocket) {
    connstatus.html($('<p>', { text: '您的浏览器不支持WebSocket, 无法实时获取服务器状态!'}));
    return;
  }

  let conn = new WebSocket('ws://' + location.hostname + ":8888");

  conn.onmessage = msg => {
    prevStat = stat;
    stat = JSON.parse(msg.data);
    if (prevStat === undefined)
      return;

    let deltaCmd = stat.cmd_cnt - prevStat.cmd_cnt;
    let deltaUpdate = stat.update_cnt - prevStat.update_cnt;
    let deltaQuery = stat.query_cnt - prevStat.query_cnt;
    let deltaIns = stat.ins_cnt - prevStat.ins_cnt;
    let deltaDel = stat.del_cnt - prevStat.del_cnt;
    let deltaMore = stat.more_cnt - prevStat.more_cnt;
    let serverTime = new Date(stat.timestamp);
    let uptimeDay = Math.floor(stat.uptime / 3600 / 24);
    let uptimeHour = Math.floor(stat.uptime % (3600 * 24) / 3600);
    let uptimeMin = Math.floor(stat.uptime % 3600 / 60);
    let uptimeSec = stat.uptime % 60;

    uptime.html($('<p>', { text:
      uptimeDay + '天' +
      (uptimeHour > 0 ? (('0' + uptimeHour).substr(-2) + '小时') : '') +
      (uptimeMin > 0 ? (('0' + uptimeMin).substr(-2) + '分钟') : '') +
      (uptimeSec > 0 ? (('0' + uptimeSec).substr(-2) + '秒') : '')
    }));
    cmdcnt.html($('<p>', { text: deltaCmd + '次/秒' }));
    cmdcnt_total.html($('<p>', { text: stat.cmd_cnt }));
    updatecnt.html($('<p>', { text: deltaUpdate + '次/秒' }));
    updatecnt_total.html($('<p>', { text: stat.update_cnt }));
    querycnt.html($('<p>', { text: deltaQuery + '次/秒' }));
    querycnt_total.html($('<p>', { text: stat.query_cnt }));
    inscnt.html($('<p>', { text: deltaIns + '次/秒' }));
    inscnt_total.html($('<p>', { text: stat.ins_cnt }));
    delcnt.html($('<p>', { text: deltaDel + '次/秒' }));
    delcnt_total.html($('<p>', { text: stat.del_cnt }));
    morecnt.html($('<p>', { text: deltaMore + '次/秒' }));
    morecnt_total.html($('<p>', { text: stat.more_cnt }));
    conncnt.html($('<p>', { text: '当前连接数: ' + stat.curr_conn }));

    if (statChart.data.labels.length > 60) {
      statChart.data.labels.shift();
      statChart.data.datasets[0].data.shift();
      statChart.data.datasets[1].data.shift();
      statChart.data.datasets[2].data.shift();
      statChart.data.datasets[3].data.shift();
      statChart.data.datasets[4].data.shift();
      statChart.data.datasets[5].data.shift();
    }
    let serverTimeStr = serverTime.getHours() + ':' +
      ('0' + serverTime.getMinutes()).substr(-2) + ':' +
      ('0' + serverTime.getSeconds()).substr(-2);
    statChart.data.labels.push(serverTimeStr);
    statChart.data.datasets[0].data.push(deltaCmd);
    statChart.data.datasets[1].data.push(deltaUpdate);
    statChart.data.datasets[2].data.push(deltaQuery);
    statChart.data.datasets[3].data.push(deltaIns);
    statChart.data.datasets[4].data.push(deltaDel);
    statChart.data.datasets[5].data.push(deltaMore);
    statChart.update();

    let deltaIn = (stat.b_in - prevStat.b_in) / 1024;
    let deltaOut = (stat.b_out - prevStat.b_out) / 1024;

    netin.html($('<p>', { text: '收: ' + deltaIn.toFixed(1) + 'KB/秒' }));
    netout.html($('<p>', { text: '发: ' + deltaOut.toFixed(1) + 'KB/秒' }));

    if (netChart.data.labels.length > 60) {
      netChart.data.labels.shift();
      netChart.data.datasets[0].data.shift();
      netChart.data.datasets[1].data.shift();
    }
    netChart.data.labels.push(serverTimeStr);
    netChart.data.datasets[0].data.push(deltaIn);
    netChart.data.datasets[1].data.push(deltaOut);
    netChart.update();
  };

  conn.onopen = () => {
    connstatus.hide();
  }

  let connClose = () => {
    connstatus.html($('<p>', { text: '失去连接!'}));
  };
  conn.onclose = connClose;
  conn.onerror = connClose;
});

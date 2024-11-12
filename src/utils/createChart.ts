export { createChart}

import { coordinates } from "../types/index";

function createChart(myChart: any, data: coordinates[]) {
  /* 更新 echarts 实例 */
  myChart.setOption({
    title: {
      text: '磁头运动轨迹'
    },
    tooltip: {},
    xAxis: {
      type: 'value',
      name: '磁道',
    },
    yAxis: {
      type: 'value',
      name: '访问顺序(T)'
    },
    series: [
      {
        data: [...data],
        type: 'line'
      }
    ]
  })
}
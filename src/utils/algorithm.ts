import { coordinates, createChart } from "../utils/createChart";

export {FCFS, SSTF, CSCAN, SCAN}

function FCFS(procList: any, currentTrack: any, myChart: any): number {
  let data: coordinates[] = [];
  let totalSeekTime = 0;
  // 遍历按到达时间排序后
  let sortedRequests = [...procList.value].sort(
    (a, b) => a.arriveTime - b.arriveTime
  );

  sortedRequests.forEach((request, index) => {
    data.push([request.requestTrack, index]);
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  console.log(data);

  createChart(myChart.value, data);
  return totalSeekTime / procList.value.length;
}

function SSTF(procList: any, currentTrack: any, myChart: any): number {
  let data: coordinates[] = [];
  let order: number = 0;
  let totalSeekTime = 0;
  let remainingRequests = [...procList.value];

  while (remainingRequests.length > 0) {
    let closestRequest = remainingRequests.reduce((closest, current) => {
      const closestDistance = Math.abs(
        closest.requestTrack - currentTrack.value
      );
      const currentDistance = Math.abs(
        current.requestTrack - currentTrack.value
      );
      return currentDistance < closestDistance ? current : closest;
    });
    data.push([closestRequest.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(closestRequest.requestTrack - currentTrack.value);
    currentTrack.value = closestRequest.requestTrack;
    remainingRequests = remainingRequests.filter(
      (req) => req !== closestRequest
    ); // 移除已处理的请求
  }
  console.log(data);

  createChart(myChart.value, data);
  return totalSeekTime / procList.value.length;
}

function SCAN(procList: any, currentTrack: any, myChart: any): number {
  let data: coordinates[] = [];
  let order: number = 0;
  let totalSeekTime = 0;
  // 按请求轨道排序
  let sortedRequests = [...procList.value].sort(
    (a, b) => a.requestTrack - b.requestTrack
  );
  let leftRequests = sortedRequests.filter(
    (req) => req.requestTrack < currentTrack.value
  );
  let rightRequests = sortedRequests.filter(
    (req) => req.requestTrack >= currentTrack.value
  );
  // 先处理右边的请求
  rightRequests.forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  // 然后处理左边的请求（倒序）
  leftRequests.reverse().forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  console.log(data);

  createChart(myChart.value, data);
  return totalSeekTime / procList.value.length;
}

function CSCAN(procList: any, currentTrack: any, myChart: any): number {
  let totalSeekTime = 0;
  let data: coordinates[] = [];
  let order: number = 0;
  // 按请求轨道排序
  let sortedRequests = [...procList.value].sort(
    (a, b) => a.requestTrack - b.requestTrack
  );
  let rightRequests = sortedRequests.filter(
    (req) => req.requestTrack >= currentTrack.value
  );
  let leftRequests = sortedRequests.filter(
    (req) => req.requestTrack < currentTrack.value
  );
  // 先处理右边的请求
  rightRequests.forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  // 到达磁盘最远端后，跳回磁盘的最开始位置
  totalSeekTime += currentTrack.value; // 从当前磁道回到磁道 0
  currentTrack.value = 0;
  data.push([currentTrack.value, order]);
  // 然后处理左边的请求
  leftRequests.forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  console.log(data);

  createChart(myChart.value, data);
  return totalSeekTime / procList.value.length;
}
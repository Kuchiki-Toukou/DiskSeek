<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTransition, TransitionPresets } from "@vueuse/core";
import { ProcessRequest, coordinates } from "./types/index.ts";
import { createChart } from "./utils/createChart";
import * as echarts from "echarts";

let averageSeekTime = ref<number>(0);
let choice = ref<string>("FCFS");
/* vueUse 给数字加动效 */
const AniAverageSeekLength = useTransition(averageSeekTime, {
  duration: 400,
  transition: TransitionPresets.easeInExpo,
});
/* Echarts.js 初始化 */
const graph = ref(null);
let myChart = ref<any>(null);
onMounted(() => {
  myChart.value = echarts.init(graph.value, "dark");
  createChart(myChart.value, [[0, 0]]);
});

let initTrack = ref<number>(50);
/* 响应式数据 */
let procNum = ref<number>(0);
let procList = ref<ProcessRequest[]>([]);
let currentTrack = ref<number>(0);
function createIORequestQueue() {
  procList.value = [];
  for (let i = 0; i < procNum.value; i++) {
    const pId = i + 1;
    const requestTrack = Math.floor(Math.random() * 100); // 假设磁道号为0到99
    const arriveTime = Math.floor(Math.random() * 1000); // 到达时间随机
    procList.value.push({ pId, requestTrack, arriveTime });
  }
  currentTrack.value = initTrack.value;
  discSeek();
}

function discSeek() {
  currentTrack.value = initTrack.value;
  switch (choice.value) {
    case "FCFS":
      FCFS();
      break;
    case "SSTF":
      SSTF();
      break;
    case "SCAN":
      SCAN();
      break;
    case "C-SCAN":
      CSCAN();
      break;
  }
}
function FCFS() {
  let data: coordinates[] = []; // 画图所需的坐标点集
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
  if (data.length !== 0) {
    createChart(myChart.value, data);
    averageSeekTime.value = totalSeekTime / procList.value.length;
  }
}

function SSTF() {
  let data: coordinates[] = [];
  let order: number = 0;
  let totalSeekTime = 0;
  let remainingRequests = [...procList.value];

  while (remainingRequests.length > 0) {
    // 获得请求磁道同 currentTrack 最近的元素
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
    // 移除已处理的请求
    remainingRequests = remainingRequests.filter(
      (req) => req !== closestRequest
    );
  }
  if (data.length !== 0) {
    createChart(myChart.value, data);
    averageSeekTime.value = totalSeekTime / procList.value.length;
  }
}

function SCAN() {
  let data: coordinates[] = [];
  let order: number = 0;
  let totalSeekTime = 0;
  // 按请求轨道排序
  let sortedRequests = [...procList.value].sort(
    (a, b) => a.requestTrack - b.requestTrack
  );
  // 以当前磁头为界分为左右部分
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
  if (data.length !== 0) {
    createChart(myChart.value, data);
    averageSeekTime.value = totalSeekTime / procList.value.length;
  }
}

function CSCAN() {
  let totalSeekTime = 0;
  let data: coordinates[] = [];
  let order: number = 0;
  let sortedRequests = [...procList.value].sort(
    (a, b) => a.requestTrack - b.requestTrack
  );
  let rightRequests = sortedRequests.filter(
    (req) => req.requestTrack >= currentTrack.value
  );
  let leftRequests = sortedRequests.filter(
    (req) => req.requestTrack < currentTrack.value
  );
  // 处理右边请求
  rightRequests.forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  // 到达磁盘最远端后，跳回磁道0
  totalSeekTime += currentTrack.value;
  currentTrack.value = 0;
  data.push([currentTrack.value, order]);
  // 然后处理左边的请求
  leftRequests.forEach((request) => {
    data.push([request.requestTrack, order]);
    order++;
    totalSeekTime += Math.abs(request.requestTrack - currentTrack.value);
    currentTrack.value = request.requestTrack;
  });
  if (data.length !== 0) {
    createChart(myChart.value, data);
    averageSeekTime.value = totalSeekTime / procList.value.length;
  }
}
</script>

<template>
  <!-- 上半部 -->
  <h2>请求队列</h2>
  <div class="process">
    <div class="setting">
      <label>
        <ElText size="large" tag="b">请求进程数：</ElText><br />
        <ElInputNumber v-model="procNum" :max="50" :min="1" />
      </label>
      <label>
        <ElText size="large" tag="b">磁头初始所在磁道：</ElText><br />
        <ElSlider v-model="initTrack" :max="99" :min="0" />
      </label>
      <ElButton @click="createIORequestQueue()" type="primary" round>
        <ElText tag="b">生成队列</ElText>
      </ElButton>
    </div>
    <hr />
    <div class="show-list">
      <ElText type="primary" tag="b" size="large"> 请求队列元素： </ElText>
      <ElScrollbar max-height="500px">
        <TransitionGroup name="el-zoom-in-center">
          <div v-for="proc in procList" v-if="procList.length" class="infoItem">
            <ElText type="info" tag="b">PID:{{ proc.pId }}</ElText
            ><br />
            <ElText type="info" tag="b"
              >请求磁道号：{{ proc.requestTrack }}</ElText
            ><br />
            <ElText type="info" tag="b"
              >进程到达时间：{{ proc.arriveTime }}</ElText
            >
          </div>
        </TransitionGroup>
      </ElScrollbar>
    </div>
  </div>
  <!-- 下半部 -->
  <h2>磁盘调度算法</h2>
  <div class="disk">
    <label class="choice">
      <ElText size="large" tag="b">选择策略:</ElText>
      <ElRadioGroup v-model="choice" @change="discSeek">
        <ElRadioButton label="FCFS" value="FCFS" />
        <ElRadioButton label="SSTF" value="SSTF" />
        <ElRadioButton label="SCAN" value="SCAN" />
        <ElRadioButton label="C-SCAN" value="C-SCAN" />
      </ElRadioGroup>
    </label>
    <ElText size="large" tag="b" type="primary"
      >算法平均寻道长度：{{ AniAverageSeekLength.toFixed(2) }}</ElText
    ><br />
    <div
      ref="graph"
      style="width: 400px; height: 400px; box-shadow: 0 0 8px white"
    ></div>
  </div>
</template>

<style scoped>
.setting {
  display: flex;
  flex-flow: column;
  gap: 30px;
}

.process {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: black;
  border: 2px solid black;
  border-radius: 20px;
  box-shadow: var(--el-box-shadow-dark);
  transition: all 1s;
}

.process:hover,
.disk:hover {
  box-shadow: 0 0 30px lightskyblue;
}

.infoItem {
  box-shadow: 0 0 8px lightgray;
  border: 2px dashed lightgray;
  border-radius: 20px;
  margin: 5px;
  padding: 5px;
}

/*  */
.disk {
  display: flex;
  flex-flow: column;
  gap: 20px;
  padding: 20px;
  background-color: black;
  border: 2px solid black;
  border-radius: 20px;
  box-shadow: var(--el-box-shadow-dark);
  transition: all 1s;
}

.choice {
  display: flex;
  gap: 10px;
}
</style>

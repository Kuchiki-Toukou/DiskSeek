export {type ProcessRequest, type coordinates}
interface ProcessRequest {
  pId: number;
  requestTrack: number;
  arriveTime: number;
}
type coordinates = [
  x: number,
  y: number
]

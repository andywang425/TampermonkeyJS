interface sypderData {
  id: string,
  device: string,
  ets: number,
  benchmark: string,
  time: number,
  ts: number,
  ua: string,
}

interface BagList {
  code: number
  message: string
  ttl: number
  data: BagListData
}
interface BagListData {
  list: BagListDataList[]
  time: number
}
interface BagListDataList {
  bag_id: number
  gift_id: number
  gift_name: string
  gift_num: number
  gift_type: number
  expire_at: number
  corner_mark: string
  corner_color: string
  bind_roomid: number
  bind_room_text: string
  type: number
  card_image: string
  card_gif: string
  card_id: number
  card_record_id: number
  is_show_send: boolean
}

interface Medal {
  code: number
  msg: string
  message: string
  data: MedalData
}
interface MedalData {
  medalCount: number
  count: number
  fansMedalList: MedalDataFansMedalList[]
  name: string
}
interface MedalDataFansMedalList {
  uid: number
  target_id: number
  medal_id: number
  score: number
  level: number
  intimacy: number
  status: number
  source: number
  receive_channel: number
  is_receive: number
  master_status: number
  receive_time: string
  today_intimacy: number
  last_wear_time: number
  is_lighted: number
  medal_level: number
  next_intimacy: number
  day_limit: number
  medal_name: string
  master_available: number
  guard_type: number
  lpl_status: number
  can_delete: boolean
  target_name: string
  target_face: string
  live_stream_status: number
  icon_code: number
  icon_text: string
  rank: string
  medal_color: number
  medal_color_start: number
  medal_color_end: number
  guard_level: number
  medal_color_border: number
  today_feed: number
  todayFeed: number
  dayLimit: number
  uname: string
  color: number
  medalName: string
  roomid: number
}

interface RoomInfo {
  code: number
  message: string
  ttl: number
  data: RoomInfoData
}
interface RoomInfoData {
  room_info: RoomInfoDataRoomInfo
}
interface RoomInfoDataRoomInfo {
  uid: number
  room_id: number
  short_id: number
  title: string
  cover: string
  tags: string
  background: string
  description: string
  live_status: number
  live_start_time: number
  live_screen_type: number
  lock_status: number
  lock_time: number
  hidden_status: number
  hidden_time: number
  area_id: number
  area_name: string
  parent_area_id: number
  parent_area_name: string
  keyframe: string
  special_type: number
  up_session: string
  pk_status: number
  is_studio: boolean
  on_voice_join: number
  online: number
  room_type: { [key: string]: number }
}

interface WebHeartBeat {
  code: number
  message: string
  ttl: number
  data: WebHeartBeatData
}
interface WebHeartBeatData {
  next_interval: number
}

interface E {
  code: number
  message: string
  ttl: number
  data: EData
}
interface EData {
  timestamp: number
  heartbeat_interval: number
  secret_key: string
  secret_rule: number[]
  patch_status: number
}


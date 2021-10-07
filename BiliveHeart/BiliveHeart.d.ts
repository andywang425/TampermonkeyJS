interface sypderData {
  id: string,
  device: string,
  ets: number,
  benchmark: string,
  time: number,
  ts: number,
  ua: string,
}

interface patchData extends sypderData {
  s: string
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
  pageinfo: {
    totalpages: number
    curPage: number
  }
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
  msg: string
  message: string
  data: RoomInfoData
}
interface RoomInfoData {
  uid: number
  room_id: number
  short_id: number
  attention: number
  online: number
  is_portrait: boolean
  description: string
  live_status: number
  area_id: number
  parent_area_id: number
  parent_area_name: string
  old_area_id: number
  background: string
  title: string
  user_cover: string
  keyframe: string
  is_strict_room: boolean
  live_time: string
  tags: string
  is_anchor: number
  room_silent_type: string
  room_silent_level: number
  room_silent_second: number
  area_name: string
  pendants: string
  area_pendants: string
  hot_words: string[]
  hot_words_status: number
  verify: string
  up_session: string
  pk_status: number
  pk_id: number
  battle_id: number
  allow_change_area_time: number
  allow_upload_cover_time: number
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


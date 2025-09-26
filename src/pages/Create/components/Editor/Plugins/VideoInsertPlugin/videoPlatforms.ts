export interface VideoPlatform {
  value: string;
  label: string;
  pattern: string;
  example: string;
}
// 视频平台配置，包含平台标识、显示名称和嵌入URL模板
export const VIDEO_PLATFORMS: VideoPlatform[] = [
  {
    value: 'douyin',
    label: '抖音',
    pattern: 'https://open.douyin.com/player/video?vid={{id}}&autoplay=0',
    example: 'https://open.douyin.com/player/video?vid=abc123 中的 "abc123"'
  },
  {
    value: 'youtube',
    label: 'YouTube',
    pattern: 'https://www.youtube.com/embed/{{id}}',
    example: '视频链接: https://www.youtube.com/watch?v=abc123 中的 "abc123"'
  },
  {
    value: 'bilibili',
    label: '哔哩哔哩',
    pattern: 'https://player.bilibili.com/player.html?bvid={{id}}&high_quality=1',
    example: '视频链接: https://www.bilibili.com/video/BV12345 中的 "BV12345"'
  },
  {
    value: 'tencent',
    label: '腾讯视频',
    pattern: 'https://v.qq.com/iframe/player.html?vid={{id}}&tiny=0&auto=0',
    example: '视频链接: https://v.qq.com/x/cover/abc123.html 中的 "abc123"'
  },
  {
    value: 'youku',
    label: '优酷视频',
    pattern: 'https://player.youku.com/embed/{{id}}',
    example: '视频链接: https://v.youku.com/v_show/id_Xabc123.html 中的 "Xabc123"'
  },
  {
    value: 'netease',
    label: '网易云音乐',
    pattern: 'https://music.163.com/outchain/player?type=2&id={{id}}&auto=1&height=320',
    example: '视频链接: https://music.163.com/#/mv?id=123456 中的 "123456"'
  },
  {
    value: 'custom',
    label: '自定义视频',
    pattern: '',
    example: '完整的视频嵌入URL或视频地址'
  }
];

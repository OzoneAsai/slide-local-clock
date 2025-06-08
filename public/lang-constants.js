const supportedLangs = ['zh-CN','zh-TW','en-US','ja-JP','ko-KR'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = supportedLangs;
}
if (typeof window !== 'undefined') {
  window.supportedLangs = supportedLangs;
}

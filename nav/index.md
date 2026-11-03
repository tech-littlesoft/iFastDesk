---
layout: nav
title: iFastDesk 导航 · 小迅桌面站
permalink: /
---

<section class="nav-hero">
  <h1>iFastDesk 导航</h1>
  <p class="en">iFastDesk Navigation · 小迅桌面站</p>
</section>

<form id="navSearch" class="nav-search" action="https://www.baidu.com/s" method="get" target="_blank">
  <input type="text" id="navQ" name="wd" placeholder="搜索，或直接访问下方常用网站" aria-label="搜索" />
  <button type="submit">搜索</button>
</form>
<div class="nav-engines">
  <label><input type="radio" name="engine" value="baidu" checked /> 百度</label>
  <label><input type="radio" name="engine" value="google" /> 谷歌</label>
  <label><input type="radio" name="engine" value="bing" /> 必应</label>
</div>

<div class="nav-groups">
  <div class="nav-group">
    <h3>产品</h3>
    <ul>
      <li><a href="{{ '/app/' | relative_url }}">产品介绍</a></li>
      <li><a href="{{ '/app/guide/' | relative_url }}">使用指南</a></li>
      <li><a href="{{ '/app/buy/' | relative_url }}">升级 Pro</a></li>
      <li><a href="{{ '/app/activate/' | relative_url }}">激活订阅</a></li>
      <li><a href="{{ '/app/privacy/' | relative_url }}">隐私说明</a></li>
    </ul>
  </div>
  <div class="nav-group">
    <h3>常用</h3>
    <ul>
      <li><a href="https://www.baidu.com" target="_blank" rel="noopener">百度</a></li>
      <li><a href="https://www.zhihu.com" target="_blank" rel="noopener">知乎</a></li>
      <li><a href="https://www.bilibili.com" target="_blank" rel="noopener">哔哩哔哩</a></li>
      <li><a href="https://weibo.com" target="_blank" rel="noopener">微博</a></li>
      <li><a href="https://www.taobao.com" target="_blank" rel="noopener">淘宝</a></li>
      <li><a href="https://www.jd.com" target="_blank" rel="noopener">京东</a></li>
      <li><a href="https://mail.163.com" target="_blank" rel="noopener">网易邮箱</a></li>
      <li><a href="https://mail.qq.com" target="_blank" rel="noopener">QQ 邮箱</a></li>
    </ul>
  </div>
  <div class="nav-group">
    <h3>影音</h3>
    <ul>
      <li><a href="https://v.qq.com" target="_blank" rel="noopener">腾讯视频</a></li>
      <li><a href="https://www.iqiyi.com" target="_blank" rel="noopener">爱奇艺</a></li>
      <li><a href="https://www.youku.com" target="_blank" rel="noopener">优酷</a></li>
      <li><a href="https://music.163.com" target="_blank" rel="noopener">网易云音乐</a></li>
      <li><a href="https://www.douyin.com" target="_blank" rel="noopener">抖音</a></li>
    </ul>
  </div>
  <div class="nav-group">
    <h3>资讯</h3>
    <ul>
      <li><a href="https://s.weibo.com/top/summary" target="_blank" rel="noopener">微博热搜</a></li>
      <li><a href="https://www.zhihu.com/hot" target="_blank" rel="noopener">知乎热榜</a></li>
      <li><a href="https://36kr.com" target="_blank" rel="noopener">36 氪</a></li>
      <li><a href="https://sspai.com" target="_blank" rel="noopener">少数派</a></li>
    </ul>
  </div>
  <div class="nav-group">
    <h3>开发者</h3>
    <ul>
      <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
      <li><a href="https://stackoverflow.com" target="_blank" rel="noopener">Stack Overflow</a></li>
      <li><a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN</a></li>
      <li><a href="https://juejin.cn" target="_blank" rel="noopener">掘金</a></li>
      <li><a href="https://www.runoob.com" target="_blank" rel="noopener">菜鸟教程</a></li>
    </ul>
  </div>
  <div class="nav-group">
    <h3>工具</h3>
    <ul>
      <li><a href="https://fanyi.baidu.com" target="_blank" rel="noopener">百度翻译</a></li>
      <li><a href="https://www.kuaidi100.com" target="_blank" rel="noopener">快递查询</a></li>
      <li><a href="https://www.weather.com.cn" target="_blank" rel="noopener">天气</a></li>
      <li><a href="https://www.ip138.com" target="_blank" rel="noopener">IP 查询</a></li>
    </ul>
  </div>
</div>

<script>
  document.querySelectorAll('input[name=engine]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (!r.checked) return;
      var f = document.getElementById('navSearch');
      var q = document.getElementById('navQ');
      if (r.value === 'baidu') { f.action = 'https://www.baidu.com/s'; q.name = 'wd'; }
      if (r.value === 'google') { f.action = 'https://www.google.com/search'; q.name = 'q'; }
      if (r.value === 'bing') { f.action = 'https://www.bing.com/search'; q.name = 'q'; }
    });
  });
</script>

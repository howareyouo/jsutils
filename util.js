/*
 * Util functions
 * Created by Nandy on 2017/1/17.
 */
var util = {

  queryParam: function (name) {
    var param = {}
    location.search.substr(1).split("&").forEach(function (part) {
      var arr = part.split("=")
      arr[0] && (param[arr[0]] = decodeURIComponent(arr[1] || ''))
    })
    return name ? param[name] : param
  },

  /* returns duration from millisecends in hh:mm:ss format */
  format: function (secends, millis) {
    if (!secends) return ''
    secends = millis ? Math.floor(secends / 1000) : secends
    var hou = Math.floor(secends / 3600),
        min = Math.floor(secends % 3600 / 60),
        sec = Math.floor(secends % 60);

    hou = hou ? hou + ':' : '';
    return hou + hou ? pad(min) : min + ':' + pad(sec)
  },

  pad: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  timepast: function (timestamp) {
    var unit_minute = 60,
        unit_hour = unit_minute * 60,
        unit_day = unit_hour * 24,
        unit_month = unit_day * 30,
        unit_year = unit_month * 12,
        diff = (new Date().getTime() - timestamp) / 1000
    if (diff < 60) return Math.abs(Math.ceil(diff)) + '秒前'
    var year = parseInt(diff / unit_year)
    if (year > 0) return year + '年前'
    var month = parseInt(diff / unit_month)
    if (month > 0) return month + '个月前'
    var week = parseInt(diff / (unit_day * 7))
    if (week > 0) return week + '周前'
    var days = parseInt(diff / unit_day)
    if (days > 0) return days + '天前'
    var hours = parseInt(diff / unit_hour)
    if (hours > 0) return hours + '小时前'
    var minites = parseInt(diff / unit_minute)
    if (minites > 0) return minites + '分钟前'
  },

  openApp: function (page) {
    var scheme = 'xuehu://app/page/' + (page ? encodeURIComponent(page) : ''),
        device = util.device

    // 尝试通过iframe方式唤醒APP，若能正常唤醒，会切换到APP并阻止后续代码的执行
    var iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = scheme
    document.body.appendChild(iframe)
    setTimeout(function () {
      document.body.removeChild(iframe)
    }, 300)

    if (device.isWeixin) {
      return top.location = '/views/openapp.jsp?wx=1&scheme=' + scheme
    }

    // ios9以后不支持iframe跳转，打开专用跳转页面
    if (device.ios) {
      return top.open('/views/openapp.jsp?scheme=' + scheme)
    }

    // 没有安装APP，转到下载
    this.downloadApp()
  },

  downloadApp: function () {
    var device = util.device,
        fallback_url = '/'
    if (device.isWeixin)
      fallback_url = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xuehu365.xuehu'
    else if (device.ios)
      fallback_url = 'https://itunes.apple.com/cn/app/id1114733646?mt=8'
    else if (device.android)
      fallback_url = 'http://down.xuehu365.com/xuehu365.apk'
    console.log(fallback_url)
    top.location.href = fallback_url
  },

  /* Device/OS Detection */
  device: (function () {
    var ua = navigator.userAgent
    var device = {}

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/)
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/)
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/)
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/)

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false

    // Android
    if (android) {
      device.os = 'android'
      device.osVersion = android[2]
      device.android = true
      device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0
    }
    if (ipad || iphone || ipod) {
      device.os = 'ios'
      device.ios = true
    }
    // iOS
    if (iphone && !ipod) {
      device.osVersion = iphone[2].replace(/_/g, '.')
      device.iphone = true
    }
    if (ipad) {
      device.osVersion = ipad[2].replace(/_/g, '.')
      device.ipad = true
    }
    if (ipod) {
      device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null
      device.iphone = true
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
      if (device.osVersion.split('.')[0] === '10') {
        device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0]
      }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i)

    // keng..
    device.isWeixin = /MicroMessenger/i.test(ua)

    device.isHyber = /xuehu/i.test(ua)

    return device
  })(),

  getUserInfo: function (key) {
    var cookie_name = 'UserInfo', userinfo_string
    if (window.localStorage) {
      userinfo_string = localStorage.getItem(cookie_name)
    }
    if (!userinfo_string) {
      userinfo_string = this.getCookie(cookie_name)
    }
    if (userinfo_string && userinfo_string != 'undefined') {
      var info = JSON.parse(userinfo_string)
      if (key && info[key]) {
        return info[key]
      }
      if (!info.headImg) {
        return $.get('/user/info?userId=' + info.userId).then(function (response) {
          if (!response.data.headImg) {
            response.data.headImg = 'http://static.xuehu365.com/admin/image/2Pq0yoZE.png'
          }
          window.localStorage && localStorage.setItem(cookie_name, JSON.stringify(response.data))
        })
      }
      return info
    }
  },

  /*
   options = {
   title: document.title,             // 分享标题
   desc: data.summary || this.title,  // 分享描述
   link: location.href,               // 分享链接
   type: 'link',                      // 分享类型: music、video或link，默认为link
   imgUrl: 'img/share.jpg',        // 分享图标
   dataUrl: '',                       // 如果type是music或video，则要提供数据链接，默认为空
   success: function () {  },         // 用户确认分享后执行的回调函数
   cancel: function () { }            // 用户取消分享后执行的回调函数
   }
   */
  weixinShare: function (options) {
    if (!this.device.isWeixin) return
    $.get('/weixin/get_weixin_js_sign?sUrl=' + location.href).then(function (response) {
      wx.config({
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
        timestamp: response.data.timestamp,
        nonceStr: response.data.noncestr,
        signature: response.data.sign,
        appId: response.data.appid
      })
      wx.ready(function () {
        wx.onMenuShareAppMessage(options)
        wx.onMenuShareTimeline(options)
      })
      wx.error(function (res) {
        console.log('error', res)
      })
    })
  },

  shareToWeibo: function (options) {
    var url = 'http://service.weibo.com/share/share.php?'
    url += 'url=' + encodeURIComponent(options.link)
    url += '&title=' + encodeURIComponent(options.title)
    url += '&pic=' + encodeURIComponent(options.imgUrl)
    url += '&site=' + encodeURIComponent(options.link)
    location.href = url
  },

  getCookie: function (name) {
    var cookie = document.cookie,
        cname = encodeURIComponent(name) + '=',
        start = cookie.indexOf(cname),
        cvalue = ''
    if (start > -1) {
      var end = cookie.indexOf(';', start)
      if (end == -1) end = cookie.length
      cvalue = decodeURIComponent(cookie.substring(start + cname.length, end))
    }
    return cvalue
  },

  /**
   * auto toggle class on element during scrolling
   *
   * @param element target element, eg: header/#header/.header
   * @param toggleClass css class that controls the element visibility
   */
  headerAutoHiding: function (element, toggleClass) {
    if (this.device.isHyber) return
    element = document.querySelector(element)
    var lastScrollY = 0, timer
    window.addEventListener('scroll', function () {
      clearTimeout(timer)
      timer = setTimeout(function () {
        var top = window.scrollY || window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop
        var dis = top - lastScrollY
        if (top <= 56 || dis < -10) element.classList.add(toggleClass)
        else if (dis > 10) element.classList.remove(toggleClass)
        lastScrollY = top
      }, 18)
    }, false)
  },

  argumentsAsObject: function (func, args) {
    return func.toString().match(/\(([^)]*)\)?/)[1]     // Match everything inside the function argument parens.
        .replace(/\/\*.*\*\//g, '')                     // Ensure no inline comments are parsed
        .split(',')                                     // Split the arguments string into an array comma delimited
        .map(function (arg) {                           // Split the ES6 default parameter into an array
          var arr = arg.split('=')
          return [arr[0].trim(), arr[1] ? eval(arr[1].trim()) : undefined]
        })
        .reduce(function (prev, curr, index, arr) {     // Construct each pair into a object
          prev[curr[0]] = args ? args[index] : curr[1]
          return prev
        }, {})
  },

  /**
   * Returns a function, that, as long as it continues to be invoked,
   * will not be triggered. The function will be called after it
   * stops being called for N milliseconds.
   * If immediate is passed, trigger the function on the leading edge,
   * instead of the trailing.
   * Copy from Underscore.js 1.8.3
   */
  debounce: function (func, wait, immediate) {
    var timeout, args, context, timestamp, result

    var delayed = function () {
      var last = new Date().getTime() - timestamp

      if (last < wait && last >= 0) {
        timeout = setTimeout(delayed, wait - last)
      } else {
        timeout = null
        if (!immediate) {
          result = func.apply(context, args)
          context = args = null
        }
      }
    }
    return function () {
      context = this
      args = arguments
      timestamp = new Date().getTime()
      var callnow = immediate && !timeout
      if (!timeout) timeout = setTimeout(delayed, wait)
      if (callnow) {
        result = func.apply(context, args)
        context = args = null
      }
      return result
    }
  }
}

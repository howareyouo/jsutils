/* get query param from location.search */
function queryParam(name) {
  var param = {}
  location.search.substr(1).split("&").forEach(function (part) {
    var arr = part.split("=")
    arr[0] && (param[arr[0]] = decodeURIComponent(arr[1] || ''))
  })
  return name ? param[name] : param
}

/* padding leading zero */
function pad(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
},

/* returns duration from millisecends in hh:mm:ss format */
function (secends, millis) {
  if (!secends) return ''
  secends = millis ? Math.floor(secends / 1000) : secends
  var hou = Math.floor(secends / 3600),
      min = Math.floor(secends % 3600 / 60),
      sec = Math.floor(secends % 60);

  hou = hou ? hou + ':' : '';
  return hou + hou ? pad(min) : min + ':' + pad(sec)
}

/* calculate time past from now on */
function timepast(timestamp) {
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
}

function filesize(bytes) {
  var size = bytes / 1024, 
      unit = 'KB'
  if (size > 1024) {
    size = size / 1024
    unit = 'MB'
  }
  return Number(size.toFixed(2)) + unit
}

/* open app in webpage */
function openApp() {
  var iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = 'xuehu://app'
  document.body.appendChild(iframe) // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并阻止后续代码的执行
  setTimeout(function () {
    document.body.removeChild(iframe)
  }, 500)

  // 没有打开APP，进行网页跳转
  var device = this.device, fallback_url = '/'

  if (device.isWeixin)
    fallback_url = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xuehu365.xuehu'
  else if (device.ios)
    fallback_url = 'https://itunes.apple.com/cn/app/id1114733646?mt=8'
  else if (device.android)
    fallback_url = 'http://down.xuehu365.com/xuehu365.apk'

  top.location.href = fallback_url
}

/* Device/OS Detection */
var device = (function () {
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
})()

/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it
 * stops being called for N milliseconds.
 * If immediate is passed, trigger the function on the leading edge,
 * instead of the trailing.
 * Copy from Underscore.js 1.8.3
 */
function debounce(func, wait, immediate) {
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

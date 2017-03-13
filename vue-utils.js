// 隐藏/展开行数 指令
Vue.directive('linelimit', {
  componentUpdated: function (el, binding) {
    if (!el.innerHTML) return
    var $el = $(el),
        line = binding.value || 3,
        expander = binding.modifiers.expander,
        lineHeight = parseInt($el.css('lineHeight')),
        height = $el.height()
    $el.css({'max-height': lineHeight * line, 'overflow': 'hidden'})
    if (expander) {
      var lines = Math.round(height / lineHeight)
      if (lines > line && expander) {
        $('<small class="text-primary mt-1 pointer">展开全部↓</small>').click(function () {
          $el.css('max-height', '100%')
          $(this).remove()
          return false
        }).insertAfter($el)
      }
    }
  }
})

// 评论功能区(textare高度自动增长、功能按钮自动隐藏)
Vue.component('comment', {
  template: '<div>\
               <textarea ref="textarea" class="comment-area" v-model="comment" :placeholder="placeholder" @input="updateValue" @focus="focus" rows="1" maxlength="140"></textarea>\
               <div class="text-right mt-1" v-show="buttons">\
                 <button class="comment-button text-grey bg-grey lt" @click="cancel">取消</button>\
                 <button class="comment-button text-danger b-eee" @click="publish">发表</button>\
               </div>\
             </div>',
  props: ['placeholder', 'allow', 'target'],
  data: function () {
    return {
      comment: '',
      buttons: 0
    }
  },
  computed: {
    at: function () {
      return this.target ? '@' + this.target.userName + ' ' : ''
    }
  },
  mounted: function () {
    var el = this.$refs.textarea
    var border = getComputedStyle(el, null).getPropertyValue('border')
    var width = border.split(' ')[0]
    this.borderWidth = parseInt(width)
  },
  methods: {
    updateValue: function () {
      var el = this.$refs.textarea
      el.style.height = 'auto'
      this.comment && (el.style.height = el.scrollHeight + this.borderWidth * 2 + 'px')
    },
    focus: function () {
      if (!this.allow) {
        return this.$emit('publish', this.comment, this.allow)
      }
      this.buttons = 1
    },
    cancel: function () {
      this.comment = ''
      this.updateValue()
      this.buttons = 0
      this.$refs.textarea.blur()
    },
    publish: function () {
      var target = this.target
      if (this.comment.indexOf(this.at) != 0) {
        target = 0
      }
      this.$emit('publish', this.comment.replace(this.at, ''), this.allow, target)
      this.cancel()
    }
  },
  watch: {
    target: function (val) {
      this.comment = this.at
      this.$refs.textarea.focus()
    }
  }
})

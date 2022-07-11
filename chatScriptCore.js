// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.taika-chat-menu')) {
    $("#taika-chat-menu-list").hide();
  }
}

var EmbedTaikaChatUI = EmbedTaikaChatUI || (function () {
  return {
    init: function () {
      this.maximized = false;
      this.audioElement = null;
      this.saved_content = "";
      this.scheduleFullMode = false;
      this.volume = 0;
      this.saved_min_text = "";
      this.writing = false;
      this.startTime = new Date();
      this.new_message_counter = 0;
      this.msg_count = 0;
      this.currentPanel = 'none';
      this.agentStatus = 'keepChatOn';
      this.sheduledStatus = 'keepChatOn';
    },
    setStatusMessage: function (text) {
      $('#taika-chat-status').text(text)
    },
    setAgentChatClosed: function () {
      $('.taika-chat-messages').append("<b>Asiakaspalvelija päättänyt istunnon!</b>");
      $("#taika-chat-input").hide();
      $("#taika-send-button").hide();
      EmbedTaikaChatUI.chatMessagesScrollTop();
    },
    chatMessagesScrollTop: function () {
      var elm = $('#taika-chat-messages');
      elm.scrollTop(elm.get(0).scrollHeight);
    },
    translateReplace: function () {
      let i = 0;
      $("span[data-tc-trans-key]").each(function () {
        // console.log(i);
        let key = $(this).data('tc-trans-key');
        $(this).text(EmbedTaikaChatCommon.getMsgByLocale(key))
      });
      $("input[data-tc-trans-key]").each(function () {
        let key = $(this).data('tc-trans-key');
        $(this).attr("placeholder", EmbedTaikaChatCommon.getMsgByLocale(key))
      });
      $("textarea[data-tc-trans-key]").each(function () {
        let key = $(this).data('tc-trans-key');
        $(this).attr("placeholder", EmbedTaikaChatCommon.getMsgByLocale(key))
      });
    },
    showChatButton: function (reuse) {
      EmbedTaikaChatCore.chat_activated = true;

      if ($("#taika-chat-button").length > 0) {
        $('#taika-chat-button').show();
        EmbedTaikaChatUI.reloadButtonStatus();
        return;
      }
      if ($("#taika-chat-container").length == 0) {
        $(document.body).append('<div id="taika-chat-container">' +
          '<a id="taika-chat-button" style="color:#ffffff; cursor:pointer; padding: 0.375rem 0.75rem; position:fixed; z-index:500;">' +
          '<div id="taika-chat-button-content" style="padding: 0px;"></div>' +
          '</a>' +
          '</div>');
      }

      if (!EmbedTaikaChatCore.settings) return;
      let button = $('#taika-chat-button');
      let chatButtonSettings = EmbedTaikaChatCore.settings.chat.button;
      let btnContent = $('#taika-chat-button-content');
      if (chatButtonSettings.chatIcon) {
        btnContent.append('<img class="taika-button-image" src="' + EmbedTaikaChatCore.resourceUrl + 'icons8-chat-50.png"/>')
      }
      // -- custom --
      if (chatButtonSettings.customText) {
        btnContent.append(chatButtonSettings.customText);
      } else {
        btnContent.append(EmbedTaikaChatCommon.getMsgByLocale("chat with us"));
      }

      button.css({
        'font-size': chatButtonSettings.textSize,
        'border-radius': chatButtonSettings.cornerRadius
      });
      if (chatButtonSettings.customColor) {
        button.css('background-color', '#' + chatButtonSettings.customColor);
      } else {
        button.css('background-color', '#' + chatButtonSettings.color);
      }

      if (chatButtonSettings.fontCustomColor) {
        button.css('color', '#' + chatButtonSettings.fontCustomColor);
      } else {
        button.css('color', '#' + chatButtonSettings.fontColor);
      }
      if (chatButtonSettings.alignment.indexOf('bottom') > -1) {
        button.css('bottom', chatButtonSettings.gaps.vertical.value + chatButtonSettings.gaps.vertical.unit);
        button.css('top', '');
      } else {
        button.css('top', chatButtonSettings.gaps.vertical.value + chatButtonSettings.gaps.vertical.unit);
        button.css('bottom', '');
      }
      if (chatButtonSettings.alignment.indexOf('right') > -1) {
        button.css('right', chatButtonSettings.gaps.horizontal.value + chatButtonSettings.gaps.horizontal.unit);
      } else {
        button.css('left', chatButtonSettings.gaps.horizontal.value + chatButtonSettings.gaps.horizontal.unit);
      }
      if (chatButtonSettings.availableAgents) {
        btnContent.append(`<br><div style="text-align: center" id="avaible_agents">${EmbedTaikaChatCommon.getMsgByLocale('available agents')} : ${EmbedTaikaChatCore.availableAgents}</div>`);
        let scale = 1;
        if (chatButtonSettings.textSize === 'large') {
          scale = 1.5
        } else if (chatButtonSettings.textSize === 'small') {
          scale = 0.5
        }

        if (chatButtonSettings.cornerRadius.split("%")[0] > 30) {
          btnContent.css('paddingLeft', chatButtonSettings.cornerRadius.split("%")[0] / 8 * scale + 'px');
          btnContent.css('paddingRight', chatButtonSettings.cornerRadius.split("%")[0] / 8 * scale + 'px');
          btnContent.css('paddingBottom', chatButtonSettings.cornerRadius.split("%")[0] / 8 * scale + 'px');
          btnContent.css('paddingTop', chatButtonSettings.cornerRadius.split("%")[0] / 8 * scale + 'px');
        } else {
          btnContent.css('paddingLeft', '0px');
          btnContent.css('paddingRight', '0px');
          btnContent.css('paddingBottom', '0px');
          btnContent.css('paddingTop', '0px');
        }
      } else {
        btnContent.css('paddingLeft', '0px');
        btnContent.css('paddingRight', '0px');
        btnContent.css('paddingBottom', '0px');
        btnContent.css('paddingTop', '0px');
      }

      button.click(function () {
        EmbedTaikaChatUI.openChatWindow();
      });
      EmbedTaikaChatUI.shedulerTimer = setInterval(EmbedTaikaChatUI.reloadButtonStatus, 30000);
      EmbedTaikaChatUI.reloadButtonStatus();
      setTimeout(EmbedTaikaChatUI.reloadButtonStatus, 5000);
      this.currentPanel = 'none';
    },
    openChatWindow: function () {
      if ($("#taika-chat-box").length === 0) {
        this.createChatBox();
      }
      $("#taika-chat-button").hide();
      $("#taika-chat-box").show();
      this.maximized = true;
      EmbedTaikaChatUI.resetNewMessageCounter();
      $('#taika-chat-page-greeting').hide();
      $('#taika-chat-page2').hide();
      $('#taika-chat-page3').hide();
      if (EmbedTaikaChatCore.settings.chat.window.chatActions.length > 0) $('#taika-chat-menu-icon-img').show();
      EmbedTaikaChatUI.reloadButtonStatus();
      if (EmbedTaikaChatCore.username) {
        if (!EmbedTaikaChatCore.socket) {
          EmbedTaikaChatCore.socketConnect();
        }
        this.currentPanel = 'chat';
        $('#taika-chat-page-greeting').hide();
        $('#taika-chat-page3').hide();
        $('#taika-chat-page2').show();
        this.setStatusMessage('');
        EmbedTaikaChatCore.sendClientJoined();

        EmbedTaikaChatUI.maximize()
      } else {
        $('#taika-chat-menu-icon-img').hide();
        $('#taika-chat-page-greeting').show();
      }
      EmbedTaikaChatUI.translateReplace();
      EmbedTaikaChatUI.reloadButtonStatus();
    },
    createChatBox: function () {
      var maximizedBox =
        "<div id='taika-chat-box' class='taika-chat-box' >\n\
<div class='taika-chat-box-top' id='taika-chat-box-top'>\n\
  <div class='taika-chat-header-line' id='taika-chat-logo'><img src='' class='taika-chat-logo' id='taika-chat-logo-img'/></div>\n\
  <div id='taika-chat-title' class='taika-chat-header-line taika-chat-title'></div>\n\
  <div class='taika-chat-header-line-right' >\n\
    <i id='taika-chat-menu-icon-img' class='fa fa-cog fa-2x taika-action-icon-rev taika-chat-menu'></i>\n\
    <div id='taika-chat-menu-list' class='taika-chat-menu-list'></div>\n\
    <i id='taika-close-button' class='fa fa-chevron-down fa-2x taika-action-icon-rev'></i>\n\
    <i id='taika-exit-button' class='fa fa-close fa-2x taika-action-icon-rev'></i>\n\
  </div>\n\
</div>\n\
<div class='taika-chat-box-bottom' id='taika-chat-box-bottom'>\n\
    <div id='taika-chat-schedule' class='taika-chat-schedule'>\n\
      <div id='taika-chat-schedule-title'></div>\n\
      <div id='taika-chat-periods'></div>\n\
    </div>\n\
    <div id='taika-chat-page-greeting' class='taika-chat-page-greeting'>\n\
      <div style='max-height: 300px; overflow-y: scroll; word-wrap: break-word'>\n\
        <div class='taika-greeting-text'>Hello!<br>We are ready to help you.</div>\n\
        <div class='taika-chat-questions' id='taika-chat-questions'></div>\n\
      </div>\n\
      <div class='taika-center'><button class='taika-start-button'><span data-tc-trans-key='Start chat'>Start chat</span></button></div>\n\
    </div>\n\
    <div id='taika-chat-page2'>\n\
      <div class='taika-chat-messages' id='taika-chat-messages'></div>\n\
      <div class='taika-chat-status' id='taika-chat-status'></div>\n\
      <div class='taika-input-area'>\n\
        <textarea id='taika-chat-input' data-tc-trans-key='Type your message here...' placeholder='Type your message here...' rows='3' wrap='soft' class='padded_placeholder taika-chat-input'></textarea>\n\
        <div class='taika-chat-buttons'>\n\
          <div id='taika-file-info-panel' class='taika-file-info-panel'>\n\
            <span id='taika-file-name'></span>\n\
            <span id='taika-clear-file' class='taika-dialog-close'><i class='fa fa-close fa-2x'></i></span>\n\
          </div>\n\
          <button type='button' class='taika-send-button' id='taika-send-button'><span data-tc-trans-key='Send'>Send</span></button>\n\
          <label for='taika-file-upload' class='taika-fileshare-button' id='taika-fileshare-button'>File share</label>\n\
          <input id='taika-file-upload' type='file'/>\n\
        </div>\n\
      </div>\n\
    </div>\n\
    <div id='taika-chat-page3' class='taika-chat-page3'>\n\
      <div class='taika-greeting-closed'></div>\n\
    </div>\n\
</div>\n\
</div>\n";

      $("#taika-chat-container").append(maximizedBox);
      if (EmbedTaikaChatCore.settings.chat.window.backgroundCustomColor) {
        $('.taika-chat-box-top').css('background-color', '#' + EmbedTaikaChatCore.settings.chat.window.backgroundCustomColor)
      } else if (EmbedTaikaChatCore.settings.chat.window.backgroundColor) {
        $('.taika-chat-box-top').css('background-color', '#' + EmbedTaikaChatCore.settings.chat.window.backgroundColor)
      }
      $('#taika-chat-page-greeting').show();
      $('#taika-chat-page2').hide();
      $('#taika-chat-page3').hide();
      if (EmbedTaikaChatCore.settings.chat.window.fontCustomColor) {
        $('.taika-chat-box-top').css('color', '#' + EmbedTaikaChatCore.settings.chat.window.fontCustomColor)
      } else if (EmbedTaikaChatCore.settings.chat.window.fontColor) {
        $('.taika-chat-box-top').css('color', '#' + EmbedTaikaChatCore.settings.chat.window.fontColor)
      }
      $('#taika-close-button').click(function () {
        EmbedTaikaChatUI.closeChatWindow();
      });
      //------------evg--openConfirmationDialog--------
      $('#taika-exit-button').click(function () {
        EmbedTaikaChatUI.openConfirmationDialog();
      });

      $("#taika-chat-input").keyup(function (event) {
        EmbedTaikaChatUI.checkTextLimit();
        if (event.keyCode == 13) {
          EmbedTaikaChatUI.checkTextLimit();
          $("#taika-send-button").click();
        }
      });
      $("#taika-send-button").on("click", function (e) {
        EmbedTaikaChatUI.sendBtnClick();
      });

      EmbedTaikaChatUI.setFilePanel();
      EmbedTaikaChatUI.setChatBoxHeaderStyle();
      EmbedTaikaChatUI.setChatBoxMenu();
      EmbedTaikaChatUI.prepareQuestions();
      EmbedTaikaChatUI.initAudioElement();
      EmbedTaikaChatUI.initSchedule();
    },
    initAudioElement: function () {
      if (EmbedTaikaChatUI.audioElement == null) {
        EmbedTaikaChatUI.audioElement = $("<audio></audio>").attr({
          'src': EmbedTaikaChatCore.resourceUrl + 'sound.mp3',
        });
        EmbedTaikaChatUI.audioElement.load();
        EmbedTaikaChatUI.audioElement.volume = EmbedTaikaChatUI.volume;
      } else {
        EmbedTaikaChatUI.audioElement.trigger("play");
      }
    },
    reloadButtonStatus: function () {
      EmbedTaikaChatUI.agentStatus = 'keepChatOn';
      if (EmbedTaikaChatCore.settings.chat.button.availableAgents) {
        $('#avaible_agents').text(`${EmbedTaikaChatCommon.getMsgByLocale('available agents')} : ${EmbedTaikaChatCore.availableAgents}`);
      }
      if (EmbedTaikaChatCore.availableAgents === 0) {
        EmbedTaikaChatUI.agentStatus = EmbedTaikaChatCore.settings.chat.button.ifNoAgents;
      }
      EmbedTaikaChatUI.reloadSheduler();
      if (EmbedTaikaChatUI.currentPanel !== 'chat' &&
        (EmbedTaikaChatCore.settings.chat.schedule.ifClosed !== 'keepChatOn' || EmbedTaikaChatCore.settings.chat.button.ifNoAgents !== 'keepChatOn')) {
        if (EmbedTaikaChatUI.agentStatus === 'hideChat' || EmbedTaikaChatUI.sheduledStatus === 'hideChat') {
          $("#taika-chat-button").hide();
          $("#taika-chat-box").hide();
          EmbedTaikaChatUI.maximized = false;
          return;
        }
        if (EmbedTaikaChatUI.maximized) {
          $("#taika-chat-box").show();
        } else {
          $("#taika-chat-button").show();
        }
        if (EmbedTaikaChatUI.sheduledStatus === 'showOpenTime' || EmbedTaikaChatUI.agentStatus === 'showClosed') {
          $('#taika-chat-page3').show();
          EmbedTaikaChatUI.currentPanel = 'closed';
          $('.taika-greeting-closed').text(EmbedTaikaChatCore.closedText);
          $('#taika-chat-page-greeting').hide();
          return;
        }
        $('#taika-chat-page-greeting').show();
        EmbedTaikaChatUI.currentPanel = 'greeting';
      }
    },
    reloadSheduler: function () {
      EmbedTaikaChatCore.recalcSheduler();
      if (EmbedTaikaChatCore.showSchedule() && $("#taika-chat-box").length > 0) {
        let userTimezone = moment.tz.guess()
        let title = (EmbedTaikaChatCore.isOpen() ? EmbedTaikaChatCommon.getMsgByLocale('open') : EmbedTaikaChatCommon.getMsgByLocale('closed')) + ' => ' + EmbedTaikaChatCommon.getMsgByLocale('Today\'s schedule')
        $('#taika-chat-schedule-title').text(title)
        $('#taika-chat-periods').empty();
        EmbedTaikaChatCore.todayPeriods.forEach(period => {
          if (period.startTime && period.endTime) {
            $('#taika-chat-periods').append(EmbedTaikaChatUI.calculateTimeAndDateInUserTimezone(period, userTimezone))
          }
        })
        $('.taika-chat-schedule').css('background-color', EmbedTaikaChatUI.scheduleBackgroundColor());
        $('.taika-chat-schedule').show();
      }
      if (EmbedTaikaChatCore.isOpen()) {
        EmbedTaikaChatUI.sheduledStatus = 'keepChatOn';
      } else {
        EmbedTaikaChatUI.sheduledStatus = EmbedTaikaChatCore.settings.chat.schedule.ifClosed
      }
    },
    initSchedule: function () {
      if (EmbedTaikaChatCore.showSchedule()) {
        EmbedTaikaChatUI.scheduleFullMode = true
        EmbedTaikaChatUI.toggleTaikaSchedule()
        $('.taika-chat-schedule').on("click", function (e) {
          EmbedTaikaChatUI.toggleTaikaSchedule()
        })
      }
    },
    toggleTaikaSchedule() {
      EmbedTaikaChatUI.scheduleFullMode = !EmbedTaikaChatUI.scheduleFullMode
      if (this.scheduleFullMode) {
        $('#taika-chat-periods').show();
      } else {
        $('#taika-chat-periods').hide();
      }
    },
    scheduleBackgroundColor() {
      if (EmbedTaikaChatCore.isOpen()) {
        return '#33AA44'
      } else {
        return '#F08080';
      }
    },
    calculateTimeAndDateInUserTimezone(period, userTimezone) {
      let startTime = EmbedTaikaChatCommon.convertHoursToUserTimezone(period.timezone.value, userTimezone, period.startTime.hours + ':' + period.startTime.minutes)
      let endTime = EmbedTaikaChatCommon.convertHoursToUserTimezone(period.timezone.value, userTimezone, period.endTime.hours + ':' + period.endTime.minutes)
      return `<div title="${period.text}">${period.status} ${startTime} - ${endTime}</div>`
    },
    setFilePanel: function () {
      $('#taika-file-info-panel').hide();
      if (!EmbedTaikaChatCore.settings.chat.window.chatActions.includes('file')) {
        $('#taika-fileshare-button').hide();
        return;
      }
      $('#taika-clear-file').on("click", "i", function () {
        $('#taika-file-info-panel').hide();
        $('#taika-file-upload').val(null);
      });
      $('#taika-file-upload').on("change", function () {
        if (this.files.length > 0) {
          $('#taika-file-info-panel').show();
          $('#taika-file-name').html(this.files[0].name);
        } else {
          $('#taika-file-info-panel').hide();
        }
      });
    },
    setChatBoxMenu: function () {
      $('#taika-chat-menu-icon-img').click(function () {
        if (EmbedTaikaChatCore.settings.chat.window.chatActions.length > 0) $("#taika-chat-menu-list").show();
      });
      $("#taika-chat-menu-list").hide();
      if (EmbedTaikaChatCore.settings.chat.window.chatActions.includes('sound')) {
        $('#taika-chat-menu-list').append("<a href='#' id='taika-chat-menu-sound'><span data-tc-trans-key='Sound'>Sound</span></a>\n");
        $('#taika-chat-menu-sound').click(function () {
          EmbedTaikaChatUI.openSoundDialog();
        });
      }
      if (EmbedTaikaChatCore.settings.chat.window.chatActions.includes('print')) {
        $('#taika-chat-menu-list').append("<a href='#' id='taika-chat-menu-print'><span data-tc-trans-key='Print'>Print</span></a>\n");
        $('#taika-chat-menu-print').click(function () {
          EmbedTaikaChatUI.print();
        });
      }
      if (EmbedTaikaChatCore.settings.chat.window.chatActions.includes('mail')) {
        $('#taika-chat-menu-list').append("<a href='#' id='taika-chat-menu-mail'><span data-tc-trans-key='Mail'>Mail</span></a>\n");
        $('#taika-chat-menu-mail').click(function () {
          EmbedTaikaChatUI.sendChatAsEmail();
        });
      }
    },
    setChatBoxHeaderStyle: function () {
      let titleWidth = 85;
      if (EmbedTaikaChatCore.settings.chat.window.chatActions.length < 1) {
        $('#taika-chat-menu-list').hide();
        $('#taika-chat-menu-icon-img').hide();
        titleWidth += 15;
      } else {
        $('#taika-chat-menu-icon-img').show()
        $('#taika-chat-menu-icon-img').attr("src", EmbedTaikaChatCore.resourceUrl + 'symbols-icon-burger.png');
      }
      if (!EmbedTaikaChatCore.settings.chat.window.chatHeaders.includes('logo')) {

        $('#taika-chat-logo-img').hide();
        $('#taika-chat-logo').width(0)
        titleWidth += 70
      } else {
        $('.taika-chat-logo').attr("src", EmbedTaikaChatCore.settings.chat.window.logo);
      }
      $('#taika-chat-title').width(titleWidth);
      if (EmbedTaikaChatCore.settings.chat.window.customHeader) {
        $('#taika-chat-title').text(EmbedTaikaChatCore.settings.chat.window.customHeader);
      } else {
        $('#taika-chat-title').text('Company name');
      }
    },
    prepareQuestions: function () {
      if (EmbedTaikaChatCore.settings.chat.welcomeText) {
        //----evg greeting-text in two line--------------------------------------------------------------------
        $('.taika-greeting-text').html(`<pre><div class ="taika-greeting-text">${EmbedTaikaChatCore.settings.chat.welcomeText}</div></pre>`)
      }
      if (!EmbedTaikaChatCore.settings.chat.questions || EmbedTaikaChatCore.settings.chat.questions.length === 0) return;
      let questionsElements = ''
      EmbedTaikaChatCore.settings.chat.questions.forEach(question => {
        if (question === 'username') {
          questionsElements += EmbedTaikaChatUI.questionTemplate(question, EmbedTaikaChatCommon.getMsgByLocale('username'))
        } else {
          questionsElements += EmbedTaikaChatUI.questionTemplate(question)
        }
      })
      $('#taika-chat-questions').append(questionsElements)
      $('.taika-start-button').on("click", function (e) {
        EmbedTaikaChatCore.chatAnswers = EmbedTaikaChatUI.readAnswers();
        EmbedTaikaChatUI.openChatWindow();
        if (EmbedTaikaChatCore.settings.chat.window.chatActions.length > 0) $('#taika-chat-menu-icon-img').show();
      })
    },
    questionTemplate: function (question, label) {
      return `<div class="taika-question-box"><div>${(label)? label: question}</div><div><input class="taika-answer" id="taika_question_${question}" type="text" value=""/></div></div>`
    },
    readAnswers: function () {
      let answers = []
      if (!EmbedTaikaChatCore.settings.chat.questions || EmbedTaikaChatCore.settings.chat.questions.length === 0) return;
      let questionsElements = ''
      EmbedTaikaChatCore.settings.chat.questions.forEach(question => {
        let id = "#taika_question_" + question;
        let answer = $(id).val();
        answers.push({
          question: question,
          answer: answer
        })
        if (question === 'username') {
          EmbedTaikaChatCore.setUsername(answer);
          window.localStorage.setItem('username', answer)
        }
      })
      // console.log(answers)
      return answers
    },
    closeChatWindow: function () {
      this.msg_count = 0;
      clearTimeout(EmbedTaikaChatCore.timer);
      EmbedTaikaChatCore.sendClientMaximized(false);
      EmbedTaikaChatUI.closeAllDialogs();
      this.maximized = false;
      this.saved_content = $('#taika-chat-messages').html();
      $('#taika-chat-box').hide();
      client_status = 2;
      EmbedTaikaChatUI.showChatButton();
    },
    exitChatWindow: function () {
      this.msg_count = 0;
      clearTimeout(EmbedTaikaChatCore.timer);
      EmbedTaikaChatCore.sendClientMaximized(false);
      EmbedTaikaChatUI.closeAllDialogs();
      this.maximized = false;
      EmbedTaikaChatCore.anotherCookie()
      this.saved_content = '';
      $('#taika-chat-messages').html('')
      $('#taika-chat-box').hide();
      client_status = 2;
      if (EmbedTaikaChatCore.socket) {
        try {
          EmbedTaikaChatCore.socket.close()
        } catch (e) {
          //ignore
        }
      }
      EmbedTaikaChatCore.socketConnect()
      EmbedTaikaChatUI.showChatButton();
    },
    openSoundDialog: function () {
      if ($("#taika-sound-dialog").length === 0) {
        var html = "<div id='taika-sound-dialog'>\
          <div class='taika-dialog-title'>\
            <span id='taika-close-sound-dialog' class='taika-dialog-close'><i class='fa fa-close fa-2x'></i></span>\
          </div>\
          <div style='text-align:center;'>" + EmbedTaikaChatCommon.getMsgByLocale('Adjust the volume of the alarm sound') + "</div>\
          <div style='text-align:center;'>\
          <span><i class='fa fa-volume-off fa-2x'></i></span>\
          <span style='width: 100%;'><input id='taika-mute-slider' type='range' min='0' max='100' step='1' value='0' oninput='EmbedTaikaChatUI.changeSoundLevel(value);' onchange='EmbedTaikaChatUI.changeSoundLevel(value);'></span>\
          <span><i class='fa fa-volume-up fa-2x'></i></span>\
          </div>\
          </div>";
        $('#taika-chat-box').append(html);
        $('#taika-sound-dialog').css({
          top: 50,
          right: 10
        })
        $('#taika-close-sound-dialog').click(function () {
          $('#taika-sound-dialog').hide();
        });
      }
      $('#taika-sound-dialog').show();
    },
    closeAllDialogs: function () {
      //console.log(' - closeAllDialogs');
      $('#taika-sound-dialog').hide();
    },
    playAudio() {
      //---evg-- sound shout down
      if (this.audioElement && EmbedTaikaChatCore.settings.chat.window.chatActions.includes('sound')) {
        this.audioElement.trigger('pause');
        this.audioElement[0].currentTime = 0;
        this.audioElement.trigger('play');
      }
    },
    changeSoundLevel: function (value) {
      EmbedTaikaChatUI.volume = value / 100
      EmbedTaikaChatUI.audioElement.volume = this.volume
      EmbedTaikaChatUI.playAudio();
    },
    print: function () {
      $("#taika-chat-messages").printThis({
        printContainer: false
      });
    },
    sendChatAsEmail: function () {
      let bodyList = $("#taika-chat-messages")[0].childNodes
      let body = '';
      $("#taika-chat-messages").children().each(function (i, elem) {
        if ($(this).hasClass("taika-user-message")) {
          body += EmbedTaikaChatCore.username
        } else {
          body += "Agent"
        }
        $(elem).children(".taika-message-time").text()
        body += " (" + $(elem).children(".taika-message-time").text() + "):" + $(elem).children(".message").text() + "\n"
      });
      let subject = EmbedTaikaChatCore.chat_button_text + " - Chat keskustelu - " + EmbedTaikaChatCore.session_id
      let html = '<a id="chat-email-sender" href="mailto:' + EmbedTaikaChatCore.settings.chat.window.mailTo + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '"></a>'
      $("#taika-chat-menu-mail").after(html)
      $("#chat-email-sender")[0].click()
      $("#chat-email-sender").remove();
    },
    maximize: function () {
      this.maximized = true;

      $('#taika-chat-input').val(this.saved_min_text);

      EmbedTaikaChatCore.setCookie();
      if (!this.saved_content == "") {
        $('#taika-chat-messages').html(this.saved_content);
      }
      client_status = 3;
      EmbedTaikaChatCore.sendClientMaximized(true);
    },
    checkTextLimit: function () {
      var charcnt1 = $("#taika-chat-input").val().length;
      if (charcnt1 > 1024) {
        $("#taika-chat-input").val($("#taika-chat-input").val().substring(0, 1024));
      }
      if (EmbedTaikaChatUI.writing == false) {
        ;
        EmbedTaikaChatUI.writing = true;
        EmbedTaikaChatUI.startTime = new Date();
        EmbedTaikaChatCore.sendClientWriting();
      } else {
        var endTime = new Date();
        var timeDiff = endTime - EmbedTaikaChatUI.startTime;
        if (timeDiff > 4000) {
          EmbedTaikaChatUI.startTime = new Date();
          EmbedTaikaChatCore.sendClientWriting();
        } else {
          EmbedTaikaChatUI.writing = false;
        }
      }
    },
    putMessage: function (mess) {
      if (mess.action === "agent_message") {
        EmbedTaikaChatUI.playAudio();
        if (EmbedTaikaChatUI.maximized === false) { // Minimized

          //this.new_message_counter++;
          // $("#wcs-minimize-logo").hide();
          // if (this.new_message_counter == 1) {
          //   $("#wcs-new-message").empty().append("1 uusi viesti");
          // } else {
          //   $("#wcs-new-message").empty().append(new_message_counter + " uutta viestiä");
          // }
          EmbedTaikaChatUI.saved_content += this.agentMessageTemplate(EmbedTaikaChatCommon.urlify(decodeURIComponent(encodeURIComponent(mess.text))), mess.date, mess.attachments);
        } else {
          $('#taika-chat-messages').append(this.agentMessageTemplate(EmbedTaikaChatCommon.urlify(decodeURIComponent(encodeURIComponent(mess.text))), mess.date, mess.attachments));
        }
        this.chatMessagesScrollTop();
      } else if (mess.action == "own_message") {
        $('#taika-chat-messages').append(this.userMessageTemplate(EmbedTaikaChatCommon.urlify(decodeURIComponent(encodeURIComponent(mess.text))), mess.date, mess.attachments));
        this.chatMessagesScrollTop();
      } else {}
    },
    resetNewMessageCounter: function () {
      this.new_message_counter = 0;
    },
    userMessageTemplate: function (message, time, attachments) {
      let attach = '';
      if (attachments && attachments.length) {
        for (let i = 0; i < attachments.length; i++) {
          attach += ' <a target="_blank" href="' + EmbedTaikaChatCore.resourceUrl + '../../attachments/' + attachments[i]._id + '">' +
            attachments[i].name + ' | ' + EmbedTaikaChatCommon.formatSize(attachments[i].fileSize) + '</a> ';
        }
      }
      if (attach) {
        message = message + ' ' + attach
      }
      return `<div class="taika-user-message"><div class="message">${message}</div><div class="taika-message-time">${time}</div></div>`
    },
    agentMessageTemplate: function (message, time, attachments) {
      let attach = '';
      if (attachments && attachments.length) {
        for (let i = 0; i < attachments.length; i++) {
          // attach += ' <a download="' + attachments[i].name + '" href="blob:' + EmbedTaikaChat.resourceUrl + '../../attachments/' + attachments[i]._id + '">'
          attach += ' <a target="_blank" href="' + EmbedTaikaChatCore.resourceUrl + '../../attachments/' + attachments[i]._id + '">' +
            attachments[i].name + ' | ' + EmbedTaikaChatCommon.formatSize(attachments[i].fileSize) + '</a>';
        }
      }
      if (attach) {
        message = message + ' ' + attach
      }
      return `<div class="taika-agent-message"><span class="message">${message}</span><span class="taika-message-time">${time}</span></div>`
    },
    sendBtnClick: function () {
      // console.log('send btn click')
      EmbedTaikaChatCore.setCookie();
      var val = EmbedTaikaChatCommon.escapeHtml($('#taika-chat-input').val());
      if (val != "") {
        var file = $('#taika-file-upload')[0];
        if (file.files.length) {
          this.taikaSendFileShare();
        } else {
          this.taikaSendMessage(null);
        }
      } else {
        $('#taika-chat-input').val('');
        $('#taika-chat-input').focus();
      }
    },
    taikaSendFileShare() {
      var file = $('#taika-file-upload')[0];
      var formData = new FormData();
      if (file.files.length) {
        formData.append('file', file.files[0]);
        formData.append('session_id', EmbedTaikaChatCore.session_id);
      }
      let _url = EmbedTaikaChatCore.resourceUrl + '../../attachments/chat'
      let that = this;
      $.ajax({
        url: _url,
        type: 'POST',
        data: formData,
        mimeType: "multipart/form-data",
        contentType: false,
        cache: false,
        processData: false,
        success: function (data, textStatus, jqXHR) {
          var obj = JSON.parse(data);
          EmbedTaikaChatUI.taikaSendMessage(obj.attachments);
          $('#taika-file-upload').val(null);
          $('#taika-file-info-panel').hide();
        },
        error: function (xhr, status, error) {

        }
      })
    },
    taikaSendMessage: function (attachments) {
      var val = EmbedTaikaChatCommon.escapeHtml($('#taika-chat-input').val());
      if (val != "") {
        // autoanswer
        this.msg_count++;
        let message = EmbedTaikaChatCommon.formattedNewLine(EmbedTaikaChatCommon.urlify(decodeURIComponent(encodeURIComponent(val))));
        $('#taika-chat-messages').append(this.userMessageTemplate(message, EmbedTaikaChatCommon.formatDate(new Date()), attachments));
        this.chatMessagesScrollTop();
        this.checkTextLimit();
        EmbedTaikaChatCore.sendClientMessage(val, attachments);
      }
      $('#taika-chat-input').val('');
      $('#taika-chat-input').focus();
    },

    //------------evg--confirmation dialog---------
    openConfirmationDialog: function () {
      if ($("#taika-satisfaction-dialog").length === 0) {
        html =
          "<div id='taika-satisfaction-dialog' class='taika-satisfaction-dialog'>\n\
              <div style='text-align:center;'>" + EmbedTaikaChatCommon.getMsgByLocale('Do you want to end the conversation?') + "</div>\n\
              <div>&nbsp;</div>\n\
              <div id='taika-satisfaction-body' style='text-align:center;'></div>\n\
              <div>&nbsp;</div>\n\
              </div>";
        $("#taika-chat-box-top").append(html);
        $("#taika-satisfaction-body").addClass('taika-numeric-dialog')
        $("#taika-satisfaction-body").append(this.confirmationDialog());
      }
    },

    confirmationDialog: function () {
      let html =
        "<span id='taika-joy-good' class = 'taika-joy-mark'><i class='taika-mark confirm-yes' onclick='EmbedTaikaChatUI.satisfactionDialog()'>" + EmbedTaikaChatCommon.getMsgByLocale('Yes') + "</i></span>\n\
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\n\
         <span id='taika-joy-bad' class = 'taika-joy-mark'><i class='taika-mark confirm-yes' onclick='EmbedTaikaChatUI.closeConfirmationDialog()'>" + EmbedTaikaChatCommon.getMsgByLocale('No') + "</i></span>";
      return html;
    },

    closeConfirmationDialog: function () {
      $('#taika-satisfaction-dialog').remove();
    },

    satisfactionDialog: function (e) {
      $('#taika-satisfaction-dialog').remove();
      if (EmbedTaikaChatCore.settings.chat.customerSatisfaction.toggled &&
        EmbedTaikaChatUI.msg_count > 0) {
        EmbedTaikaChatUI.openSatisfactionDialog();
      } else {
        EmbedTaikaChatUI.exitChatWindow();
        $('#taika-satisfaction-dialog').remove()
      }
    },
    //------------
    openSatisfactionDialog: function () {
      $('#taika-satisfaction-dialog').remove();
      if ($("#taika-satisfaction-dialog").length === 0) {
        html =
          "<div id='taika-satisfaction-dialog' class='taika-satisfaction-dialog'>\n\
            <div style='text-align:center;'>" + EmbedTaikaChatCommon.getMsgByLocale('How are you satisfied with assistance?') + "</div>\n\
            <div>&nbsp;</div>\n\
            <div id='taika-satisfaction-body' style='text-align:center;'></div>\n\
            <div>&nbsp;</div>\n\
            </div>";
        $("#taika-chat-box-top").append(html);
        switch (EmbedTaikaChatCore.settings.chat.customerSatisfaction.scale) {
          case 3:
            $("#taika-satisfaction-body").append(this.getSmileyDialog());
            break;
          case 5:
            $("#taika-satisfaction-body").addClass('taika-numeric-dialog')
            $("#taika-satisfaction-body").append(this.getNumericJoyDialog());
            break;
          case 2:
            $("#taika-satisfaction-body").append(this.getThumbDialog());
            break;
        }
      } else {
        $('#taika-satisfaction-dialog').show()
      }
    },
    //--------------------------------evg---change order mark estimation--------------
    getThumbDialog: function () {
      let html =
        "<span id='taika-thumb-up' class='taika-joy-thumb-up'><i class='fa fa-thumbs-o-up fa-3x'  onclick='EmbedTaikaChatUI.sendSatisfaction(2, 2)'></i></span>\n\
        <span id='taika-thumb-down' class='taika-joy-thumb-down'><i class='fa fa-thumbs-o-down fa-3x' onclick='EmbedTaikaChatUI.sendSatisfaction(1, 2)'></i></span>";
      return html;
    },


    getSmileyDialog: function () {
      let html =
        "<span id='taika-smiley-3' class='taika-smiley-icon' style='color:green;'><i class='fa fa-smile-o fa-3x largerHover' onclick='EmbedTaikaChatUI.sendSatisfaction(3, 3)'></i></span>\n\
        <span id='taika-smiley-2' class='taika-smiley-icon' style='color:#FFCC00;'><i class='fa fa-meh-o fa-3x largerHover' onclick='EmbedTaikaChatUI.sendSatisfaction(2, 3)'></i></span>\n\
        <span id='taika-smiley-1' class='taika-smiley-icon' style='color:red;'><i class='fa fa-frown-o fa-3x largerHover'  onclick='EmbedTaikaChatUI.sendSatisfaction(1, 3)'></i></span>";
      return html;
    },

    getNumericJoyDialog: function () {
      let html =
        "<span id='taika-joy-good' class = 'taika-joy-mark'><i onclick='EmbedTaikaChatUI.sendSatisfaction(5, 5)'>" + EmbedTaikaChatCommon.getMsgByLocale('good') + "</i></span>\n\
        <span id='taika-joy-5' class = 'taika-joy-mark'><i class='taika-mark' onclick='EmbedTaikaChatUI.sendSatisfaction(5, 5)'>5</i></span>\n\
        <span id='taika-joy-4' class = 'taika-joy-mark'><i class='taika-mark' onclick='EmbedTaikaChatUI.sendSatisfaction(4, 5)'>4</i></span>\n\
        <span id='taika-joy-3' class = 'taika-joy-mark'><i class='taika-mark' onclick='EmbedTaikaChatUI.sendSatisfaction(3, 5)'>3</i></span>\n\
        <span id='taika-joy-2' class = 'taika-joy-mark'><i class='taika-mark' onclick='EmbedTaikaChatUI.sendSatisfaction(2, 5)'>2</i></span>\n\
        <span id='taika-joy-1' class = 'taika-joy-mark'><i class='taika-mark' onclick='EmbedTaikaChatUI.sendSatisfaction(1, 5)'>1</i></span>\n\
        <span id='taika-joy-bad' class = 'taika-joy-mark'><i onclick='EmbedTaikaChatUI.sendSatisfaction(1, 5)'>" + EmbedTaikaChatCommon.getMsgByLocale('bad') + "</i></span>";
      return html;
    },
    //--------------------------------------------------------
    sendSatisfaction: function (satisfaction, max) {
      $('#taika-satisfaction-dialog').remove();
      EmbedTaikaChatCore.sendClientChatClosed(satisfaction, max);
      EmbedTaikaChatUI.exitChatWindow();
    },
  }
}());

var EmbedTaikaChatCore = EmbedTaikaChatCore || (function () {
  const cookie_max_time = 120;
  const default_user_name = 'Asiakas';
  const weekdays = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  return {
    init: function (socketUrl, resUrl, jsonArgs) { //
      this.messagesHistoryCleared = true;
      this.session_id = "";
      this.chat_button_text = "Chat with us";
      this.chatUrlHandler = "http://localhost:9090"; //default, next is called from init
      this.resourceUrl = ""
      this.service_id = "";
      this.channel_id = "";
      this.startTime = new Date();
      this.periods = []
      this.todayPeriods = []
      this.availableAgents = 0;
      this.closedText = 'Sorry. We are closed'
      this.chat_activated = false;
      this.chatAnswers = undefined;
      this.statusTimeout = null;
      this.settings = jsonArgs; //JSON.parse(jsonArgs);
      if (socketUrl) {
        this.chatUrlHandler = socketUrl;
      }
      if (resUrl) {
        this.resourceUrl = resUrl
      }
      this.initConnection();
      EmbedTaikaChatUI.init();
    },
    initConnection: function () {
      EmbedTaikaChatCore.service_id = this.settings.department;
      EmbedTaikaChatCore.username = '';
      EmbedTaikaChatCore.channel_id = this.settings._id;
      EmbedTaikaChatCore.chat_button_text = this.settings.chat.button.customText;

      EmbedTaikaChatCore.agent_status = 0;
      EmbedTaikaChatCore.client_status = 0;

      if (EmbedTaikaChatCore.socket === null || EmbedTaikaChatCore.socket === undefined) { // Socket opens when page is loaded
        if (this.getCookie() != "") {
          this.session_id = this.getCookie();
          if (window.localStorage.getItem('username')) {
            this.setUsername(window.localStorage.getItem('username'))
          }
        } else {
          window.localStorage.removeItem('username')
          this.session_id = EmbedTaikaChatCommon.generateUUID();
        }
        this.setCookie();
        this.socketConnect();
      } else {
        console.log("socket == null");
      }
    },
    getCookie: function () {
      var name = "taika-chat_session=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }
      return "";
    },
    setCookie: function () {
      var d = new Date();
      d.setTime(d.getTime() + (cookie_max_time * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = "taika-chat_session=" + EmbedTaikaChatCore.session_id + "; " + expires + ";path=/";
    },
    deleteCookie: function () {
      document.cookie = "taika-chat_session" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    },
    anotherCookie: function () {
      var d = new Date();
      d.setTime(d.getTime() + (cookie_max_time * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      window.localStorage.removeItem('username')

      EmbedTaikaChatCore.session_id = EmbedTaikaChatCommon.generateUUID();
      document.cookie = "taika-chat_session=" + EmbedTaikaChatCore.session_id + "; " + expires + ";path=/";
    },
    setUsername: function (username) {
      if (username) {
        EmbedTaikaChatCore.username = username;
        window.localStorage.username = username
      } else {
        EmbedTaikaChatCore.username = EmbedTaikaChatCore.default_user_name;
      }
    },

    socketConnect: function () {
      try {
        EmbedTaikaChatCore.socket = new WebSocket(this.chatUrlHandler);
        EmbedTaikaChatCore.socket.onopen = EmbedTaikaChatCore.socketOnOpen;
        EmbedTaikaChatCore.socket.onmessage = EmbedTaikaChatCore.socketOnMessage;
        EmbedTaikaChatCore.socket.onclose = EmbedTaikaChatCore.socketOnClose;
        EmbedTaikaChatCore.socket.onerror = EmbedTaikaChatCore.socketOnError;
      } catch (exception) {
        //console.log(exception)
      }
    },
    socketSend: function (body) {
      if (!EmbedTaikaChatCore.socket || EmbedTaikaChatCore.socket.readyState !== 1) {
        if (EmbedTaikaChatCore.socket.readyState == 3) {
          EmbedTaikaChatCore.socketConnect();
        }
        return;
      }
      body.session_id = EmbedTaikaChatCore.session_id;
      body.service_id = EmbedTaikaChatCore.service_id;
      body.channel_id = EmbedTaikaChatCore.channel_id;
      body.user_name = EmbedTaikaChatCore.username;
      EmbedTaikaChatCore.socket.send(JSON.stringify(body))
    },
    socketOnOpen: function () {
      EmbedTaikaChatCore.socketSend({
        "GET_SERVICE_PARAMS": "",
        chatAnswers: EmbedTaikaChatCore.chatAnswers
      });
      EmbedTaikaChatCore.socketSend({
        "TRANSLATIONS": "",
        locale: EmbedTaikaChatCore.settings.locale
      });
      EmbedTaikaChatCore.agentCountTimer = setInterval(EmbedTaikaChatCore.getAgentCount, 60000);
    },
    getAgentCount: function () {
      EmbedTaikaChatCore.socketSend({
        "GET_AGENT_COUNT": "",
      });
    },
    socketOnMessage: function (msg) {
      var obj = JSON.parse(msg.data);
      if (obj.hasOwnProperty("action") && obj.action === 'system_message') {
        EmbedTaikaChatCore.setStatusMessage(obj);
        return;
      }
      if (obj.hasOwnProperty("session_id")) { // Response to open_session - TODO check if it realy need to be replaced
        EmbedTaikaChatCore.session_id = obj["session_id"];
      }
      if (obj.hasOwnProperty("session_closed")) {
        // Agent closed session
      } else if (obj.hasOwnProperty("SERVICE_PARAMS")) {
        EmbedTaikaChatCore.periods = obj["SERVICE_PARAMS"]
        EmbedTaikaChatCore.recalcSheduler();
        EmbedTaikaChatCore.availableAgents = obj["AGENT_COUNT"]
        EmbedTaikaChatCore.showChatButton();
      } else if (obj.hasOwnProperty("AGENT_COUNT")) {
        EmbedTaikaChatCore.availableAgents = obj["AGENT_COUNT"]
      } else if (obj.hasOwnProperty("TRANSLATIONS")) {
        let rawTranslations = obj["TRANSLATIONS"];
        EmbedTaikaChatCommon.initTranslations(rawTranslations);
        EmbedTaikaChatUI.translateReplace();
        EmbedTaikaChatCore.showChatButton();
      } else if (obj.hasOwnProperty("ALL_MESSAGES")) {
        for (var key in obj["ALL_MESSAGES"]) {
          if (obj["ALL_MESSAGES"].hasOwnProperty(key)) {
            EmbedTaikaChatCore.parseMessage(obj["ALL_MESSAGES"][key], true);
          }
        }
        EmbedTaikaChatCore.messagesHistoryCleared = false;
      } else if (obj.hasOwnProperty("AGENT_CHAT_MESSAGE")) { // Incoming messages
        EmbedTaikaChatUI.setStatusMessage('');
        clearTimeout(this.statusTimeout);
        EmbedTaikaChatCore.parseMessage(obj, false);
      } else if (obj.hasOwnProperty("AGENT_CHAT_CLOSED")) {
        EmbedTaikaChatCore.agent_status = 10;
        EmbedTaikaChatUI.setAgentChatClosed();
      } else if (obj.hasOwnProperty("AGENT_CHAT_ACTIVE")) {
        EmbedTaikaChatCore.agent_status = 1;
      } else if (obj.hasOwnProperty("AGENT_CHAT_WRITING")) {
        EmbedTaikaChatCore.timer = setTimeout(EmbedTaikaChatCore.checkAgentWritingTime, 3000);
      }
    },
    socketOnClose: function (event) {
      clearInterval(EmbedTaikaChatCore.agentCountTimer);
      EmbedTaikaChatUI.setStatusMessage(EmbedTaikaChatCommon.getMsgByLocale('Connection lost. Please refresh the chat'));
      EmbedTaikaChatCore.socketConnect();
    },
    socketOnError: function () {

    },
    recalcSheduler: function () {
      EmbedTaikaChatCore.todayPeriods = EmbedTaikaChatCore.getTodayPeriods()
      EmbedTaikaChatCore.activePeriods = EmbedTaikaChatCore.getActivePeriods()
    },
    isOpen: function () {
      if (!this.periods || this.periods.length === 0) return true;
      let result = true;
      let haveActiveOpenStatuses = false;
      let haveActiveClosedStatuses = false

      let active = this.activePeriods
      if (!active || active.length === 0) {
        return this.isDefaultStatusOpen();
      } else {
        active.forEach(period => {
          if (period.status === 'closed') {
            EmbedTaikaChatCore.closedText = (EmbedTaikaChatCore.closedText) ? EmbedTaikaChatCore.closedText : period.text
            haveActiveClosedStatuses = true
          } else if (period.status === 'open') {
            haveActiveOpenStatuses = true
          }
        })
        return !haveActiveClosedStatuses && (this.isDefaultStatusOpen() || haveActiveOpenStatuses);
      }
    },
    isDefaultStatusOpen: function () {
      let result = true
      this.periods.forEach(period => {
        if (period.duration === 'default') {
          if (period.status !== 'open') {
            EmbedTaikaChatCore.closedText = period.text
            result = false
          }
        }
      })
      return result;
    },
    setStatusMessage: function (message) {
      if (!message.hasOwnProperty('type')) return;
      //---------evg---name in the line answer on the client chat
      // EmbedTaikaChatUI.setStatusMessage(message.message_text + ' ' + EmbedTaikaChatCommon.getMsgByLocale(message.type));
      EmbedTaikaChatUI.setStatusMessage(EmbedTaikaChatCommon.getMsgByLocale('Customer support writing'));
      if (message.type === 'disconnect') {
        if (this.statusTimeout) clearTimeout(this.statusTimeout);
      } else if (message.type === 'join') {
        //-----evg name in the line answer on the client chat
        EmbedTaikaChatUI.setStatusMessage(EmbedTaikaChatCommon.getMsgByLocale('Customer support online'));
        if (this.statusTimeout) clearTimeout(this.statusTimeout);
      } else if (message.type === 'writing') {
        this.statusTimeout = setTimeout(() => {
          EmbedTaikaChatUI.setStatusMessage('');
        }, 4000)
      }
    },
    sendClientMaximized: function (maximize) {
      EmbedTaikaChatCore.socketSend({
        "CLIENT_CHAT_MAXIMIZED": maximize,
      });
      if (maximize) {
        EmbedTaikaChatCore.socketSend({ // Ask open hours
          "GET_SERVICE_PARAMS": "",
        });

        if (EmbedTaikaChatCore.messagesHistoryCleared) {
          EmbedTaikaChatCore.socketSend({ // get all message history
            "GET_ALL_MESSAGES": "",
          });
        }
      }
    },
    sendClientJoined: function () {
      EmbedTaikaChatCore.socketSend({
        action: 'userJoinRoom'
      });
      EmbedTaikaChatCore.socketSend({
        "CLIENT_CHAT_ANSWERS": EmbedTaikaChatCore.chatAnswers,
      });
    },
    sendClientWriting: function () {
      if (EmbedTaikaChatCore.socket) {
        EmbedTaikaChatCore.client_status = 5;
        EmbedTaikaChatCore.socketSend({
          "CLIENT_CHAT_WRITING": true,
        });
      }
    },
    sendClientMessage: function (message_text, attachments) {
      let message = {
        CLIENT_CHAT_MESSAGE: ""
      }
      if (attachments) {
        message.attachments = attachments;
      }
      message.message_text = message_text;
      EmbedTaikaChatCore.socketSend(message);
    },
    sendClientChatClosed(satisfaction, max) {
      this.socketSend({
        "CLIENT_CHAT_CLOSED": 11,
        satisfaction: {
          val: satisfaction,
          max: max
        }
      });
    },
    calculateTimeAndDateInPeriodTimezone(period) {
      let testDate = new Date();
      let testDateString = testDate.toISOString();
      let dateInDefaultTimeZone = moment.tz(testDateString, moment.tz.guess())
      let dateFormat = dateInDefaultTimeZone._f
      let testWeekDay = weekdays[dateInDefaultTimeZone._d.getDay()];
      EmbedTaikaChatCore.weekDayInBusinessHoursTimeZone = testWeekDay
      if (period.timezone) dateInDefaultTimeZone.tz(period.timezone.value)
      let dateInBusinessHoursTimeZone = dateInDefaultTimeZone.format(dateFormat)
      EmbedTaikaChatCore.dateInBusinessHoursTimeZone = dateInBusinessHoursTimeZone
      EmbedTaikaChatCore.timeInBusinessHoursTimeZone = dateInBusinessHoursTimeZone.substr(11, 5)
    },
    isTestInWeekOrNeverPeriod(period) {
      let dateinTZ = EmbedTaikaChatCore.dateInBusinessHoursTimeZone
      if (period.startDate && dateinTZ < period.startDate) {
        return false
      }
      if (period.endDate && dateinTZ > period.endDate) {
        return false
      }
      return true
    },
    isTestInTime(period) {
      let timeinTZ = EmbedTaikaChatCore.timeInBusinessHoursTimeZone
      let result = true
      if (period.startTime && period.startTime.hours && timeinTZ < period.startTime.hours + ":" + period.startTime.minutes) {
        result = false
      } else if (period.endTime && period.endTime.hours && timeinTZ > period.endTime.hours + ":" + period.endTime.minutes) {
        result = false
      }
      return result;
    },
    comparePeriods(p1, p2) {
      if (p1.status > p2.status) {
        return -1;
      } else if (p1.status < p2.status) {
        return 1;
      }
      if (p1.startTime.hours < p2.startTime.hours) {
        return -1;
      } else if (p1.startTime.hours > p2.startTime.hours) {
        return 1;
      }
      if (p1.startTime.minutes < p2.startTime.minutes) {
        return -1;
      } else if (p1.startTime.minutes > p2.startTime.minutes) {
        return 1;
      }
      return 0;
    },
    getActivePeriods: function () {
      let activePeriods = [];
      if (!this.todayPeriods) return activePeriods;
      EmbedTaikaChatCore.todayPeriods.forEach(period => {
        this.calculateTimeAndDateInPeriodTimezone(period)
        if (this.isTestInTime(period)) activePeriods.push(period)
      })
      return activePeriods;
    },
    getTodayPeriods: function () {
      let todaysPeriods = []
      if (!this.periods || this.periods.length === 0) return todaysPeriods;
      this.periods.forEach(period => {
        this.calculateTimeAndDateInPeriodTimezone(period)
        let dateinTZ = EmbedTaikaChatCore.dateInBusinessHoursTimeZone
        let timeinTZ = EmbedTaikaChatCore.timeInBusinessHoursTimeZone
        let weekdayinTZ = EmbedTaikaChatCore.weekDayInBusinessHoursTimeZone

        if (period.duration === 'never') {
          if (this.isTestInWeekOrNeverPeriod(period)) todaysPeriods.push(period)
        } else if (period.duration === 'per_week' && period.week && period.week.length > 0) {
          if (period.week.includes(weekdayinTZ)) {
            if (this.isTestInWeekOrNeverPeriod(period)) todaysPeriods.push(period)
          }
        } else if (period.duration === 'every_year') {
          if (period.startDate.substr(5, 5) <= dateinTZ.substr(5, 5) &&
            period.endDate.substr(5, 5) >= dateinTZ.substr(5, 5)) {
            todaysPeriods.push(period)
          }
        } else if (period.duration === 'every_month') {
          if (period.startDate.substr(8, 2) <= dateinTZ.substr(8, 2) &&
            period.endDate.substr(8, 2) >= dateinTZ.substr(8, 2)) {
            todaysPeriods.push(period)
          }
        }
      });
      todaysPeriods.sort(this.comparePeriods)
      return todaysPeriods;
    },
    showChatButton: function () {
      if (!EmbedTaikaChatCore.chat_activated && EmbedTaikaChatCommon.translations && EmbedTaikaChatCore.periods) {
        EmbedTaikaChatUI.showChatButton();
      }
    },
    parseMessage: function (obj, all) {
      var mess = {
        id: "",
        text: "",
        user: "",
        action: "",
        attachments: [],
        date: EmbedTaikaChatCommon.formatDate(new Date())
      };

      if (obj.hasOwnProperty("message_id")) {
        mess.id = obj["message_id"];
      }
      if (obj.hasOwnProperty("timestamp")) {
        mess.date = EmbedTaikaChatCommon.formatDate(new Date(obj["timestamp"]));
      }
      if (obj.hasOwnProperty("user_name")) {
        mess.user = obj["user_name"];
      }
      if (obj.hasOwnProperty("action")) {
        mess.action = obj["action"];
      }
      if (obj.hasOwnProperty("message_text")) {
        mess.text = EmbedTaikaChatCommon.formattedNewLine(obj["message_text"]);
      }
      if (obj.hasOwnProperty("attachments")) {
        mess.attachments = obj["attachments"];
      }
      if (mess.action !== "AGENT_CHAT_MESSAGE" && obj.hasOwnProperty("AGENT_CHAT_MESSAGE")) {
        mess.action = "agent_message"
      }
      EmbedTaikaChatUI.putMessage(mess);
    },
    checkAgentWritingTime: function () {
      var endTime = new Date();
      var timeDiff = endTime - EmbedTaikaChatCore.startTime;
      if (timeDiff > 5000) {
        if (EmbedTaikaChatCore.agent_status < 10) {
          EmbedTaikaChatCore.agent_status = 1;
        }
      }
    },
    showSchedule() {
      return (EmbedTaikaChatCore.isOpen() && EmbedTaikaChatCore.settings.chat.schedule.showOpenTime) ||
        (!EmbedTaikaChatCore.isOpen() && EmbedTaikaChatCore.settings.chat.schedule.ifClosed === 'showOpenTime')

    },
  };
}());

var EmbedTaikaChatCommon = EmbedTaikaChatCommon || (function () {
  return {
    formatDate: function (dt) {
      return ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2) + ":" + ("0" + dt.getSeconds()).slice(-2);
    },
    urlify: function (text) {
      //console.log(' - urlify');
      var exp = /(\b(((https?|ftp|file|):\/\/)|www[.])[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      var temp = text.replace(exp, "<a href=\"$1\" target=\"_blank\">$1</a>");
      var result = "";
      while (temp.length > 0) {
        var pos = temp.indexOf("href=\"");
        if (pos == -1) {
          result += temp;
          break;
        }
        result += temp.substring(0, pos + 6);
        temp = temp.substring(pos + 6, temp.length);
        if ((temp.indexOf("://") > 8) || (temp.indexOf("://") == -1)) {
          result += "http://";
        }
      }
      return result;
    },
    escapeHtml: function (string) {
      return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
    },
    generateUUID: function () {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      // console.log(uuid)
      return uuid;
    },
    formattedNewLine(text) {
      return text.replace(/(?:\r\n|\r|\n)/g, '<br>')
    },
    convertHoursToUserTimezone(periodTimezone, userTimezone, time) {
      let nowDate = moment.tz(new Date(), periodTimezone);
      let nowDateFormated = nowDate.format().substr(0, 10)
      let convertedToTZStartDate = moment.tz(nowDateFormated + " " + time, periodTimezone);
      return convertedToTZStartDate.tz(userTimezone).format().substr(11, 5)
    },
    getMsgByLocale: function (msg) {
      return (this.translations[msg]) ? this.translations[msg] : `No chat key for ${msg}`
    },
    initTranslations: function (translations) {
      this.translations = {}
      if (translations && translations.length > 0) {
        translations.forEach(translation => {
          this.translations[translation["key"]] = translation["value"]
        })
      }
    },
    formatSize: function (bytes) {
      const decimals = 2
      if (bytes === 0) return '0 ' + this.getMsgByLocale('Bytes');

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = [this.getMsgByLocale('Bytes'), this.getMsgByLocale('KB'), this.getMsgByLocale('MB'),
        this.getMsgByLocale('GB'), this.getMsgByLocale('TB'), this.getMsgByLocale('PB'),
        this.getMsgByLocale('EB'), this.getMsgByLocale('ZB'), this.getMsgByLocale('YB')
      ];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
  };
}());
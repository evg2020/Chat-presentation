function dynamicallyLoadScript(url, defer) {
  var script = document.createElement("script"); // Make a script DOM node
  script.src = url; // Set it's src to the provided URL
  if (defer) {
    script.async = false;
  }
  document.head.appendChild(script); // Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
dynamicallyLoadScript('https://connect.taikacompany.com/static/res/printThis.js');
dynamicallyLoadScript('https://connect.taikacompany.com/static/res/chatScriptCore.js');
dynamicallyLoadScript('https://connect.taikacompany.com/static/res/moment_with_timezone.js', true);

$("<link rel='stylesheet' id='chatstyle-css' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css' type='text/css' media='all' />").appendTo('head');
$("<link rel='stylesheet' id='chatstyle-css' href='https://connect.taikacompany.com/static/res/taika-chat-preview.css' type='text/css' media='all' />").appendTo('head');
$("<link rel='stylesheet' id='chatstyle-css' href='https://connect.taikacompany.com/static/res/taika_test_style.css' type='text/css' media='all' />").appendTo('head');

function checkMoment() {
  if (typeof moment !== "undefined" && moment && moment.tz) {
    if (initDelayTimeout) clearTimeout(initDelayTimeout);
    EmbedTaikaChatCore.init('wss://connect.taikacompany.com/chat/socket', 'https://connect.taikacompany.com/static/res/', {
      "channelType": "chat",
      "department": "62cbe8edf64968d77cf085a9",
      "departments": [],
      "fields": [],
      "sla": {
        "silver": {
          "time": 1,
          "unit": "h",
          "toggled": false,
          "honorOffHours": false
        },
        "gold": {
          "time": 30,
          "unit": "m",
          "toggled": false,
          "honorOffHours": false
        },
        "platinum": {
          "time": 1,
          "unit": "m",
          "toggled": false,
          "honorOffHours": false
        }
      },
      "locale": "5ad84f719bd1787c7f30da94",
      "email": {
        "emailThread": true
      },
      "chat": {
        "schedule": {
          "ifClosed": "keepChatOn",
          "showOpenTime": true
        },
        "welcomeText": "Welcome to chat",
        "questions": ["username"],
        "customerSatisfaction": {
          "toggled": true,
          "scale": 5
        },
        "autoReply": {
          "enabled": false,
          "message": "",
          "delay": 3
        },
        "window": {
          "logo": null,
          "chatActions": [],
          "chatHeaders": [],
          "customHeader": "",
          "backgroundColor": "000000",
          "backgroundCustomColor": ""
        },
        "button": {
          "chatIcon": false,
          "availableAgents": false,
          "ifNoAgents": "keepChatOn",
          "textSize": "normal",
          "cornerRadius": "100%",
          "color": "000000",
          "customColor": "",
          "customText": "",
          "alignment": "bottom-right",
          "gaps": {
            "horizontal": {
              "value": 10,
              "unit": "px"
            },
            "vertical": {
              "value": 10,
              "unit": "%"
            }
          }
        }
      },
      "task": {
        "isShowAmount": false,
        "isShowWorkTime": false
      },
      "playAlarm": true,
      "disabled": false,
      "canRemoveTicket": false,
      "_id": "62cbe947659b2b15ae35e160",
      "__v": 0
    });
  } else {
    var initDelayTimeout = setTimeout(checkMoment, 500);
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  checkMoment()
})
function dynamicallyLoadScript(url, defer) {
  var script = document.createElement("script"); // Make a script DOM node
  script.src = url; // Set it's src to the provided URL
  if (defer) {
    script.async = false;
  }
  document.head.appendChild(script); // Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
dynamicallyLoadScript('./printThis.js');
dynamicallyLoadScript('./chatScriptCore.js');
dynamicallyLoadScript('./moment_with_timezone.js', true);

$("<link rel='stylesheet' id='chatstyle-css' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css' type='text/css' media='all' />").appendTo('head');
$("<link rel='stylesheet' id='chatstyle-css' href='./css/taika-chat-preview.css' type='text/css' media='all' />").appendTo('head');
$("<link rel='stylesheet' id='chatstyle-css' href='./css/taika_test_style.css' type='text/css' media='all' />").appendTo('head');

function checkMoment() {
  if (typeof moment !== "undefined" && moment && moment.tz) {
    if (initDelayTimeout) clearTimeout(initDelayTimeout);
    EmbedTaikaChatCore.init('wss://connect.taikacompany.com/chat/socket', 'https://connect.taikacompany.com/static/res/', {
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
      "email": {
        "emailThread": true
      },
      "chat": {
        "schedule": {
          "showOpenTime": false,
          "ifClosed": "keepChatOn"
        },
        "customerSatisfaction": {
          "toggled": true,
          "scale": 5
        },
        "autoReply": {
          "enabled": false,
          "message": "We have received your message please wait",
          "delay": 3
        },
        "window": {
          "logo": null,
          "chatActions": [],
          "chatHeaders": [],
          "customHeader": "Trip Company",
          "backgroundColor": "33AA44",
          "backgroundCustomColor": "",
          "fontColor": "F2F2F2"
        },
        "button": {
          "gaps": {
            "horizontal": {
              "value": 30,
              "unit": "px"
            },
            "vertical": {
              "value": 10,
              "unit": "%"
            }
          },
          "chatIcon": false,
          "availableAgents": false,
          "customText": "",
          "textSize": "normal",
          "cornerRadius": "20%/50%",
          "color": "33AA44",
          "customColor": "",
          "alignment": "bottom-right",
          "ifNoAgents": "keepChatOn",
          "fontColor": "F2F2F2"
        },
        "welcomeText": "Welcome to chat",
        "questions": ["username"]
      },
      "task": {
        "isShowAmount": false,
        "isShowWorkTime": false
      },
      "_id": "624fe4478bce913b2bdf0d14",
      "channelType": "chat",
      "department": "5b9a28a7a6308436a8b719ce",
      "departments": [],
      "fields": [],
      "locale": "5ad84f719bd1787c7f30da94",
      "playAlarm": true,
      "disabled": false,
      "canRemoveTicket": false,
      "__v": 0
    });
  } else {
    var initDelayTimeout = setTimeout(checkMoment, 500);
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  checkMoment()
})
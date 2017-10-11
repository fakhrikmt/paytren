var SaveFrom_Utils = {
  downloadParam: 'sfh--download',

  setStyle: function(node, style)
  {
    if(!node || !style)
      return;

    for(var i in style)
      node.style[i] = style[i];
  },


  getStyle: function(node, property) {
    return node && window.getComputedStyle && window.getComputedStyle(node, null).getPropertyValue(property);
  },

  addStyleRules: function(selector, rules, className)
  {
    var style = className ? document.querySelector('#savefrom-styles.'+className) : document.getElementById('savefrom-styles');
    if(!style)
    {
      style = document.createElement('style');
      style.id = 'savefrom-styles';
      if (className) {
        style.classList.add(className);
      }
      // maybe need for safari
      //style.appendChild(document.createTextNode(""));
      var s = document.querySelector('head style');
      if(s)
      // allow to override our styles
        s.parentNode.insertBefore(style, s);
      else
        document.querySelector('head').appendChild(style);
    }

    if(typeof(rules) == 'object') {
      var r = [];
      for(var i in rules)
        r.push(i + ':' + rules[i]);

      rules = r.join(';');
    }

    style.textContent += selector + '{' + rules + '}';
  },

  getPosition: function(node, parent)
  {
    var box = node.getBoundingClientRect();

    if (parent) {
      var parent_pos = parent.getBoundingClientRect();
      return {
        top: Math.round(box.top - parent_pos.top),
        left: Math.round(box.left - parent_pos.left),
        width: box.width,
        height: box.height
      }
    }
    return {
      top: Math.round(box.top + window.pageYOffset),
      left: Math.round(box.left + window.pageXOffset),
      width: box.width,
      height: box.height
    }
  },

  getSize: function(node)
  {
    return {width: node.offsetWidth, height: node.offsetHeight};
  },

  getMatchFirst: function(str, re)
  {
    var m = str.match(re);
    if(m && m.length > 1)
      return m[1];

    return '';
  },

  getElementByIds: function(ids)
  {
    for(var i = 0; i < ids.length; i++)
    {
      var node = document.getElementById(ids[i]);
      if(node)
        return node;
    }

    return null;
  },

  getParentByClass: function(node, name) {
    if(!node || name == '') {
      return false;
    }

    var parent;
    if(typeof name === 'object' && name.length > 0) {
      for(parent = node; parent; parent = parent.parentNode) {
        if (parent.nodeType !== 1) {
          return null;
        }
        for(var i = 0; i < name.length; i++) {
          if(parent.classList.contains(name[i])) {
            return parent;
          }
        }
      }
    } else {
      for(parent = node; parent; parent = parent.parentNode) {
        if (parent.nodeType !== 1) {
          return null;
        }
        if(parent.classList.contains(name)) {
          return parent;
        }
      }
    }

    return null;
  },

  getParentByTagName: function(node, tagName) {
    if(!node || !tagName) {
      return false;
    }

    for(var parent = node; parent; parent = parent.parentNode) {
      if (parent.nodeType !== 1) {
        return null;
      }

      if(parent.tagName === tagName) {
        return parent;
      }
    }

    return null;
  },

  getParentById: function(node, id) {
    for(var parent = node; parent; parent = parent.parentNode) {
      if (parent.nodeType !== 1) {
        return null;
      }

      if(parent.id === id) {
        return parent;
      }
    }

    return null;
  },

  hasChildrenTagName: function(node, tagName) {
    for (var i = 0, item; item = node.childNodes[i]; i++) {
      if (item.nodeType !== 1) {
        continue;
      }
      if (item.tagName === tagName) {
        return true;
      }
    }
    return false;
  },

  isParent: function(node, testParent)
  {
    if (!testParent || [1, 9, 11].indexOf(testParent.nodeType) === -1) {
      return false;
    }

    return testParent.contains(node);
  },


  emptyNode: function(node)
  {
    while(node.firstChild)
      node.removeChild(node.firstChild);
  },

  download: function(filename, url, requestOptions, callback)
  {
    if(!url)
      return false;

    filename = filename || this.getFileName(url);
    if(!filename)
      return false;

    if (!mono.global.preference.downloads) {
      return false;
    }

    var params = requestOptions || {};
    params.url = url;
    params.filename = filename;

    callback = callback || undefined;

    mono.sendMessage({
      action: 'downloadFile',
      options: params
    }, callback);

    return true;
  },

  downloadList: {
    showDownloadWarningPopup: function(onContinue, type) {
      var template = SaveFrom_Utils.playlist.getInfoPopupTemplate();

      mono.sendMessage({action: 'getWarningIcon', type: type}, function(icon) {
        template.icon.style.backgroundImage = 'url(' + icon + ')';
      });

      mono.create(template.textContainer, {
        append: [
          mono.create('p', {
            text: mono.global.language.warningPopupTitle,
            style: {
              color: '#0D0D0D',
              fontSize: '20px',
              marginBottom: '11px',
              marginTop: '13px'
            }
          }),
          mono.create('p', {
            text: mono.global.language.warningPopupDesc+' ',
            style: {
              color: '#868686',
              fontSize: '14px',
              marginBottom: '13px',
              lineHeight: '24px',
              marginTop: '0px'
            },
            append: mono.create('a', {
              href: (mono.global.language.lang === 'ru' || mono.global.language.lang === 'uk')?'http://vk.com/page-55689929_49003549':'http://vk.com/page-55689929_49004259',
              text: mono.global.language.readMore,
              target: '_blank',
              style: {
                color: '#4A90E2'
              }
            })
          }),
          mono.create('p', {
            style: {
              marginBottom: '13px'
            },
            append: [
              mono.create('label', {
                style: {
                  color: '#868686',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '19px'
                },
                append: [
                  mono.create('input', {
                    type: 'checkbox',
                    style: {
                      cssFloat: 'left',
                      marginLeft: '0px'
                    },
                    on: ['click', function() {
                      mono.sendMessage({action: 'hideDownloadWarning', set: this.checked?1:0});
                    }]
                  }),
                  mono.global.language.noWarning
                ]
              })
            ]
          })
        ]
      });

      var cancelBtn = undefined;
      var continueBtn = undefined;
      mono.create(template.buttonContainer, {
        append: [
          cancelBtn = mono.create('button', {
            text: mono.global.language.cancel,
            style: {
              height: '27px',
              width: '118px',
              backgroundColor: '#ffffff',
              border: '1px solid #9e9e9e',
              margin: '12px',
              marginBottom: '11px',
              marginRight: '4px',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }
          }),
          continueBtn = mono.create('button', {
            text: mono.global.language.continue,
            style: {
              height: '27px',
              width: '118px',
              backgroundColor: '#ffffff',
              border: '1px solid #9e9e9e',
              margin: '12px',
              marginBottom: '11px',
              marginRight: '8px',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }
          })
        ]
      });

      cancelBtn.addEventListener('click', function(e) {
        var popup = template.body.parentNode;
        mono.trigger(popup.lastChild, 'click');
      });

      continueBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        onContinue();
        mono.trigger(cancelBtn, 'click');
      });

      SaveFrom_Utils.popupDiv(template.body, 'dl_warning_box_popup');
    },
    startChromeDownloadList: function (options) {
      var folderName = options.folderName;
      var linkList = options.list;


      if (folderName) {
        folderName += '/';
      }

      return mono.sendMessage({action: 'downloadList', fileList: linkList, folder: folderName});
    },
    startOldChromeDownloadList: function(options, hideDialog) {
      var folderName = options.folderName;
      var linkList = options.list;
      var dataType = options.type;

      if (folderName) {
        folderName += '/';
      }

      var itemIndex = 0;
      var pause = false;
      var timeout = 500;

      var focusEl = document.body;

      focusEl.focus();

      if (!hideDialog) {
        focusEl.onblur = function () {
          pause = true;
        };
      }

      var nextOneFile = function() {
        var item = linkList[itemIndex];
        itemIndex++;

        if (item === undefined) {
          return;
        }

        if (mono.global.preference.downloads) {
          SaveFrom_Utils.download(folderName+item.filename, item.url);
        } else {
          mono.trigger(mono.create('a', {
            download: item.filename,
            href: item.url,
            on: ['click', function(e) {
              SaveFrom_Utils.downloadOnClick(e);
            }]
          }), 'click', {
            cancelable: true,
            altKey: true
          });
        }

        if (pause) {
          SaveFrom_Utils.downloadList.showDownloadWarningPopup(function() {
            pause = false;
            focusEl.focus();
            nextOneFile();
          }, dataType);
        } else {
          if (itemIndex > 5 && timeout) {
            timeout = undefined;
            focusEl.onblur = undefined;
            pause = false;
            if (mono.global.preference.downloads) {
              mono.sendMessage({action: 'downloadList', fileList: linkList.slice(itemIndex), folder: folderName});
              return;
            }
          }

          setTimeout(function() {
            nextOneFile();
          }, timeout);
        }
      };

      nextOneFile();
    },
    startDownload: function(options) {
      options.list.forEach(function(item) {
        item.filename = mono.fileName.modify(item.filename);
      });

      options.folderName =  mono.fileName.modify(options.folderName);

      if ((mono.isChrome && mono.global.preference.downloads) || mono.isFirefox) {
        return SaveFrom_Utils.downloadList.startChromeDownloadList(options);
      } else
      if (mono.isGM || mono.isSafari) {
        return mono.sendMessage({action: 'hideDownloadWarning'}, function(state) {
          SaveFrom_Utils.downloadList.startOldChromeDownloadList(options, state);
        });
      }
    },
    showBeforeDownloadPopup: function(list, options) {
      options.list = list;
      var type = options.type;
      var folderName = options.folderName;
      var onContinue = options.onContinue || SaveFrom_Utils.downloadList.startDownload;
      var onShowList = options.onShowList || SaveFrom_Utils.playlist.popupFilelist;
      var count = options.count || list.length;
      var template = SaveFrom_Utils.playlist.getInfoPopupTemplate();

      mono.sendMessage({action: 'getWarningIcon', color: '#00CCFF', type: type}, function(icon) {
        template.icon.style.backgroundImage = 'url('+icon+')';
      });

      var showListLink = [];
      if (onShowList) {
        showListLink = [' (',mono.create('a', {href: '#', text: mono.global.language.vkListOfLinks.toLowerCase()}),')'];
        showListLink[1].addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          onShowList(options.list);
          mono.trigger(cancelBtn, 'click');
        });
      }

      mono.create(template.textContainer, {
        append: [
          mono.create('p', {
            text: folderName || mono.global.language.playlistTitle,
            style: {
              color: '#0D0D0D',
              fontSize: '20px',
              marginBottom: '11px',
              marginTop: '13px'
            }
          }),
          mono.create('p', {
            text: mono.global.language.vkFoundFiles.replace('%d', count),
            style: {
              color: '#868686',
              fontSize: '14px',
              marginBottom: '13px',
              lineHeight: '24px',
              marginTop: '0px'
            },
            append: showListLink
          }),
          mono.create('p', {
            text: mono.global.language.beforeDownloadPopupWarn,
            style: {
              color: '#868686',
              fontSize: '14px',
              marginBottom: '13px',
              lineHeight: '24px',
              marginTop: '0px'
            }
          })
        ]
      });

      var cancelBtn = undefined;
      var dlBtn = undefined;
      mono.create(template.buttonContainer, {
        append: [
          cancelBtn = mono.create('button', {
            text: mono.global.language.cancel,
            style: {
              height: '27px',
              width: '118px',
              backgroundColor: '#ffffff',
              border: '1px solid #9e9e9e',
              margin: '12px',
              marginBottom: '11px',
              marginRight: '4px',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }
          }),
          dlBtn = mono.create('button', {
            text: mono.global.language.continue,
            style: {
              height: '27px',
              width: '118px',
              backgroundColor: '#ffffff',
              border: '1px solid #9e9e9e',
              margin: '12px',
              marginBottom: '11px',
              marginRight: '8px',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }
          })
        ]
      });

      cancelBtn.addEventListener('click', function(e) {
        var popup = template.body.parentNode;
        mono.trigger(popup.lastChild, 'click');
      });

      dlBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        onContinue(options);
        mono.trigger(cancelBtn, 'click');
      });

      SaveFrom_Utils.popupDiv(template.body, 'dl_confirm_box_popup');
    }
  },

  downloadLink: function(a, callback)
  {
    if(!a.href)
      return false;

    var filename = a.getAttribute('download');

    return this.download(filename, a.href, null, callback);
  },

  safariDlLink: function(e) {
    "use strict";
    if (e.button || e.ctrlKey || e.altKey || e.shitfKey) {
      return;
    }

    var me = null;

    var legacy = function(e) {
      var me = document.createEvent('MouseEvents');
      me.initMouseEvent('click', true, e.cancelable, window, 0,
        e.screenX, e.screenY, e.clientX, e.clientY,
        false, true, false, e.metaKey, e.button, e.relatedTarget);
      return me;
    };

    try {
      if (typeof MouseEvent !== 'function') {
        throw 'legacy';
      }
      me = new MouseEvent('click', {
        bubbles: true,
        cancelable: e.cancelable,
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
        metaKey: e.metaKey,
        button: e.button,
        relatedTarget: e.relatedTarget
      });
    } catch (err) {
      me = legacy(e);
    }

    e.preventDefault();
    e.stopPropagation();

    this.dispatchEvent(me);
  },

  downloadOnClick: function(event, callback, options)
  {
    options = options || {};
    var _this = SaveFrom_Utils;

    var node = options.el || event.target;
    if(node.tagName !== 'A') {
      node = mono.getParent(node, 'A');
    }

    if (!node) {
      return;
    }

    if (mono.isSafari) {
      return _this.safariDlLink.call(node, event);
    }

    if (!mono.global.preference.downloads) {
      return;
    }

    if ((mono.isFirefox || mono.isGM) && /^blob:|^data:/.test(node.href)) {
      return;
    }

    if(event.button === 2) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    _this.downloadLink(node, callback);
  },

  getQueryString: function(query, key_prefix, key_suffix)
  {
    if(!query || typeof(query) != 'object')
      return '';

    if(key_prefix === undefined)
      key_prefix = '';

    if(key_suffix === undefined)
      key_suffix = '';

    var str = '';
    for(var key in query)
    {
      if(str.length)
        str += '&';

      if(query[key] instanceof Object)
      {
        if(!key_prefix)
          key_prefix = '';

        if(!key_suffix)
          key_suffix = '';

        str += SaveFrom_Utils.getQueryString(query[key], key_prefix + key + "[", "]" + key_suffix);
      }
      else
        str += key_prefix + escape(key) + key_suffix + '=' + escape(query[key]);
    }

    return str;
  },

  decodeUnicodeEscapeSequence: function(text)
  {
    return text.replace(/\\u([0-9a-f]{4})/g, function(s, m){
      m = parseInt(m, 16);
      if(!isNaN(m))
      {
        return String.fromCharCode(m);
      }
    });
  },


  getFileExtension: function(str, def)
  {
    var ext = this.getMatchFirst(str, /\.([a-z0-9]{3,4})(\?|$)/i);
    if(ext)
      return ext.toLowerCase();

    return (def ? def : '');
  },


  getFileName: function(url)
  {
    var filename = this.getMatchFirst(url, /\/([^\?#\/]+\.[a-z\d]{2,6})(?:\?|#|$)/i);
    if(!filename)
      return filename;

    return mono.fileName.modify(filename);
  },


  getTopLevelDomain: function(domain)
  {
    if(!domain)
      return '';

    if(!domain.match(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/))
      return domain;

    var a = domain.split('.');
    var l = a.length;

    if(l == 2)
      return domain;

    return (a[l - 2] + '.' + a[l - 1]);
  },


  dateToObj: function(ts, leadingZero)
  {
    var d = (ts === null || ts === undefined) ? new Date() : new Date(ts);

    if(leadingZero === undefined)
      leadingZero = true;

    var res = {
      year: d.getFullYear(),
      month: (d.getMonth() + 1),
      day: d.getDate(),
      hour: d.getHours(),
      min: d.getMinutes(),
      sec: d.getSeconds()
    };

    if(leadingZero)
    {
      for(var i in res)
      {
        if(res[i].toString().length == 1)
          res[i] = '0' + res[i];
      }
    }

    return res;
  },


  utf8Encode: function(str)
  {
    str = str.replace(/\r\n/g,"\n");
    var res = "";

    for (var n = 0; n < str.length; n++)
    {
      var c = str.charCodeAt(n);

      if (c < 128)
        res += String.fromCharCode(c);
      else if((c > 127) && (c < 2048))
      {
        res += String.fromCharCode((c >> 6) | 192);
        res += String.fromCharCode((c & 63) | 128);
      }
      else
      {
        res += String.fromCharCode((c >> 12) | 224);
        res += String.fromCharCode(((c >> 6) & 63) | 128);
        res += String.fromCharCode((c & 63) | 128);
      }

    }

    return res;
  },

  sizeHuman: function(size, round)
  {
    if(round == undefined || round == null)
      round = 2;

    var s = size, count = 0, sign = '', unite_spec = [
      mono.global.language.vkFileSizeByte,
      mono.global.language.vkFileSizeKByte,
      mono.global.language.vkFileSizeMByte,
      mono.global.language.vkFileSizeGByte,
      mono.global.language.vkFileSizeTByte
    ];

    if(s < 0)
    {
      sign = '-';
      s = Math.abs(s);
    }

    while(s >= 1000)
    {
      count++;
      s /= 1024;
    }

    if(round >= 0)
    {
      var m = round * 10;
      s = Math.round(s * m) / m;
    }

    if(count < unite_spec.length)
      return sign + s + ' ' + unite_spec[count];

    return size;
  },

  secondsToDuration: function(seconds)
  {
    if(!seconds || isNaN(seconds))
      return '';

    function zfill(time)
    {
      if(time < 10)
        return '0' + time;

      return time.toString();
    }

    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    if(hours > 0)
      return hours + ":" + zfill(minutes) + ":" + zfill(seconds);

    return minutes + ":" + zfill(seconds);
  },

  svg: {
    icon: {
      download: 'M 4,0 4,8 0,8 8,16 16,8 12,8 12,0 4,0 z',
      info: 'M 8,1.55 C 11.6,1.55 14.4,4.44 14.4,8 14.4,11.6 11.6,14.4 8,14.4 4.44,14.4 1.55,11.6 1.55,8 1.55,4.44 4.44,1.55 8,1.55 M 8,0 C 3.58,0 0,3.58 0,8 0,12.4 3.58,16 8,16 12.4,16 16,12.4 16,8 16,3.58 12.4,0 8,0 L 8,0 z M 9.16,12.3 H 6.92 V 7.01 H 9.16 V 12.3 z M 8.04,5.91 C 7.36,5.91 6.81,5.36 6.81,4.68 6.81,4 7.36,3.45 8.04,3.45 8.72,3.45 9.27,4 9.27,4.68 9.27,5.36 8.72,5.91 8.04,5.91 z',
      noSound: 'M 11.4,5.05 13,6.65 14.6,5.05 16,6.35 14.4,7.95 16,9.55 14.6,11 13,9.35 11.4,11 10,9.55 11.6,7.95 10,6.35 z M 8,1.75 8,14.3 4,10.5 l -4,0 0,-4.75 4,0 z'
    },

    cache: {},

    getSrc: function(icon, color)
    {
      if(!this.icon[icon])
        return '';

      if(!this.cache[icon])
        this.cache[icon] = {};

      if(!this.cache[icon][color])
      {
        this.cache[icon][color] = btoa(
            '<?xml version="1.0" encoding="UTF-8"?>' +
            '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" id="svg2" xml:space="preserve">' +
            '<path d="' + this.icon[icon] + '" fill="' + color + '" /></svg>'
        );
      }

      if(this.cache[icon][color])
        return 'data:image/svg+xml;base64,' + this.cache[icon][color];

      return '';
    },

    getSvg: function (icon, color, width, height) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var svgNS = svg.namespaceURI;
      svg.setAttribute('width', width || '16');
      svg.setAttribute('height', height || width || '16');
      svg.setAttribute('viewBox', '0 0 16 16');

      var path = document.createElementNS(svgNS, 'path');
      svg.appendChild(path);
      path.setAttribute('d', this.icon[icon]);

      if (color) {
        path.setAttribute('fill', color);
      }

      return svg;
    }
  },

  appendDownloadInfo: function(parent, color, boxStyle, btnStyle)
  {
    if(!color)
      color = '#a0a0a0';

    var info = document.createElement('span');
    info.appendChild(document.createTextNode(mono.global.language.downloadTitle));
    this.setStyle(info, {
      display: 'inline-block',
      position: 'relative',
      border: '1px solid ' + color,
      borderRadius: '5px',
      fontSize: '13px',
      lineHeight: '17px',
      padding: '2px 19px 2px 5px',
      marginTop: '5px',
      opacity: 0.9
    });

    if(boxStyle)
      this.setStyle(info, boxStyle);

    var close = document.createElement('span');
    close.textContent = String.fromCharCode(215);
    this.setStyle(close, {
      color: color,
      width: '14px',
      height: '14px',
      fontSize: '14px',
      fontWeight: 'bold',
      lineHeight: '14px',
      position: 'absolute',
      top: 0,
      right: 0,
      overflow: 'hidden',
      cursor: 'pointer'
    });

    if(btnStyle)
      this.setStyle(close, btnStyle);

    close.addEventListener('click', function(){
      info.parentNode.removeChild(info);
      mono.sendMessage({action: 'updateOption', key: 'moduleShowDownloadInfo', value: 0});
    }, false);

    info.appendChild(close);
    parent.appendChild(info);
  },

  /**
   * @param {Object|null} ctrStyle
   * @param {Object|null} btnStyle
   * @param {Object|null} svgStyle
   * @param {Object} details
   * @param {Object} details.url
   * @param {Element} [details.link]
   * @param {Boolean} [details.brackets]
   * @returns {{node: Element}}
   */
  getFileSizeIcon: function (ctrStyle, btnStyle, svgStyle, details) {
    var _this = this;
    var language = mono.global.language;
    details = details || {};
    ctrStyle = ctrStyle || {};
    btnStyle = btnStyle || {};
    svgStyle = svgStyle || {};

    var defaultColor = '#333333';
    var zeroSizeColor = '#ffac00';
    var errorColor = '#ff0000';

    var getIconBtn = function (iconColor) {
      return mono.create('div', {
        style: btnStyle,
        append: [
          mono.create(SaveFrom_Utils.svg.getSvg('info', iconColor), {
            style: svgStyle
          })
        ]
      });
    };

    var onIconClick = function (e) {
      e.stopPropagation();
      e.preventDefault();

      ctr.textContent = '...';
      var url = details.url;
      if (!url) {
        url = details.link && details.link.href;
      }
      mono.sendMessagePromise({
        action: 'getFileSize',
        url: url
      }).then(function (response) {
        if (response.error || !response.fileSize) {
          throw new Error(JSON.stringify(response));
        }

        var fileType = response.fileType || '';
        var size = _this.sizeHuman(response.fileSize, 2);
        var bitRate = '';
        if(details.link && /^audio\//i.test(fileType)) {
          var seconds = parseInt(details.link.dataset.savefromHelperDuration);
          if(seconds > 0) {
            bitRate += Math.floor((response.fileSize / seconds) / 125);
            bitRate += ' ' + mono.global.language.kbps;
          }
        }

        var text = '';
        if(bitRate) {
          text += size + ' ~ ' + bitRate;
        } else {
          text += size;
        }

        if (details.brackets) {
          text = '(' + text + ')';
        }

        ctr.textContent = text;
        ctr.title = fileType;
      }).catch(function (err) {
        mono.error(err);

        var icon;
        if (err.message === 'ZERO') {
          icon = getIconBtn(zeroSizeColor);
          icon.title = language.getFileSizeTitle;
        } else {
          icon = getIconBtn(errorColor);
          icon.title = language.getFileSizeFailTitle;
        }
        icon.addEventListener('click', onIconClick);

        ctr.textContent = '';
        ctr.appendChild(icon);
      });
    };

    var ctr = mono.create('div', {
      style: ctrStyle,
      append: [
        mono.create(getIconBtn(defaultColor), {
          title: language.getFileSizeTitle,
          on: ['click', onIconClick]
        })
      ]
    });

    return {
      node: ctr
    };
  },

  appendFileSizeIcon: function(link, iconStyle, textStyle, error, noBrackets, container) {
    var language = mono.global.language;
    iconStyle = iconStyle || {};
    textStyle = textStyle || {};

    var iconColor = '#333333';
    if(error === '0') {
      iconColor = '#ffac00';
    } else
    if(error) {
      iconColor = '#ff0000';
    } else
    if(iconStyle.color) {
      iconColor = iconStyle.color;
    }

    var defIconStyle = {
      width: '14px',
      height: '14px',
      marginLeft: '3px',
      verticalAlign: 'middle',
      position: 'relative',
      top: '-1px',
      cursor: 'pointer'
    };
    mono.extend(defIconStyle, iconStyle);

    var defTextStyle = {
      fontSize: '75%',
      fontWeight: 'normal',
      marginLeft: '3px',
      whiteSpace: 'nowrap'
    };
    mono.extend(defTextStyle, textStyle);

    var fsBtn = mono.create('img', {
      src: SaveFrom_Utils.svg.getSrc('info', iconColor),
      title: error ? language.getFileSizeFailTitle : language.getFileSizeTitle,
      style: defIconStyle
    });

    var _this = this;

    if (container) {
      container.appendChild(fsBtn);
    } else
    if(link.nextSibling) {
      link.parentNode.insertBefore(fsBtn, link.nextSibling);
    } else {
      link.parentNode.appendChild(fsBtn);
    }

    fsBtn.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();

      var node = mono.create('span', {
        text: '...',
        style: defTextStyle
      });

      fsBtn.parentNode.replaceChild(node, fsBtn);

      return mono.sendMessage({
        action: 'getFileSize',
        url: link.href
      }, function(response) {
        if(response.fileSize > 0) {
          var fileType = response.fileType || '';
          var size = _this.sizeHuman(response.fileSize, 2);
          var bitrate = '';
          if(/^audio\//i.test(fileType)) {
            var seconds = link.getAttribute('data-savefrom-helper-duration');
            seconds = seconds && parseInt(seconds);
            if(seconds > 0) {
              bitrate = Math.floor((response.fileSize / seconds) / 125);
              bitrate += ' ' + mono.global.language.kbps;
            }
          }
          var text = '';

          if(bitrate) {
            text = size + ' ~ ' + bitrate;
          } else {
            text = size;
          }

          if (!noBrackets) {
            text = '(' + text + ')';
          }

          node.textContent = text;
          node.title = fileType;
        } else
        if (response.error) {
          var errBtn = _this.appendFileSizeIcon(link, iconStyle, textStyle, true, noBrackets, document.createDocumentFragment());
          node.parentNode.replaceChild(errBtn, node);
        } else {
          var zeroBtn = _this.appendFileSizeIcon(link, iconStyle, textStyle, '0', noBrackets, document.createDocumentFragment());
          node.parentNode.replaceChild(zeroBtn, node);
        }
      });
    }, false);

    return fsBtn;
  },

  appendNoSoundIcon: function(link, iconStyle) {
    iconStyle = iconStyle || {};

    var noSoundIconColor = '#ff0000';
    if(iconStyle.color) {
      noSoundIconColor = iconStyle.color;
    }

    var defIconStyle = {
      width: '14px',
      height: '14px',
      marginLeft: '3px',
      verticalAlign: 'middle',
      position: 'relative',
      top: '-1px',
      cursor: 'pointer'
    };
    mono.extend(defIconStyle, iconStyle);

    var icon = mono.create('img', {
      src: SaveFrom_Utils.svg.getSrc('noSound', noSoundIconColor),
      title: mono.global.language.withoutAudio,
      style: defIconStyle
    });

    if (link.nextSibling) {
      link.parentNode.insertBefore(icon, link.nextSibling);
    } else
    if (link.parentNode) {
      link.parentNode.appendChild(icon);
    } else {
      link.appendChild(icon);
    }
  },

  video: {
    dataAttr: 'data-savefrom-video-visible',
    yt: {
      inited: false,

      show3D: false,
      showMP4NoAudio: false,

      showFormat: {
        'FLV': true,
        'MP4': true,
        'WebM': false,
        '3GP': false,
        'Audio AAC': false,
        'Audio Vorbis': false,
        'Audio Opus': false
      },

      format: {
        'FLV': {
          '5': {quality: '240'},
          '6': {quality: '270'},
          '34': {quality: '360'},
          '35': {quality: '480'}
        },

        'MP4': {
          '18': {quality: '360'},
          '22': {quality: '720'},
          '37': {quality: '1080'},
          '38': {quality: '8K'},
          '59': {quality: '480'},
          '78': {quality: '480'},
          '82': {quality: '360', '3d': true},
          '83': {quality: '240', '3d': true},
          '84': {quality: '720', '3d': true},
          '85': {quality: '1080', '3d': true},
          '160': {quality: '144', noAudio: true},
          '133': {quality: '240', noAudio: true},
          '134': {quality: '360', noAudio: true},
          '135': {quality: '480', noAudio: true},
          '136': {quality: '720', noAudio: true},
          '137': {quality: '1080', noAudio: true},
          '264': {quality: '1440', noAudio: true},
          '138': {quality: '8K', noAudio: true},
          '298': {quality: '720', noAudio: true, sFps: true},
          '299': {quality: '1080', noAudio: true, sFps: true},
          '266': {quality: '4K', noAudio: true}
        },

        'WebM': {
          '43': {quality: '360'},
          '44': {quality: '480'},
          '45': {quality: '720'},
          '46': {quality: '1080'},
          '167': {quality: '360', noAudio: true},
          '168': {quality: '480', noAudio: true},
          '169': {quality: '720', noAudio: true},
          '170': {quality: '1080', noAudio: true},
          '218': {quality: '480', noAudio: true},
          '219': {quality: '480', noAudio: true},
          '242': {quality: '240', noAudio: true},
          '243': {quality: '360', noAudio: true},
          '244': {quality: '480', noAudio: true},
          '245': {quality: '480', noAudio: true},
          '246': {quality: '480', noAudio: true},
          '247': {quality: '720', noAudio: true},
          '248': {quality: '1080', noAudio: true},
          '271': {quality: '1440', noAudio: true},
          '272': {quality: '8K', noAudio: true},
          '278': {quality: '144', noAudio: true},
          '100': {quality: '360', '3d': true},
          '101': {quality: '480', '3d': true},
          '102': {quality: '720', '3d': true},
          '302': {quality: '720', noAudio: true, sFps: true},
          '303': {quality: '1080', noAudio: true, sFps: true},
          '308': {quality: '1440', noAudio: true, sFps: true},
          '313': {quality: '4K', noAudio: true},
          '315': {quality: '4K', noAudio: true, sFps: true},
          '330': {quality: '144', noAudio: true, sFps: true},
          '331': {quality: '240', noAudio: true, sFps: true},
          '332': {quality: '360', noAudio: true, sFps: true},
          '333': {quality: '480', noAudio: true, sFps: true},
          '334': {quality: '720', noAudio: true, sFps: true},
          '335': {quality: '1080', noAudio: true, sFps: true},
          '336': {quality: '1440', noAudio: true, sFps: true},
          '337': {quality: '2160', noAudio: true, sFps: true}
        },

        '3GP': {
          '17': {quality: '144'},
          '36': {quality: '240'}
        },

        'Audio AAC': {
          '139': {quality: '48', ext: 'aac', noVideo: true},
          '140': {quality: '128', ext: 'aac', noVideo: true},
          '141': {quality: '256', ext: 'aac', noVideo: true},
          '256': {quality: '192', ext: 'aac', noVideo: true},
          '258': {quality: '384', ext: 'aac', noVideo: true}
        },

        'Audio Vorbis': {
          '171': {quality: '128', ext: 'webm', noVideo: true},
          '172': {quality: '192', ext: 'webm', noVideo: true}
        },

        'Audio Opus': {
          '249': {quality: '48', ext: 'opus', noVideo: true},
          '250': {quality: '128', ext: 'opus', noVideo: true},
          '251': {quality: '256', ext: 'opus', noVideo: true}
        }
      },


      init: function()
      {
        if ( SaveFrom_Utils.video.yt.inited ) {
          return;
        }

        ['Audio AAC', 'Audio Vorbis', 'Audio Opus'].forEach(function(item) {
          var formatType = SaveFrom_Utils.video.yt.format[item];
          for (var qualityValue in formatType) {
            formatType[qualityValue].quality += ' ' + mono.global.language.kbps;
          }
        });

        SaveFrom_Utils.video.yt.show3D = mono.global.preference.ytHide3D == '0';
        SaveFrom_Utils.video.yt.showMP4NoAudio = mono.global.preference.ytHideMP4NoAudio == '0';

        var show = false;
        var showAudio = false;
        for(var i in SaveFrom_Utils.video.yt.showFormat)
        {
          var prefName = 'ytHide' + i.replace(' ', '_');
          if (prefName === 'ytHideAudio_AAC') {
            prefName = 'ytHideAudio_MP4';
          }
          var value = mono.global.preference[prefName] == '0';
          if (i === 'Audio AAC') {
            showAudio = value;
          }
          SaveFrom_Utils.video.yt.showFormat[i] = value;
          if(value) {
            show = true;
          }
        }

        SaveFrom_Utils.video.yt.showFormat['Audio Vorbis'] = showAudio;
        SaveFrom_Utils.video.yt.showFormat['Audio Opus'] = showAudio;

        if(!show) {
          SaveFrom_Utils.video.yt.showFormat.FLV = true;
        }

        SaveFrom_Utils.video.yt.inited = true;
      },


      show: function(links, parent, showDownloadInfo, style, videoTitle)
      {
        style = style || {};

        var content = document.createElement('div');
        SaveFrom_Utils.setStyle(content, {
          display: 'inline-block',
          margin: '0 auto'
        });
        parent.appendChild(content);

        var box = document.createElement('div');
        SaveFrom_Utils.setStyle(box, {
          display: 'inline-block',
          padding: '0 90px 0 0',
          position: 'relative'
        });
        content.appendChild(box);

        var tbl = document.createElement('table');
        SaveFrom_Utils.setStyle(tbl, {
          emptyCells: 'show',
          borderCollapse: 'collapse',
          margin: '0 auto',
          padding: '0',
          width: 'auto'
        });
        box.appendChild(tbl);

        var hidden = false;

        for(var i in SaveFrom_Utils.video.yt.format)
        {
          if(SaveFrom_Utils.video.yt.append(links, i,
            SaveFrom_Utils.video.yt.format[i], tbl, style, videoTitle))
          {
            hidden = true;
          }
        }

        for(var i in links)
        {
          if (i === 'ummy' || i === 'ummyAudio' || i === 'meta') {
            continue;
          }
          if(SaveFrom_Utils.video.yt.append(links, '', null, tbl, style, videoTitle))
          {
            hidden = true;
          }

          break;
        }

        if (!tbl.firstChild) {
          parent.textContent = mono.global.language.noLinksFound;
          return;
        }

        if(!hidden)
          return;

        var more = document.createElement('span');
        more.textContent = mono.global.language.more + ' ' + String.fromCharCode(187);
        SaveFrom_Utils.setStyle(more, {
          color: '#555',
          border: '1px solid #a0a0a0',
          borderRadius: '3px',
          display: 'block',
          fontFamily: 'Arial',
          fontSize: '15px',
          lineHeight: '17px',
          padding: '1px 5px',
          position: 'absolute',
          bottom: '3px',
          right: '0',
          cursor: 'pointer'
        });

        if(style.btn && typeof(style.btn) == 'object')
          SaveFrom_Utils.setStyle(more, style.btn);

        box.appendChild(more);

        more.addEventListener('click', function(event){
          event.preventDefault();
          event.stopPropagation();

          var e = parent.querySelectorAll('*[' + SaveFrom_Utils.video.dataAttr + ']');
          for(var i = 0; i < e.length; i++)
          {
            var visible = e[i].getAttribute(SaveFrom_Utils.video.dataAttr);
            var display = 'none', symbol = String.fromCharCode(187);
            if(visible == '0')
            {
              visible = '1';
              display = '';
              symbol = String.fromCharCode(171);
            }
            else
              visible = '0';

            e[i].style.display = display;
            e[i].setAttribute(SaveFrom_Utils.video.dataAttr, visible);
            this.textContent = mono.global.language.more + ' ' + symbol;
          }

          return false;
        }, false);


        if(showDownloadInfo === 1)
        {
          var color = '#a0a0a0', a = tbl.querySelector('td a');

          content.appendChild(document.createElement('br'));
          SaveFrom_Utils.appendDownloadInfo(content, color, null, {
            width: '16px',
            height: '16px',
            fontSize: '16px',
            lineHeight: '16px'
          });
        }
      },


      append: function(links, title, format, parent, style, videoTitle)
      {
        var hidden = false;

        var aStyle = {
          whiteSpace: 'nowrap'
        };

        var sStyle = {
          fontSize: '75%',
          fontWeight: 'normal',
          marginLeft: '3px',
          whiteSpace: 'nowrap'
        };

        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(title ? title : '???'));

        if(!title || !SaveFrom_Utils.video.yt.showFormat[title])
        {
          tr.setAttribute(SaveFrom_Utils.video.dataAttr, '0');
          tr.style.display = 'none';
          hidden = true;
        }

        SaveFrom_Utils.setStyle(td, {
          border: 'none',
          padding: '3px 15px 3px 0',
          textAlign: 'left',
          verticalAlign: 'middle'
        });

        tr.appendChild(td);

        td = document.createElement('td');
        SaveFrom_Utils.setStyle(td, {
          border: 'none',
          padding: '3px 0',
          textAlign: 'left',
          verticalAlign: 'middle',
          lineHeight: '17px'
        });
        tr.appendChild(td);

        var meta = links.meta || {};

        var sep = false;
        if(format)
        {
          for(var i in format)
          {
            if(links[i])
            {
              var quality = format[i].quality;
              if(sep)
              {
                td.lastChild.style.marginRight = '15px';
                td.appendChild(document.createTextNode(' '));
              }

              var span = document.createElement('span');
              span.style.whiteSpace = 'nowrap';

              var a = document.createElement('a');
              a.href = links[i];
              a.title = mono.global.language.downloadTitle;

              if (meta[i]) {
                if (meta[i].quality) {
                  quality = meta[i].quality;
                }

                if (format[i].sFps) {
                  quality += ' ' + (meta[i].fps || 60);
                }
              }

              if (format[i]['3d']) {
                a.textContent = '3D';
              } else {
                a.textContent = quality;
              }
              if(videoTitle)
              {
                var ext = format[i]['ext'];
                if(!ext)
                  ext = title.toLowerCase();

                a.setAttribute('download', mono.fileName.modify(videoTitle + '.' + ext) );

                a.addEventListener('click', function(event) {
                  SaveFrom_Utils.downloadOnClick(event);
                }, false);
              }
              SaveFrom_Utils.setStyle(a, aStyle);
              if(style.link && typeof(style.link) == 'object')
                SaveFrom_Utils.setStyle(a, style.link);

              span.appendChild(a);
              SaveFrom_Utils.appendFileSizeIcon(a, style.fsIcon, style.fsText);

              if(format[i]['3d'])
              {
                if(!SaveFrom_Utils.video.yt.show3D)
                {
                  hidden = true;
                  span.setAttribute(SaveFrom_Utils.video.dataAttr, '0');
                  span.style.display = 'none';
                }

                var s = document.createElement('span');
                s.textContent = quality;
                SaveFrom_Utils.setStyle(s, sStyle);
                if(style.text && typeof(style.text) == 'object')
                  SaveFrom_Utils.setStyle(s, style.text);

                a.appendChild(s);
              }

              if(format[i]['noAudio'])
              {
                if(!SaveFrom_Utils.video.yt.showMP4NoAudio)
                {
                  hidden = true;
                  span.setAttribute(SaveFrom_Utils.video.dataAttr, '0');
                  span.style.display = 'none';
                }

                SaveFrom_Utils.appendNoSoundIcon(a, style ? style.noSoundIcon : false);
              }

              td.appendChild(span);

              sep = true;

              delete links[i];
            }
          }
        }
        else
        {
          for(var i in links)
          {
            if(sep)
            {
              td.lastChild.style.marginRight = '15px';
              td.appendChild(document.createTextNode(' '));
            }

            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';

            var a = document.createElement('a');
            a.href = links[i];
            a.title = mono.global.language.downloadTitle;
            a.textContent = i;
            SaveFrom_Utils.setStyle(a, aStyle);
            if(style.link && typeof(style.link) == 'object')
              SaveFrom_Utils.setStyle(a, style.link);

            span.appendChild(a);
            SaveFrom_Utils.appendFileSizeIcon(a, style.fsIcon, style.fsText);
            td.appendChild(span);

            sep = true;

            delete links[i];
          }
        }

        if (sep === false) {
          return;
        }
        parent.appendChild(tr);

        return hidden;
      }
    }
  }, // video


  playlist: {
    btnStyle: {
      display: 'block',
      fontWeight: 'bold',
      border: 'none',
      textDecoration: 'underline'
    },


    getFilelistHtml: function(links)
    {
      if(!links || links.length == 0)
        return;

      var rows = 0;
      var list = '';

      for(var i = 0; i < links.length; i++)
      {
        if(links[i].url)
        {
          list += links[i].url + '\r\n';
          rows++;
        }
      }

      if(list)
      {
        if(rows < 5) {
          rows = 5;
        } else
        if(rows > 14) {
          rows = 14;
        }

        var textareaNode;
        return mono.create(document.createDocumentFragment(), {
          append: [
            mono.create('p', {
              text: mono.global.language.filelistTitle,
              style: {
                color: '#0D0D0D',
                fontSize: '20px',
                marginBottom: '11px',
                marginTop: '5px'
              }
            }),
            mono.create('p', {
              style: {
                marginBottom: '11px'
              },
              append: mono.parseTemplate(mono.global.language.filelistInstruction)
            }),
            mono.create('p', {
              text: mono.global.language.vkFoundFiles.replace('%d', links.length),
              style: {
                color: '#000',
                marginBottom: '11px'
              },
              append: mono.create('a', {
                text: mono.global.language.playlist,
                href: '#',
                class: 'sf__playlist',
                style: {
                  display: 'none',
                  cssFloat: 'right'
                }
              })
            }),
            textareaNode = mono.create('textarea', {
              text: list,
              rows: rows,
              cols: 60,
              style: {
                width: '100%',
                whiteSpace: (mono.isFirefox || mono.isGmOnly) ? 'normal' : 'nowrap'
              }
            }),
            (!mono.isChrome && !mono.isFirefox)? undefined : mono.create('button', {
              text: mono.global.language.copy,
              style: {
                height: '27px',
                backgroundColor: '#ffffff',
                border: '1px solid #9e9e9e',
                marginTop: '6px',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                cssFloat: 'right'
              },
              on: ['click', function(e) {
                var _this = this;
                _this.disabled = true;
                if (mono.isFirefox) {
                  textareaNode.select();
                  document.execCommand("copy");
                } else {
                  mono.sendMessage({action: 'addToClipboard', text: list});
                }
                setTimeout(function() {
                  _this.disabled = false;
                }, 1000);
              }],
              append: mono.create('style', {
                text: mono.style2Text({
                  '#savefrom_popup_box': {
                    append: {
                      'button:hover:not(:disabled)': {
                        backgroundColor: '#597A9E !important',
                        borderColor: '#597A9E !important',
                        color: '#fff'
                      },
                      'button:active': {
                        opacity: 0.9
                      }
                    }
                  }
                })
              })
            })
          ]
        });
      }
    },


    popupFilelist: function(links, title, playlist, id)
    {
      var content = SaveFrom_Utils.playlist.getFilelistHtml(links);
      if(!content)
        return;

      var popup = SaveFrom_Utils.popupDiv(content, id);
      if(playlist)
      {
        var a = popup.querySelector('a.sf__playlist');
        if(a)
        {
          a.addEventListener('click', function(event){
            setTimeout(function(){
              SaveFrom_Utils.playlist.popupPlaylist(links, title, true, id);
            }, 100);
            event.preventDefault();
            return false;
          }, false);

          SaveFrom_Utils.setStyle(a, SaveFrom_Utils.playlist.btnStyle);
        }
      }
    },

    getInfoPopupTemplate: function() {
      var popupContainer = mono.create('div', {
        class: 'sf-infoPopupTemplate',
        style: {
          width: '400px',
          minHeight: '40px'
        }
      });

      var mediaIcon = mono.create('div', {
        style: {
          backgroundSize: '48px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          display: 'inline-block',
          width: '60px',
          height: '60px',
          cssFloat: 'left',
          marginTop: '16px',
          marginRight: '10px'
        }
      });

      var textContent = mono.create('div', {
        style: {
          display: 'inline-block',
          width: '330px'
        }
      });

      var buttonWrap = mono.create('div', {
        style: {
          textAlign: 'right'
        },
        append: mono.create('style', {
          text: mono.style2Text({
            '.sf-infoPopupTemplate': {
              append: [{
                'a.sf-button': {
                  padding: '1px 6px',
                  display: 'inline-block',
                  textAlign: 'center',
                  height: '23px',
                  lineHeight: '23px',
                  textDecoration: 'none'
                }
              }, {
                selector: ['button:hover', 'a.sf-button:hover'],
                style: {
                  backgroundColor: '#597A9E !important',
                  borderColor: '#597A9E !important',
                  color: '#fff'
                }
              }]
            }
          })
        })
      });

      popupContainer.appendChild(mediaIcon);
      popupContainer.appendChild(textContent);
      popupContainer.appendChild(buttonWrap);
      return {
        icon: mediaIcon,
        buttonContainer: buttonWrap,
        textContainer: textContent,
        body: popupContainer
      }
    },

    getM3U: function(links)
    {
      var text = '#EXTM3U\r\n';

      for(var i = 0; i < links.length; i++)
      {
        if(!links[i].duration)
          links[i].duration = '-1';

        if(links[i].title || links[i].duration)
        {
          text += '#EXTINF:' + links[i].duration + ',' +
            links[i].title + '\r\n';
        }

        text += links[i].url + '\r\n';
      }

      return text;
    },


    getPlaylistHtml: function(links, fileTitle)
    {
      if(!links || links.length == 0)
        return;

      var links_len = links.length;

      var d = SaveFrom_Utils.dateToObj();
      var dateStr = d.year + '-' + d.month + '-' + d.day + ' ' +
        d.hour + '-' + d.min;

      // M3U
      var m3uList = SaveFrom_Utils.playlist.getM3U(links);
      m3uList = m3uList.replace(/\r\n/g, '\n');

      var m3uUrl = mono.getDataUrl(m3uList, 'audio/x-mpegurl');

      var template = SaveFrom_Utils.playlist.getInfoPopupTemplate();

      mono.sendMessage({action: 'getWarningIcon', color: '#00CCFF', type: 'playlist'}, function(icon) {
        template.icon.style.backgroundImage = 'url('+icon+')';
      });

      mono.create(template.textContainer, {
        append: [
          mono.create('p', {
            text: fileTitle || mono.global.language.playlistTitle,
            style: {
              color: '#0D0D0D',
              fontSize: '20px',
              marginBottom: '11px',
              marginTop: '13px'
            }
          }),
          mono.create('p', {
            text: mono.global.language.playlistInstruction,
            style: {
              color: '#868686',
              fontSize: '14px',
              marginBottom: '13px',
              lineHeight: '24px',
              marginTop: '0px'
            }
          }),
          mono.create('a', {
            text: mono.global.language.filelist + ' ('+links_len+')',
            href: '#',
            class: 'sf__playlist',
            style: {
              display: 'none',
              fontSize: '14px',
              marginBottom: '13px',
              lineHeight: '24px',
              marginTop: '0px'
            }
          })
        ]
      });

      if(!fileTitle) {
        fileTitle = 'playlist';
      }
      fileTitle += ' ' + dateStr;

      mono.create(template.buttonContainer, {
        append: [
          mono.create('a', {
            text:  mono.global.language.download,
            href: m3uUrl,
            download: mono.fileName.modify(fileTitle + '.m3u'),
            class: 'sf-button',
            style: {
              width: '118px',
              backgroundColor: '#ffffff',
              border: '1px solid #9e9e9e',
              margin: '12px',
              marginBottom: '11px',
              marginRight: '8px',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }
          })
        ]
      });

      return template.body;
    },


    popupPlaylist: function(links, title, filelist, id)
    {
      var content = SaveFrom_Utils.playlist.getPlaylistHtml(links, title);
      if(!content)
        return;

      var popup = SaveFrom_Utils.popupDiv(content, id);
      if(filelist)
      {
        var a = popup.querySelector('a.sf__playlist');
        if(a)
        {
          a.addEventListener('click', function(event){
            setTimeout(function(){
              SaveFrom_Utils.playlist.popupFilelist(links, title, true, id);
            }, 100);
            event.preventDefault();
            return false;
          }, false);

          a.style.display = 'inline';
          a = null;
        }
      }
      var dl_links = popup.querySelectorAll('a[download]');
      for (var i = 0, el; el = dl_links[i]; i++) {
        el.addEventListener('click', SaveFrom_Utils.downloadOnClick, false);
      }
    }
  },

  popupCloseBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAWUlEQVQ4y2NgGHHAH4j1sYjrQ+WIAvFA/B+I36MZpg8V+w9VQ9Al/5EwzDBkQ2AYr8uwaXiPQ0yfkKuwGUayIYQMI8kQqhlEFa9RLbCpFv1US5BUzSLDBAAARN9OlWGGF8kAAAAASUVORK5CYII=',

  popupDiv: function(content, id, maxWidth, maxHeight, onClose)
  {
    if(!id) {
      id = 'savefrom_popup_box';
    }

    if(!maxWidth)
      maxWidth = 580;

    if(!maxHeight)
      maxHeight = 520;

    var popupBody = document.getElementById(id);
    if(popupBody) {
      popupBody.parentNode.removeChild(popupBody);
    }

    popupBody = mono.create('div', {
      id: id,
      style: {
        zIndex: '9999',
        display: 'block',
        cssFloat: 'none',
        position: 'fixed',
        margin: '0',
        padding: '0',
        visibility: 'hidden',
        color: '#000',
        background: '#fff',
        border: '3px solid #c0cad5',
        borderRadius: '7px',
        overflow: 'auto'
      }
    });


    var cnt = mono.create('div', {
      style: {
        display: 'block',
        cssFloat: 'none',
        position: 'relative',
        overflow: 'auto',
        margin: '0',
        padding: '10px 15px'
      }
    });

    if (typeof content === 'function') {
      content(cnt);
    } else {
      cnt.appendChild(content);
    }

    var btn = mono.create('img', {
      src: SaveFrom_Utils.popupCloseBtn,
      alt: 'x',
      width: 18,
      height: 18,
      style: {
        position: 'absolute',
        top: '10px',
        right: '15px',
        opacity: '0.5',
        cursor: 'pointer'
      },
      on: [
        ['mouseenter', function() {
          "use strict";
          this.style.opacity = '0.9';
        }],
        ['mouseleave', function() {
          "use strict";
          this.style.opacity = '0.5';
        }],
        ['click', function() {
          "use strict";
          if (popupBody.parentNode) {
            popupBody.parentNode.removeChild(popupBody);
          }
          if (onClose) {
            onClose();
          }
          return false;
        }]
      ]
    });

    cnt.appendChild(btn);
    popupBody.appendChild(cnt);
    document.body.appendChild(popupBody);

    if(popupBody.offsetWidth > maxWidth) {
      popupBody.style.width = maxWidth + 'px';
    }

    if(popupBody.offsetHeight > maxHeight) {
      popupBody.style.height = maxHeight + 'px';
      popupBody.style.width = (maxWidth + 20) + 'px';
    }

    setTimeout(function() {
      var l = Math.floor((window.innerWidth - popupBody.offsetWidth) / 2.0);
      var t = Math.floor((window.innerHeight - popupBody.offsetHeight) / 2.0);
      if (t < 0) {
        t = 0;
      }
      if (location.host.indexOf('youtu') !== -1 && t < 92) {
        t = 92;
        popupBody.style.height = (popupBody.offsetHeight - t - 10) + 'px';
      }
      if (l < 0) {
        l = 0;
      }
      SaveFrom_Utils.setStyle(popupBody, {
        top: t + 'px',
        left: l + 'px',
        visibility: 'visible'
      });
    });

    var onDocClose = function(event){
      var node = event.target;
      if(node !== popupBody && !SaveFrom_Utils.isParent(node, popupBody))
      {
        if(popupBody.parentNode){
          popupBody.parentNode.removeChild(popupBody);
        }
        document.removeEventListener('click', onDocClose, false);
        if (onClose) {
          onClose();
        }
      }
    };

    setTimeout(function() {
      document.addEventListener('click', onDocClose, false);
    }, 100);

    popupBody.addEventListener('close', function() {
      if(popupBody.parentNode){
        popupBody.parentNode.removeChild(popupBody);
      }
      document.removeEventListener('click', onDocClose, false);
      if (onClose) {
        onClose();
      }
    });

    popupBody.addEventListener('kill', function() {
      if(popupBody.parentNode){
        popupBody.parentNode.removeChild(popupBody);
      }
      document.removeEventListener('click', onDocClose, false);
    });

    return popupBody;
  },

  popupDiv2: function(_details) {
    "use strict";
    var details = {
      id: 'savefrom_popup_box',
      containerStyle: null,
      bodyStyle: null,
      content: null,
      container: null,
      body: null
    };

    details._onClose = function() {
      document.removeEventListener('click', details._onClose);

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      details.onClose && details.onClose();
    };

    mono.extend(details, _details);

    var container = details.container = mono.create('div', {
      id: details.id,
      style: {
        zIndex: 9999,
        display: 'block',
        position: 'fixed',
        background: '#fff',
        border: '3px solid #c0cad5',
        borderRadius: '7px'
      },
      append: [
        mono.create('style', {
          text: mono.style2Text({
            selector: '#' + details.id,
            style: mono.styleReset
          })
        })
      ],
      on: [
        ['click', function(e) {
          e.stopPropagation();
        }]
      ]
    });

    var closeBtn = mono.create('img', {
      src: SaveFrom_Utils.popupCloseBtn,
      alt: 'x',
      width: 18,
      height: 18,
      style: {
        position: 'absolute',
        top: '10px',
        right: '15px',
        opacity: '0.5',
        cursor: 'pointer'
      },
      on: [
        ['mouseenter', function() {
          "use strict";
          this.style.opacity = '0.9';
        }],
        ['mouseleave', function() {
          "use strict";
          this.style.opacity = '0.5';
        }],
        ['click', details._onClose]
      ]
    });

    container.appendChild(closeBtn);

    var body = details.body = mono.create('div', {
      style: mono.extendPos({
        display: 'block',
        position: 'relative',
        padding: '10px 15px',
        overflow: 'auto'
      }, details.bodyStyle)
    });

    if (typeof details.content === 'function') {
      details.content(body);
    } else {
      body.appendChild(details.content);
    }

    container.appendChild(body);

    document.body.appendChild(container);
    document.addEventListener('click', details._onClose);

    return details;
  },

  // row - used for hide tooltip on mouseout
  // because node can dissaper from DOM before mouseout raised
  showTooltip: function(node, text, row, style)
  {
    if(!node)
      return;

    var tooltip = document.querySelector('.savefrom-tooltip');
    if(!tooltip)
    {
      tooltip = document.createElement('div');
      tooltip.className = 'savefrom-tooltip';
      SaveFrom_Utils.setStyle(tooltip, {
        'position': 'absolute',
        'opacity': 0,
        'zIndex': -1
      });
      if (style) {
        SaveFrom_Utils.setStyle(tooltip, style);
      }
    }

    tooltip.textContent = text;

    if(tooltip.lastNode && tooltip.lastNode === node)
    {
      fixPosition();
      return;
    }

    if(tooltip.lastNode)
    {
      mono.off(tooltip.lastNode, 'mouseleave', hide);
      mono.off(tooltip.lastNode, 'mousemove', fixPosition);
      tooltip.lastRow && mono.off(tooltip.lastRow, 'mouseleave', hide);
    }

    tooltip.lastNode = node;
    row && (tooltip.lastRow = row);

    mono.on(node, 'mouseleave', hide);
    mono.on(node, 'mousemove', fixPosition, false);
    row && mono.on(row, 'mouseleave', hide);

    document.body.appendChild(tooltip);
    fixPosition();

    function fixPosition(e) {
      if (e !== undefined) {
        e.stopPropagation();
      }
      var p = SaveFrom_Utils.getPosition(node),
        s = SaveFrom_Utils.getSize(tooltip);

      if(p.top == 0 && p.left == 0)
        return;

      p.top = p.top - s.height - 10;
      p.left = p.left - s.width / 2 + SaveFrom_Utils.getSize(node).width / 2;

      p.left = Math.min(p.left, document.body.clientWidth + document.body.scrollLeft - s.width);
      if(p.top < document.body.scrollTop)
        p.top = p.top + s.height + SaveFrom_Utils.getSize(node).height + 20;

      p.top += 'px';
      p.left += 'px';

      // show
      p.zIndex = 9999;
      p.opacity = 1;

      SaveFrom_Utils.setStyle(tooltip, p);
    }

    function hide() {
      if(tooltip.parentNode)
        document.body.removeChild(tooltip);

      tooltip.lastNode = null;
      tooltip.lastRow = null;
      SaveFrom_Utils.setStyle(tooltip, {
        zIndex: -1,
        opacity: 0
      });
      mono.off(node, 'mouseleave', hide);
      mono.off(node, 'mousemove', fixPosition);
      row && mono.off(row, 'mouseleave', hide);
    }
  },

  embedDownloader: {
    dataAttr: 'data-savefrom-get-links',
    dataIdAttr: 'data-savefrom-container-id',
    containerClass: 'savefrom-links-container',
    linkClass: 'savefrom-link',
    panel: null,
    lastLink: null,
    style: null,

    hostings: {
      'youtube': {
        re: [
          /^https?:\/\/(?:[a-z]+\.)?youtube\.com\/(?:#!?\/)?watch\?.*v=([\w\-]+)/i,
          /^https?:\/\/(?:[a-z0-9]+\.)?youtube\.com\/(?:embed|v)\/([\w\-]+)/i,
          /^https?:\/\/(?:[a-z]+\.)?youtu\.be\/([\w\-]+)/i
        ],
        action: 'getYoutubeLinks',
        prepareLinks: function(links) {
          var ret = [];
          var sfUtilsYt = SaveFrom_Utils.video.yt;
          var format = sfUtilsYt.format;

          var meta = links.meta || {};

          for(var formatName in format)
          {
            for(var iTag in format[formatName])
            {
              var metaTag = meta[iTag] || {};
              if(links[iTag]) {
                var type = formatName;
                if(format[formatName][iTag].ext) {
                  type = format[formatName][iTag].ext;
                }

                var quality = format[formatName][iTag].quality;
                if (metaTag.quality) {
                  quality = metaTag.quality;
                }

                if (format[formatName][iTag].sFps) {
                  quality += ' ' + (metaTag.fps || 60);
                }

                if (format[formatName][iTag]['3d']) {
                  quality += ' (3d)';
                }

                ret.push({
                  name: formatName + ' ' + quality,
                  type: type,
                  url: links[iTag],
                  noSound: format[formatName][iTag].noAudio
                });
              }
            }
          }

          return ret;
        }
      },
      'vimeo': {
        re: [
          /^https?:\/\/(?:[\w\-]+\.)?vimeo\.com\/(?:\w+\#)?(\d+)/i,
          /^https?:\/\/player\.vimeo\.com\/video\/(\d+)/i,
          /^https?:\/\/(?:[\w\-]+\.)?vimeo\.com\/channels\/(?:[^\/]+)\/(\d+)$/i,
          /^https?:\/\/vimeo\.com\/(?:.+)clip_id=(\d+)/i
        ],
        action: 'getVimeoLinks',
        prepareLinks: function(links) {
          return links.map(function(link) {
            var ext = link.ext;
            if(!ext)
            {
              ext = 'MP4';
              if(link.url.search(/\.flv($|\?)/i) != -1)
                ext = 'FLV';
            }

            link.name = link.name ? link.name : ext;
            link.type = link.type ? link.type : ext;
            link.ext = ext;

            return link;
          });
        }
      },

      'vk': {
        re: [
          /^https?:\/\/(?:[\w\-]+\.)?(?:vk\.com|vkontakte\.ru)\/(?:[^\/]+\/)*(?:[\w\-\.]+\?.*z=)?(video-?\d+_-?\d+\?list=[0-9a-z]+|video-?\d+_-?\d+)/i,
          /^https?:\/\/(?:[\w\-]+\.)?(?:vk\.com|vkontakte\.ru)\/video_ext\.php\?(.+)/i
        ],
        action: 'getVKLinks'
      },

      'dailymotion': {
        re: [
          /^http:\/\/(?:www\.)?dai\.ly\/([a-z0-9]+)_?/i,
          /^https?:\/\/(?:[\w]+\.)?dailymotion\.com(?:\/embed|\/swf)?\/video\/([a-z0-9]+)_?/i
        ],
        action: 'getDailymotionLinks'
      },

      'facebook': {
        re: [
          /^https?:\/\/(?:[\w]+\.)?facebook\.com(?:\/video)?\/video.php.*[?&]{1}v=([0-9]+).*/i,
          /^https?:\/\/(?:[\w]+\.)?facebook\.com\/.+\/videos(?:\/\w[^\/]+)?\/(\d+)/i
        ],
        action: 'getFacebookLinks'
      }
    },


    init: function(style)
    {
      this.style = style;

      if(this.panel) {
        SaveFrom_Utils.popupMenu.removePanel();
      }

      this.panel = null;
      this.lastLink = null;

      var links = document.querySelectorAll('a[' + this.dataAttr + ']'),
        i, l = links.length;

      for(i = 0; i < l; i++)
      {
        if(['savefrom.net', 'sf-addon.com'].indexOf(
          SaveFrom_Utils.getTopLevelDomain(links[i].hostname)) > -1)
        {
          links[i].removeEventListener('click', this.onClick, false);
          links[i].addEventListener('click', this.onClick, false);
        }
      }

      // hide menu on click outside them
      // process dinamically added links
      if (document.body) {
        document.body.removeEventListener('click', this.onBodyClick, true);
        document.body.addEventListener('click', this.onBodyClick, true);
      }
    },


    checkUrl: function(url) {
      for(var hosting in this.hostings) {
        var params = this.hostings[hosting];

        for(var i = 0, len = params.re.length; i < len; i++) {
          var match = url.match(params.re[i]);
          if(match) {
            return {
              hosting: hosting,
              action: params.action,
              extVideoId: match[1]
            };
          }
        }
      }

      return null;
    },

    reMapHosting: function(action) {
      var map = {
        'getYoutubeLinks': 'youtube',
        'getVimeoLinks': 'vimeo',
        'getDailymotionLinks': 'dailymotion',
        'getFacebookLinks': 'facebook',
        'getVKLinks': 'vk'
      };

      return map[action];
    },


    onClick: function(event, a)
    {
      var _this = SaveFrom_Utils.embedDownloader;

      if(!a)
      {
        a = event.target;
        while(a.parentNode) {
          if(a.nodeName === 'A')
            break;
          a = a.parentNode;
        }

        if(!a)
          return;
      }

      var href = a.getAttribute('data-savefrom-get-links');
      if(!href)
        return;

      if(event.button !== 0 || event.ctrlKey || event.shiftKey)
        return;

      if(_this.lastLink === a && _this.panel && _this.panel.style.display != 'none')
      {
        _this.lastLink = null;
        _this.panel.style.display = 'none';

        event.preventDefault();
        event.stopPropagation();
        return;
      }

      _this.lastLink = a;
      var data = _this.checkUrl(href);
      if(!data)
        return;

      event.preventDefault();
      event.stopPropagation();

      var request = {
        action: data.action,
        extVideoId: data.extVideoId
      };

      _this.showLinks(mono.global.language.download + ' ...', null, a);

      mono.sendMessage(request, function(response) {
        var hosting = data.hosting;

        if(response.action != request.action)
        {
          hosting = _this.reMapHosting(response.action);
        }

        if(response.links)
          _this.showLinks(response.links, response.title, a, hosting, true);
        else
          _this.showLinks(mono.global.language.noLinksFound, null, a, undefined, true);
      });

      return false;
    },


    onBodyClick: function(event)
    {
      var _this = SaveFrom_Utils.embedDownloader;

      var node = event.target;

      if(!_this.panel || _this.panel.style.display == 'none')
      {
        if (node.tagName !== 'A' && mono.matches(node, 'A ' + node.tagName)) {
          while(node.parentNode) {
            if(node.tagName === 'A') {
              break;
            }
            node = node.parentNode;
          }
        }

        if (node.nodeName !== 'A') {
          return;
        }

        // dinamic links
        if(node.hasAttribute(_this.dataAttr) &&
          ['savefrom.net', 'sf-addon.com'].indexOf(SaveFrom_Utils.getTopLevelDomain(node.hostname)) > -1)
        {
          return _this.onClick(event, node);
        }

        return;
      }

      if (_this.panel === node || _this.panel.contains(node)) {
        return;
      }

      _this.lastLink = null;
      _this.panel.style.display = 'none';

      event.preventDefault();
      event.stopPropagation();
    },

    hidePanel: function()
    {
      if (this.panel) {
        this.panel.style.display = 'none';
      }
    },

    createMenu: function(links, title, a, hname, update) {
      var menuLinks = mono.global.language.noLinksFound;
      if (typeof links === 'string') {
        menuLinks = links;
      } else
      if (SaveFrom_Utils.popupMenu.prepareLinks[hname] !== undefined && links) {
        menuLinks = SaveFrom_Utils.popupMenu.prepareLinks[hname](links, title);
      }
      var options = {
        links: menuLinks,
        button: a,
        popupId: undefined,
        showFileSize: true,
        containerClass: this.containerClass,
        linkClass: this.linkClass,
        style: {
          popup: (this.style)?this.style.container:undefined,
          item: (this.style)?this.style.link:undefined
        },
        isUpdate: update
      };
      if (update && this.panel) {
        SaveFrom_Utils.popupMenu.update(this.panel, options)
      } else {
        this.panel = SaveFrom_Utils.popupMenu.create(options);
      }
    },

    showLinks: function(links, title, a, hname, update)
    {
      var panel, id = a.getAttribute(this.dataIdAttr);
      if(id)
        panel = document.getElementById(id);

      if(!panel)
      {
        this.createMenu(links, title, a, hname, update);

        return;
      }
      else if(this.panel)
      {
        this.panel.style.display = 'none';
      }

      if(typeof(links) == 'string')
      {
        panel.textContent = links;
      }
      else if(!links || links.length == 0)
      {
        panel.textContent = mono.global.language.noLinksFound;
      }
      else
      {
        // append links
        if(hname && this.hostings[hname] && this.hostings[hname].prepareLinks)
          links = this.hostings[hname].prepareLinks(links);

        panel.textContent = '';

        for(var i = 0; i < links.length; i++)
        {
          if(links[i].url && links[i].name)
          {
            var a = document.createElement('a');
            a.href = links[i].url;
            a.title = mono.global.language.downloadTitle;
            a.appendChild(document.createTextNode(links[i].name));
            var span = document.createElement('span');
            span.className = this.linkClass;

            span.appendChild(a);
            panel.appendChild(span);

            SaveFrom_Utils.appendFileSizeIcon(a);
            if(links[i].noSound)
              SaveFrom_Utils.appendNoSoundIcon(a);

            if(title && !links[i].noTitle && links[i].type)
            {
              a.setAttribute('download', mono.fileName.modify(
                  title + '.' + links[i].type.toLowerCase()));

              a.addEventListener('click', SaveFrom_Utils.downloadOnClick, false);
            }
          }
        }
      }
    }
  },
  createUmmyInfo: function(details, targetNode) {
    "use strict";
    details = details || {};

    var params = mono.extend({
      vid: 111,
      utm_source: 'savefrom-helper',
      utm_medium: 'youtube-helper'
    }, details.params);

    if (!params.utm_campaign) {
      if (details.itemType === 'hd') {
        params.utm_campaign = 'youtube-helper-hd';
      } else
      if (details.itemType === 'mp3') {
        params.utm_campaign = 'youtube-helper-mp3';
      }
    }

    var ummyUrl;
    if (/^Mac/.test(navigator.platform) && /^yt-/.test(params.video)) {
      ummyUrl = 'http://videodownloader.ummy.net/save-from-youtube.html?' + mono.param({
        vid: params.vid,
        video: params.video,
        utm_source: 'savefrom-helper',
        utm_medium: 'youtube-helper',
        utm_campaign: 'ummy',
        utm_content: 'ummy_integration_h'
      });
    } else {
      ummyUrl = 'http://videodownloader.ummy.net/?' + mono.param(params);
    }


    var themeShadowArrowDirStyle, themeArrowDirStyle, themeInfoPopup, themeLinkColor;

    var shadowArrowDirStyle, arrowDirStyle, containerDirArrow;
    if (details.posLeft) {
      shadowArrowDirStyle = {
        border: '8px solid transparent',
        borderLeft: '10px solid rgb(192, 187, 187)',
        borderRight: 0,
        top: '8px',
        right: '11px'
      };

      arrowDirStyle = mono.extend({}, shadowArrowDirStyle, {
        right: '12px',
        borderLeft: '10px solid #fff'
      });

      containerDirArrow = {
        right: '21px'
      };

      if (details.darkTheme) {
        themeShadowArrowDirStyle = {
          borderLeftColor: 'rgba(255, 255, 255, 0.4)'
        };

        themeArrowDirStyle = {
          borderLeftColor: 'rgba(28,28,28, 0.6)'
        };
      }
    } else {
      shadowArrowDirStyle = {
        border: '8px solid transparent',
        borderRight: '10px solid rgb(192, 187, 187)',
        borderLeft: 0,
        top: '8px',
        left: '11px'
      };

      arrowDirStyle = mono.extend({}, shadowArrowDirStyle, {
        left: '12px',
        borderRight: '10px solid #fff'
      });

      containerDirArrow = {
        left: '21px'
      };

      if (details.darkTheme) {
        themeShadowArrowDirStyle = {
          borderRightColor: '#fff'
        };

        themeArrowDirStyle = {
          borderRightColor: '#000'
        };
      }
    }

    if (details.darkTheme) {
      themeLinkColor = {
        'a': {
          color: '#eee'
        }
      };
    } else {
      themeLinkColor = {};
    }

    if (details.darkTheme) {
      themeInfoPopup = {
        backgroundColor: 'rgba(28,28,28,0.8)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        color: '#fff'
      };
    } else {
      themeInfoPopup = {
        backgroundColor: '#fff',
        border: '1px solid #ccc'
      };
    }


    var arrow = mono.create(document.createDocumentFragment(), {
      append: [
        mono.create('span', {
          style: mono.extend({
            display: 'inline-block',
            width: 0,
            position: 'absolute'
          }, shadowArrowDirStyle, themeShadowArrowDirStyle)
        }),
        mono.create('span', {
          style: mono.extend({
            display: 'inline-block',
            width: 0,
            position: 'absolute',
            zIndex: 1
          }, arrowDirStyle, themeArrowDirStyle)
        })
      ]
    });

    var showUmmyInfoNode = null;
    var info = null;
    var infoContainer = mono.create('div', {
      class: 'sf-ummy-info-popup-container',
      style: {
        position: 'absolute',
        zIndex: 9999
      },
      append: [
        arrow,
        info = mono.create('div', {
          class: 'sf-ummy-info-popup',
          style: mono.extend({
            position: 'relative',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '6px 5px',
            textAlign: 'center',
            maxWidth: '240px',
            lineHeight: '16px',
            fontSize: '12px',
            fontFamily: 'arial, sans-serif',
            cursor: 'default'
          }, containerDirArrow, themeInfoPopup),
          append: [
            mono.parseTemplate(mono.global.language.ummyMenuInfo.replace(
              '{url}', ummyUrl
            )),
            mono.create('label', {
              style: {
                verticalAlign: 'middle',
                display: 'block'
              },
              append: [
                showUmmyInfoNode = mono.create('input', {
                  type: 'checkbox',
                  name: 'showUmmyInfo',
                  style: {
                    verticalAlign: 'middle'
                  }
                }),
                mono.global.language.tooltipHide
              ]
            }),
            mono.create('style', {
              text: mono.style2Text({
                '.sf-ummy-info-popup': {
                  append: mono.extend({
                    '> p': {
                      margin: '0 0 .8em 0'
                    },
                    '> p.center': {
                      textAlign: 'center'
                    },
                    '> p > .green-btn-2.arrow': {
                      color: '#fff',
                      background: '#84bd07',
                      borderRadius: '5px',
                      display: 'inline-block',
                      position: 'relative',
                      lineHeight: 1,
                      padding: '8px 34px 8px 10px',
                      textDecoration: 'none',
                      fontSize: '12px'
                    },
                    '> p > .green-btn-2.arrow:hover': {
                      color: '#fff',
                      opacity: 0.8
                    },
                    '> p > .green-btn-2.arrow:after': {
                      background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAAjklEQVQoke3RsRGCQBCF4YuJsQDoQMpjKMImtAjth9xMEj4DF4c5QDH3n7lk773b3XsJNzTpR9DglrwYcUG9w1iHdoTpgYkBJ5QrxkPcDXNDQm/JHR2KOF3UcvoUgnZL8KFBi2I+Yrk2YsZjsaIsBVQ4i08KxqhVu1OYBLji+E/hzTKFlV13pfAVGynkPAFtrlNTMRczMgAAAABJRU5ErkJggg==) 0 0 no-repeat',
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      width: '16px',
                      height: '14px',
                      top: '50%',
                      right: '10px',
                      marginTop: '-7px'
                    },
                    'input': {
                      display: 'inline-block'
                    }
                  }, themeLinkColor)
                }
              })
            })
          ]
        })
      ],
      on: [
        ['mouseclick', function(e) {
          e.stopPropagation();
        }],
        ['mousedown', function(e) {
          e.stopPropagation();
        }]]
    });

    mono.sendMessage({action: 'getUmmyIcon'}, function(dataImg) {
      var icon = info.querySelector('img');
      if (!icon) {
        return;
      }
      icon.src = dataImg;
      icon.style.verticalAlign = 'text-bottom';
    });

    showUmmyInfoNode.checked = !mono.global.preference.showUmmyInfo;
    showUmmyInfoNode.addEventListener('change', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (this.checked) {
        mono.trigger(targetNode, 'sfRmInfoPopup');
        mono.global.preference.showUmmyInfo = 0;
      } else {
        mono.trigger(targetNode, 'sfAddInfoPopup');
        mono.global.preference.showUmmyInfo = 1;
      }

      mono.sendMessage({
        action: 'updateOption',
        key: 'showUmmyInfo',
        value: mono.global.preference.showUmmyInfo
      });
    });

    details.onCreateUmmyInfo && details.onCreateUmmyInfo(infoContainer);

    return infoContainer;
  },
  bindUmmyInfo: function(container, details) {
    "use strict";
    details = details || {};
    // menu
    if (!details.noUmmy && !mono.global.preference.showUmmyInfo) {
      return;
    }
    if (details.widthLimit && document.documentElement.offsetWidth < details.widthLimit) {
      return;
    }

    details.leftOffset = details.leftOffset || 21;

    var infoPopup = null;
    var infoPopupShowTimer = null;
    var positionTop = null;

    var popupArrowTop = 8;
    var popupArrow = null;
    var popupArrowShadow = null;

    var killTimer = null;
    var killTimerUpdate = function() {
      clearTimeout(killTimer);
      killTimer = setTimeout(function() {
        if (infoPopup && infoPopup.parentNode) {
          if (infoPopup.style.display !== 'none') {
            return killTimerUpdate();
          }
          infoPopup.parentNode.removeChild(infoPopup);
        }
      }, 30 * 1000);
    };

    var fixPosition = function() {
      setTimeout(function() {
        var windowHeight = window.innerHeight;
        var infoHeight = infoPopup.clientHeight;
        var scrollY = window.scrollY;
        if (infoHeight + positionTop > windowHeight + scrollY) {
          var newPositionTop = windowHeight - infoHeight + scrollY;
          if (newPositionTop < 0) {
            return;
          }

          if (positionTop === newPositionTop) {
            return;
          }

          infoPopup.style.top = newPositionTop + 'px';

          var raz = 8 - (windowHeight - (infoHeight + positionTop) + scrollY);
          if (popupArrowTop !== raz) {
            popupArrowTop = raz;
            popupArrow.style.top = popupArrowTop + 'px';
            popupArrowShadow.style.top = popupArrowTop + 'px';
          }
        } else {
          if (popupArrowTop !== 8) {
            popupArrowTop = 8;
            popupArrow.style.top = popupArrowTop + 'px';
            popupArrowShadow.style.top = popupArrowTop + 'px';
          }
        }
      });
    };

    var onMouseLeave = function() {
      clearTimeout(infoPopupShowTimer);
      infoPopupShowTimer = setTimeout(function() {
        infoPopup && (infoPopup.style.display = 'none');
      }, 50);
    };

    var updateLeftPos = function(el) {
      var position = SaveFrom_Utils.getPosition(el);
      if (details.posLeft) {
        infoPopup.style.right = (document.documentElement.clientWidth - position.left - details.leftOffset) + 'px';
      } else {
        var size = SaveFrom_Utils.getSize(el);
        infoPopup.style.left = (size.width + position.left - details.leftOffset) + 'px';
      }
    };

    var onMouseEnter = function() {
      if (!details.noUmmy && !mono.global.preference.showUmmyInfo) {
        return;
      }

      clearTimeout(infoPopupShowTimer);

      var position = SaveFrom_Utils.getPosition(container);

      if (!infoPopup) {
        if (details.expUmmyInfo) {
          infoPopup = details.expUmmyInfo(details.createUmmyInfoDetails, container);
        } else {
          infoPopup = SaveFrom_Utils.createUmmyInfo(details.createUmmyInfoDetails, container);
        }

        popupArrow = infoPopup.firstChild;
        popupArrowShadow = popupArrow.nextElementSibling;

        positionTop = position.top - 4;

        mono.on(infoPopup, 'mouseenter', function() {
          clearTimeout(infoPopupShowTimer);
        });

        mono.on(infoPopup, 'mouseleave', onMouseLeave);
      } else {
        positionTop = position.top - 4;
      }

      infoPopup.style.top = positionTop + 'px';

      if (infoPopup.dataset.hide === '1') {
        return;
      }

      updateLeftPos(container);

      if (!infoPopup.parentNode) {
        infoPopup.style.display = 'none';
        (details.container || document.body).appendChild(infoPopup);
      }

      if (infoPopup.style.display !== 'block') {
        infoPopup.style.display = 'block';
        mono.trigger(infoPopup, 'sfShowInfoPopup');
      }

      fixPosition();

      killTimerUpdate();
    };

    mono.on(container, 'mouseenter', onMouseEnter);
    mono.on(container, 'mouseleave', onMouseLeave);

    mono.on(container, 'sfRmInfoPopup', function () {
      mono.off(container, 'mouseenter', onMouseEnter);
    });

    mono.on(container, 'sfAddInfoPopup', function () {
      mono.on(container, 'mouseenter', onMouseEnter);
    });
  },

  popupMenu: {
    popupId: 'sf_popupMenu',
    popup: undefined,
    popupStyle: undefined,
    dataArrtVisible: 'data-isVisible',
    extStyleCache: undefined,
    ummyIcon: null,

    badgeQualityList: ['8K', '4K', '2160', '1440', '1080', '720', 'ummy'],
    createBadge: function(qulity, options) {
      var _this = this;
      options = options || {};
      var style = {
        display: 'inline-block',
        lineHeight: '18px',
        width: '19px',
        height: '17px',
        color: '#fff',
        fontSize: '12px',
        borderRadius: '2px',
        verticalAlign: 'middle',
        textAlign: 'center',
        paddingRight: '2px',
        fontWeight: 'bold',
        marginLeft: '3px'
      };
      for (var key in options.containerStyle) {
        style[key] = options.containerStyle[key];
      }

      var container = mono.create('div', {
        style: style
      });

      if (qulity === '1080' || qulity === '2160' || qulity === '1440' || qulity === '720') {
        container.textContent = 'HD';
        container.style.backgroundColor = '#505050';
        container.style.paddingRight = '1px';
      } else
      if (qulity === '8K' || qulity === '4K') {
        container.textContent = 'HD';
        container.style.paddingRight = '1px';
        container.style.backgroundColor = 'rgb(247, 180, 6)';
      } else
      if (qulity === 'mp3' || qulity === 'MP3') {
        container.textContent = 'MP3';
        container.style.width = '26px';
        container.style.paddingRight = '1px';
        container.style.backgroundColor = '#505050';
      } else
      if (qulity === 'ummy') {
        if (this.ummyIcon) {
          container.style.background = 'url('+this.ummyIcon+') center center no-repeat';
        } else {
          mono.sendMessage({action: 'getUmmyIcon'}, function(dataImg) {
            container.style.background = 'url(' + (_this.ummyIcon = dataImg) + ') center center no-repeat';
          });
        }
      }
      return container;
    },

    getTitleNode: function(link) {
      "use strict";
      var _this = SaveFrom_Utils.popupMenu;

      var titleContainer = mono.create('span', {
        style: {
          cssFloat: 'left'
        }
      });

      if (link.extra === 'converter') {
        var badge = document.createDocumentFragment();
        if (['MP3', '8K', '4K', '1440', '1080', '720'].indexOf(link.format) !== -1) {
          badge.appendChild(_this.createBadge(link.format, {
            containerStyle: {
              marginLeft: 0
            }
          }));
        } else {
          badge.appendChild(document.createTextNode(link.format));
        }
        mono.create(titleContainer, {
          append: [badge, ' ', link.quality]
        });
        badge = null;
      } else
      if ( link.quality === 'ummy' ) {
        // ummy hook
        var badge = document.createDocumentFragment();
        if (link.uQuality !== null) {
          if (['8K', '4K', '1440', '1080', '720'].indexOf(link.uQuality) !== -1) {
            badge.appendChild(document.createTextNode(link.uQuality));
          } else {
            badge.appendChild(_this.createBadge(link.uQuality, {
              containerStyle: {
                marginLeft: 0
              }
            }));
          }
        }
        mono.create(titleContainer, {
          append: [badge, ' ', 'Ummy']
        });
        badge = null;
      } else
      if (link.itemText) {
        titleContainer.textContent = link.itemText;
      } else {
        var titleQuality = link.quality?' '+link.quality:'';
        var titleFormat = link.format ? link.format : '???';
        var title3D = link['3d'] ? '3D ' : '';
        var titleFps = '';
        if (link.sFps) {
          titleFps += ' ' + (link.fps || 60);
        }
        titleContainer.textContent = title3D + titleFormat + titleQuality + titleFps;
      }

      if (_this.badgeQualityList.indexOf( String(link.quality) ) !== -1) {
        titleContainer.appendChild(_this.createBadge(String(link.quality)));
      }

      return titleContainer;
    },

    createPopupItem: function(listItem, options) {
      var _this = SaveFrom_Utils.popupMenu;

      var href;
      if (typeof listItem === 'string') {
        href = listItem;
      } else {
        href = listItem.href;
      }

      if (href === '-') {
        var line = mono.create('div', {
          style: {
            display: 'block',
            margin: '1px 0',
            borderTop: '1px solid rgb(214, 214, 214)'
          }
        });
        return {el: line};
      }

      var itemContainer = document.createElement( (href === '-text-') ? 'div' : 'a' );
      if (options.linkClass) {
        itemContainer.classList.add(options.linkClass);
      }
      var itemContainerStyle = {
        display: 'block',
        padding: '0 5px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      };
      if (listItem.isHidden) {
        itemContainer.setAttribute(_this.dataArrtVisible, '0');
        itemContainerStyle.display = 'none';
      }
      SaveFrom_Utils.setStyle(itemContainer, itemContainerStyle);

      if (href === '-text-') {
        itemContainer.style.lineHeight = '22px';
        return {el: itemContainer};
      }

      itemContainer.href = href;

      if (href === '#') {
        return {el: itemContainer};
      }

      if (mono.isGM || mono.isOpera || mono.isSafari) {
        if (listItem.quality !== 'ummy' && !listItem.extra) {
          itemContainer.title = mono.global.language.downloadTitle;
        }
      }

      if (listItem.forceDownload) {
        var filename = '';
        if (listItem.title) {
          var ext = (listItem.ext || listItem.format || '').toLowerCase();
          if (ext) {
            ext = '.' + ext;
          }
          filename = listItem.title + ext;
        }
        itemContainer.setAttribute('download', mono.fileName.modify(filename));
        itemContainer.addEventListener('click', function(event) {
          SaveFrom_Utils.downloadOnClick(event, null, {
            el: this
          });
        }, false);
      }

      var onItemClickList = [];
      if (listItem.func) {
        if (Array.isArray(listItem.func)) {
          onItemClickList.push.apply(onItemClickList, listItem.func);
        } else {
          onItemClickList.push(listItem.func);
        }
      }
      if (options.onItemClick && onItemClickList.indexOf(options.onItemClick) === -1) {
        onItemClickList.push(options.onItemClick);
      }

      if (onItemClickList.length) {
        itemContainer.addEventListener('click', function (e) {
          var _this = this;
          onItemClickList.forEach(function(cb) {
            "use strict";
            return cb.call(_this, e, listItem);
          });
        }, false);
      }

      if (listItem.isBlank) {
        itemContainer.setAttribute('target', '_blank');
      }

      itemContainer.appendChild(_this.getTitleNode(listItem));

      var infoConteiner = mono.create('span', {
        style: {
          cssFloat: 'right',
          lineHeight: '22px',
          height: '22px'
        }
      });
      var sizeIconStyle = {
        top: '5px',
        verticalAlign: 'top'
      };
      for (var key in options.sizeIconStyle) {
        sizeIconStyle[key] = options.sizeIconStyle[key];
      }
      var sizeIconTextStyle = {
        marginLeft: 0
      };

      if (listItem.noAudio) {
        SaveFrom_Utils.appendNoSoundIcon(infoConteiner, sizeIconStyle);
      }

      var sizeIconNode = null;
      if (!listItem.noSize) {
        infoConteiner.addEventListener('click', function onClick(e) {
          if (infoConteiner.firstChild.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            mono.trigger(infoConteiner.firstChild, 'click', {cancelable: true});
          }
          this.removeEventListener('click', onClick);
        });
        sizeIconNode = SaveFrom_Utils.appendFileSizeIcon(itemContainer, sizeIconStyle, sizeIconTextStyle, undefined, true, infoConteiner, listItem);
      }

      itemContainer.appendChild(infoConteiner);

      if (listItem.quality === 'ummy') {
        var bInfoDetails = mono.extend({}, options.bindUmmyInfoDetails);
        var cInfoDetails = bInfoDetails.createUmmyInfoDetails = mono.extend({
          itemType: listItem.uIsAudio ? 'mp3' : 'hd'
        }, bInfoDetails.createUmmyInfoDetails);
        cInfoDetails.params = mono.extend({
          video: listItem.videoId,
          vid: listItem.vid
        }, cInfoDetails.params);
        SaveFrom_Utils.bindUmmyInfo(itemContainer, bInfoDetails);
      }

      return {el: itemContainer, sizeIcon: sizeIconNode, prop: listItem};
    },

    sortMenuItems: function(list, options) {
      if (options === undefined) {
        options = {};
      }
      var formatPriority = ['ummy','Audio Opus','Audio Vorbis','Audio AAC','3GP','WebM','FLV','MP4'];
      var strQuality = {
        Mobile: 280,
        LD: 280,
        SD: 360,
        HD: 720,
        ummy: 1
      };
      if (options.strQualityExtend) {
        mono.extend(strQuality, options.strQualityExtend);
      }
      var sizePriority = {};
      var bitratePriority = [];
      var defList = [];
      var audioList = [];
      var subtitleList = [];
      var mute60List = [];
      var muteList = [];
      var _3dList = [];
      var unkList = [];

      list.forEach(function(item) {
        var prop = item.prop;
        if (options.noProp) {
          prop = item;
        }
        var sortOptions = prop.sort || {};
        if (!prop.format) {
          unkList.push(item);
          return 1;
        }
        if (prop.isOther) {
          unkList.push(item);
        } else
        if (prop.isSubtitle) {
          subtitleList.push(item);
        } else
        if (prop.noVideo) {
          bitratePriority[prop.quality] = parseInt(prop.quality);
          audioList.push(item);
        } else {
          var size = sortOptions.size || strQuality[prop.quality] || -1;
          if (size === -1) {
            if (String(prop.quality).substr(-1) === 'K') {
              size = parseInt(prop.quality) * 1000;
            } else {
              size = parseInt(prop.quality);
            }
          }
          if (options.maxSize && size > options.maxSize) {
            return 1;
          }
          if (options.minSize && size < options.minSize) {
            return 1;
          }
          sizePriority[prop.quality] = size;
          if (prop.noAudio) {
            if (prop.sFps) {
              mute60List.push(item);
            } else {
              muteList.push(item);
            }
          } else
          if (prop['3d']) {
            _3dList.push(item);
          } else {
            defList.push(item);
          }
        }
      });
      var sizeCompare = function(a, b) {
        return sizePriority[a.quality] > sizePriority[b.quality]? -1 : sizePriority[a.quality] === sizePriority[b.quality]? 0 : 1;
      };
      var bitrateCompare = function(a, b) {
        return bitratePriority[a.quality] > bitratePriority[b.quality]? -1 : (bitratePriority[a.quality] === bitratePriority[b.quality])? 0 : 1;
      };
      var formatCompare = function(a, b) {
        if (a.noVideo && b.noVideo) {
          return bitrateCompare(a, b);
        }
        if (a.noVideo) {
          return 1;
        }
        if (b.noVideo) {
          return -1;
        }
        return formatPriority.indexOf(a.format) > formatPriority.indexOf(b.format)? -1 : formatPriority.indexOf(a.format) === formatPriority.indexOf(b.format)? 0 : 1;
      };

      var compare = function(aa, bb) {
        var a = aa.prop;
        var b = bb.prop;
        if (options.noProp) {
          a = aa;
          b = bb;
        }

        var size = sizeCompare(a, b);
        if (size !== 0) {
          return size;
        }
        return formatCompare(a, b);
      };
      defList.sort(compare);
      _3dList.sort(compare);
      audioList.sort(compare);
      mute60List.sort(compare);
      muteList.sort(compare);

      var resList = null;
      if (options.typeList) {
        resList = [];
        if (options.typeList.indexOf('video') !== -1) {
          resList = resList.concat(defList);
        }
        if (options.typeList.indexOf('3d') !== -1) {
          resList = resList.concat(_3dList);
        }
        if (options.typeList.indexOf('audio') !== -1) {
          resList = resList.concat(audioList);
        }
        if (options.typeList.indexOf('mute') !== -1) {
          resList = resList.concat(muteList);
        }
        if (options.typeList.indexOf('mute60') !== -1) {
          resList = resList.concat(mute60List);
        }
        if (options.typeList.indexOf('subtitles') !== -1) {
          resList = resList.concat(subtitleList);
        }
        if (options.typeList.indexOf('other') !== -1) {
          resList = resList.concat(unkList);
        }
      } else {
        resList = defList.concat(_3dList, audioList, subtitleList, mute60List, muteList, unkList);
      }
      if (options.groupCompare) {
        resList.sort(compare);
      }
      return resList;
    },

    removePanel: function() {
      if (this.popup.parentNode !== null) {
        this.popup.parentNode.removeChild(this.popup);
      }
      if (this.popupStyle !== undefined && this.popupStyle.parentNode !== null) {
        this.popupStyle.parentNode.removeChild(this.popupStyle);
      }
      this.popup = undefined;
      this.popupStyle = undefined;
    },

    getHiddenList: function(hiddenList, options) {
      "use strict";
      var _this = this;
      var content = document.createDocumentFragment();
      var scrollListItemCount = 8;
      if (hiddenList.length < scrollListItemCount) {
        mono.create(content, {
          append: hiddenList
        });
      } else {
        var scrollContainer = mono.create('div', {
          style: {
            maxHeight: (scrollListItemCount * 24) + 'px',
            overflowY: 'scroll',
            display: 'none'
          },
          on: [
            ['wheel', function(e) {
              if (e.wheelDeltaY > 0 && this.scrollTop === 0) {
                e.preventDefault();
              } else
              if (e.wheelDeltaY < 0 && this.scrollHeight - (this.offsetHeight + this.scrollTop) <= 0) {
                e.preventDefault();
              }
            }],
            (function() {
              var hasTopShadow = false;
              return ['scroll', function() {
                if (this.scrollTop !== 0) {
                  if (hasTopShadow) {
                    return;
                  }
                  hasTopShadow = true;
                  this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
                } else {
                  if (!hasTopShadow) {
                    return;
                  }
                  hasTopShadow = false;
                  this.style.boxShadow = '';
                }
              }];
            })()
          ],
          append: hiddenList
        });
        scrollContainer.setAttribute(_this.dataArrtVisible, '0');

        content.appendChild(scrollContainer);
      }

      var separator = _this.createPopupItem('-', options).el;
      content.appendChild(separator);

      var moreItem = _this.createPopupItem('#', options).el;
      mono.create(moreItem, {
        text: mono.global.language.more + ' ' + String.fromCharCode(187), //171 //160 - space
        data: {
          visible: '0'
        },
        on: ['click', function(e) {
          e.preventDefault();
          var state = this.dataset.visible;
          var symbol;
          if (state > 0) {
            state--;
            symbol = 187;
          } else {
            state++;
            symbol = 171;
          }
          this.textContent = mono.global.language.more + ' ' + String.fromCharCode(symbol);
          this.dataset.visible = state;
          var itemList = this.parentNode.querySelectorAll('*[' + _this.dataArrtVisible + ']');
          for (var i = 0, item; item = itemList[i]; i++) {
            if (state === 1) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
            item.setAttribute( _this.dataArrtVisible, state);
          }
        }]
      });
      content.appendChild(moreItem);

      if (options.visibleCount === 0) {
        mono.trigger(moreItem, 'click', {cancelable: true});
      }

      return content;
    },

    getContent: function(options) {
      "use strict";
      var _this = this;
      var links = options.links;

      var content = document.createDocumentFragment();

      var sizeIconList = [];

      if(typeof(links) === 'string') {
        var loadingItem = _this.createPopupItem('-text-', options).el;
        loadingItem.textContent = links;
        content.appendChild( loadingItem );
      } else
      if (links.length === 0) {
        var emptyItem = _this.createPopupItem('-text-', options).el;
        emptyItem.textContent = mono.global.language.noLinksFound;
        content.appendChild( emptyItem );
      } else {
        var items = [];
        links.forEach(function(link) {
          items.push(_this.createPopupItem(link, options));
        });

        items = _this.sortMenuItems(items, options.sortDetails);

        var hiddenList = [];

        items.forEach(function(item) {
          if (item.prop.isHidden) {
            hiddenList.push(item.el);
            return 1;
          }

          content.appendChild(item.el);

          if (options.showFileSize && item.sizeIcon) {
            sizeIconList.push(item.sizeIcon);
          }
        });

        options.visibleCount = items.length - hiddenList.length;

        if (hiddenList.length > 0) {
          if (options.getHiddenListFunc) {
            content.appendChild(options.getHiddenListFunc(hiddenList, options));
          } else {
            content.appendChild(_this.getHiddenList(hiddenList, options));
          }
        }
      }

      return {sizeIconList: sizeIconList, content: content};
    },

    create: function(options) {
      var button = options.button;
      var _this = SaveFrom_Utils.popupMenu;

      options.linkClass = options.linkClass || 'sf-menu-item';

      options.offsetRight = options.offsetRight || 0;
      options.offsetTop = options.offsetTop || 0;

      options.parent = options.parent || document.body;

      if (options.isUpdate && (_this.popup === undefined || _this.popup.style.display === 'none')) {
        return;
      }

      if(_this.popup) {
        _this.removePanel();
      }

      var popupContainer = _this.popup = document.createElement('div');
      var containerSelector = '#'+_this.popupId;
      if (options.popupId) {
        containerSelector = '#'+options.popupId;
        popupContainer.id = options.popupId;
      } else
      if (options.containerClass) {
        containerSelector = '.'+options.containerClass;
        popupContainer.classList.add(options.containerClass);
      } else {
        popupContainer.id = _this.popupId;
      }

      var popupContainerStyle = {
        display: 'block',
        position: 'absolute',
        minHeight: '24px',
        cursor: 'default',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        fontFamily: 'arial, sans-serif'
      };
      if (options.extStyle) {
        delete popupContainerStyle.display;
      }

      var pos = SaveFrom_Utils.getPosition(button, options.parent),
        size = SaveFrom_Utils.getSize(button);

      popupContainerStyle.top = (pos.top + options.offsetTop + size.height) + 'px';
      popupContainerStyle.left = (pos.left + options.offsetRight) + 'px';
      SaveFrom_Utils.setStyle(popupContainer, popupContainerStyle);

      var popupCustomContainerStyle = {
        'background-color': '#fff',
        'z-index': '9999',
        'box-shadow': '0 2px 10px 0 rgba(0,0,0,0.2)',
        border: '1px solid #ccc',
        'border-radius': '3px',
        'font-size': '12px',
        'font-weight': 'bold',
        'min-width': '190px'
      };

      if (options.style && options.style.popup) {
        for (var key in options.style.popup) {
          var value = options.style.popup[key];
          popupCustomContainerStyle[key] = value;
        }
      }

      SaveFrom_Utils.addStyleRules(containerSelector, popupCustomContainerStyle);

      var itemCustomStyle = {
        'line-height': '24px',
        color: '#3D3D3D'
      };

      if (options.style && options.style.item) {
        for (var key in options.style.item) {
          var value = options.style.item[key];
          itemCustomStyle[key] = value;
        }
      }

      SaveFrom_Utils.addStyleRules(containerSelector+' .'+ options.linkClass, itemCustomStyle);

      var stopPropagationFunc = function(e){e.stopPropagation()};
      mono.create(popupContainer, {
        on: [
          ['click', stopPropagationFunc],
          ['mouseover', stopPropagationFunc],
          ['mouseup', stopPropagationFunc],
          ['mousedown', stopPropagationFunc],
          ['mouseout', stopPropagationFunc]
        ]
      });

      while (popupContainer.firstChild !== null) {
        popupContainer.removeChild(popupContainer.firstChild);
      }

      var menuContent = _this.getContent.call(_this, options);
      var sizeIconList = menuContent.sizeIconList;
      menuContent = menuContent.content;
      popupContainer.appendChild(menuContent);


      var hoverBgColor = '#2F8AFF';
      var hoverTextColor = '#fff';
      if (options.style && options.style.hover) {
        hoverBgColor = options.style.hover.backgroundColor || hoverBgColor;
        hoverTextColor = options.style.hover.color || hoverTextColor;
      }
      var styleEl = _this.popupStyle = document.createElement('style');
      styleEl.textContent = mono.style2Text({
        selector: containerSelector,
        append: {
          'a:hover': {
            backgroundColor: hoverBgColor,
            color: hoverTextColor
          },
          '> a:first-child': {
            borderTopLeftRadius: '3px',
            borderTopRightRadius: '3px'
          },
          '> a:last-child': {
            borderBottomLeftRadius: '3px',
            borderBottomRightRadius: '3px'
          }
        }
      });

      options.parent.appendChild(styleEl);
      options.parent.appendChild(popupContainer);
      if (options.extStyle) {
        if (SaveFrom_Utils.popupMenu.extStyleCache !== undefined && SaveFrom_Utils.popupMenu.extStyleCache.parentNode !== null) {
          SaveFrom_Utils.popupMenu.extStyleCache.parentNode.removeChild(SaveFrom_Utils.popupMenu.extStyleCache);
        }

        var extElClassName = 'sf-extElStyle_'+containerSelector.substr(1);
        var extBodyClassName = 'sf-extBodyStyle_'+containerSelector.substr(1);
        var extBodyStyle = document.querySelector('style.'+extBodyClassName);
        if (extBodyStyle === null) {
          document.body.appendChild(mono.create('style', {
            class: extBodyClassName,
            text: mono.style2Text({
              selector: containerSelector,
              style: {
                display: 'none'
              }
            })
          }));
        }
        SaveFrom_Utils.popupMenu.extStyleCache = options.extStyle.appendChild(mono.create('style', {
          class: extElClassName,
          text: mono.style2Text({
            selector: 'body ' + containerSelector,
            style: {
              display: 'block'
            }
          })
        }));
      }

      setTimeout(function() {
        sizeIconList.forEach(function(icon) {
          mono.trigger(icon, 'click', {bubbles: false, cancelable: true});
        });
      });

      return popupContainer;
    },

    update: function(popupContainer, options) {
      var _this = SaveFrom_Utils.popupMenu;

      while (popupContainer.firstChild !== null) {
        popupContainer.removeChild(popupContainer.firstChild);
      }

      var menuContent = _this.getContent.call(_this, options);
      var sizeIconList = menuContent.sizeIconList;
      menuContent = menuContent.content;
      popupContainer.appendChild(menuContent);

      setTimeout(function() {
        sizeIconList.forEach(function(icon) {
          mono.trigger(icon, 'click', {bubbles: false, cancelable: true});
        });
      });
    },

    preprocessItem: {
      srt2url: function(item, popupLink) {
        "use strict";
        var srt = item.srt;
        var blobUrl = mono.getDataUrl(srt, 'text/plain');

        popupLink.ext = 'srt';
        popupLink.format = 'SRT';
        popupLink.href = blobUrl;
        popupLink.noSize = true;
        if (mono.isOpera) {
          popupLink.forceDownload = false;
        }
      }
    },

    prepareLinks: {
      youtube: function(links, title, subtitles, details) {
        details = details || {};
        subtitles = subtitles || [];
        links = mono.extend({}, links);
        var sfUtilsYt = SaveFrom_Utils.video.yt;
        sfUtilsYt.init();

        var menuLinks = [];
        var popupLink = null;
        var meta = links.meta || {};

        Object.keys(sfUtilsYt.format).forEach(function (format) {
          var formatObj = sfUtilsYt.format[format];
          return Object.keys(formatObj).forEach(function (itag) {
            var url = links[itag];
            if (!url) {
              return;
            }

            var isHidden = false;

            if (!sfUtilsYt.showFormat[format]) {
              isHidden = true;
            }

            var prop = formatObj[itag];

            if (prop['3d'] && !sfUtilsYt.show3D) {
              isHidden = true;
            }

            if (prop.noAudio && !sfUtilsYt.showMP4NoAudio) {
              isHidden = true;
            }

            popupLink = {
              href: url,
              isHidden: isHidden,
              title: title,
              format: format,
              itag: itag,
              forceDownload: true
            };

            mono.extend(popupLink, prop);

            var metaTag = meta[itag];
            if (metaTag) {
              if (metaTag.quality) {
                popupLink.quality = metaTag.quality;
              }

              if (metaTag.fps) {
                popupLink.fps = metaTag.fps;
              }
            }

            menuLinks.push(popupLink);
            delete links[itag];
          });
        });


        (links.ummy || links.ummyAudio) && (function () {
          var qualityBadge = null;
          var qualityIndex = -1;
          var badgeQualityList = SaveFrom_Utils.popupMenu.badgeQualityList;
          menuLinks.forEach(function (popupLink) {
            var qIndex = badgeQualityList.indexOf(popupLink.quality);
            if (qIndex !== -1 && (qualityIndex === -1 || qIndex < qualityIndex) ) {
              qualityIndex = qIndex;
            }
          });
          if (qualityIndex !== -1) {
            qualityBadge = badgeQualityList[qualityIndex];
          }

          var videoId = meta.videoId;
          videoId && ['ummy', 'ummyAudio'].forEach(function (itag) {
            var url = links[itag];
            if (!url) {
              return;
            }

            popupLink = {
              href: url,
              quality: 'ummy',
              noSize: true,
              format: 'ummy',
              videoId: 'yt-' + videoId
            };

            if (itag === 'ummy') {
              popupLink.itag = 'ummy';
              popupLink.uQuality = qualityBadge;
            } else
            if (itag === 'ummyAudio') {
              popupLink.itag = 'ummyAudio';
              popupLink.uQuality = 'mp3';
              popupLink.uIsAudio = true;
            }

            if (details.ummyVid) {
              popupLink.vid = details.ummyVid;
            }

            menuLinks.push(popupLink);
            delete links[itag];
          });
        })();

        Object.keys(links).forEach(function (itag) {
          if (itag === 'meta') {
            return;
          }

          popupLink = {
            href: links[itag],
            isHidden: true,
            title: title,
            quality: itag,
            itag: itag,
            forceDownload: true
          };

          menuLinks.push(popupLink);
          delete links[itag];
        });

        subtitles.forEach(function(item) {
          "use strict";
          popupLink = {
            href: item.url,
            isHidden: true,
            quality: 'SRT' + (item.isAuto ? 'A' : ''),
            itemText: mono.global.language.subtitles + ' (' + item.lang + ')',
            title: title + '-' + item.langCode,
            ext: 'vtt',
            format: 'VTT',
            isSubtitle: true,
            langCode: item.langCode,
            forceDownload: true
          };

          if (item.preprocess === 'srt2url') {
            SaveFrom_Utils.popupMenu.preprocessItem.srt2url(item, popupLink);
          }

          menuLinks.push(popupLink);
        });

        meta.extra && meta.extra.forEach(function (item) {
          popupLink = {
            href: '#' + item.extra,
            noSize: true,
            isHidden: false
          };

          mono.extend(popupLink, item);

          if (item.itag) {
            Object.keys(sfUtilsYt.format).some(function (format) {
              var formatObj = sfUtilsYt.format[format];
              var prop = formatObj[item.itag];
              if (prop) {
                mono.extend(popupLink, prop);
                return true;
              }
            });
          }

          if (item.request) {
            popupLink.func = function (e) {
              e.preventDefault();
              return mono.sendMessage(item.request);
            };
          }

          popupLink.noAudio = false;

          menuLinks.push(popupLink);
        });

        return menuLinks;
      },
      vimeo: function(links, title) {
        var menuLinks = [];
        var popupLink;
        links.forEach(function(link) {
          var ext = link.ext;
          if(!ext) {
            ext = 'mp4';
            if(link.url.search(/\.flv($|\?)/i) != -1) {
              ext = 'flv';
            }
          }
          var quality = link.height || '';
          var format = link.type;
          popupLink = { href: link.url, title: title, ext: ext, format: format, quality: quality, forceDownload: true};
          menuLinks.push(popupLink);
        });
        return menuLinks;
      },
      vk: function(links, title) {
        var menuLinks = [];
        var popupLink;
        links.forEach(function(link) {
          var ext = link.name || link.ext;
          if (ext) {
            ext = ext.toLowerCase();
          }
          var format = ext && ext.toUpperCase() || '';
          var quality = link.subname || '';
          popupLink = {
            href: link.url,
            title: title,
            ext: ext,
            format: format,
            quality: quality,
            forceDownload: true
          };
          menuLinks.push(popupLink);
        });
        return menuLinks;
      },
      dailymotion: function(links, title) {
        var menuLinks = [];

        links.forEach(function(link) {
          var popupLink = null;
          if (link.extra === 'ummy') {
            popupLink = {
              href: link.url,
              quality: 'ummy',
              noSize: true,
              format: 'ummy',
              videoId: link.videoId,
              sort: {
                size: 480
              }
            };

            if (link.type === 'ummyAudio') {
              popupLink.uQuality = 'mp3';
              popupLink.uIsAudio = true;
            }
          } else {
            popupLink = {
              href: link.url,
              title: title,
              ext: link.ext,
              format: link.ext,
              quality: link.height || '',
              forceDownload: true
            };

            if (mono.isOpera) {
              popupLink.noSize = true;
            }
          }

          menuLinks.push(popupLink);
        });

        return menuLinks;
      },
      facebook: function(links, title) {
        var menuLinks = [];
        var popupLink;
        links.forEach(function(link) {
          var ext = link.ext;
          var format = (ext)?ext.toUpperCase():'';
          var quality = link.name;
          popupLink = { href: link.url, title: title, ext: ext, format: format, quality: quality, forceDownload: true };
          menuLinks.push(popupLink);
        });
        return menuLinks;
      },
      rutube: function(href) {
        "use strict";
        if (Array.isArray(href)) {
          href = href[0];
        }
        if (typeof href !== 'string') {
          return;
        }
        var links = [];

        var videoId = href.match(/\/embed\/(\d+)/);
        videoId = videoId && videoId[1] || undefined;

        if (!videoId) {
          videoId = href.match(/\/video\/([0-9a-z]+)/);
          videoId = videoId && videoId[1] || undefined;
        }

        if (/\/\/video\./.test(href)) {
          href = href.replace(/\/\/video\./, '//');
          if(!videoId) {
            videoId = href.match(/\/(\d+)$/);
            videoId = videoId && videoId[1] || undefined;
          }
        }

        if (videoId) {
          videoId = 'rt-' + videoId;
        }

        var ummyUrl = href.replace(/^.*(\/\/.*)$/, 'ummy:$1');

        var videoLink = {
          href: ummyUrl,
          quality: 'ummy',
          noSize: true,
          format: 'ummy',
          itag: 'ummy',
          uQuality: '720',
          vid: 114,
          videoId: videoId
        };

        var sep = '?';
        if (ummyUrl.indexOf(sep) !== -1) {
          sep = '&';
        }
        ummyUrl += sep + 'sf_type=audio';

        var audioLink = {
          href: ummyUrl,
          quality: 'ummy',
          noSize: true,
          format: 'ummy',
          itag: 'ummyAudio',
          uQuality: 'mp3',
          uIsAudio: true,
          vid: 114,
          videoId: videoId
        };

        links.push(videoLink);
        links.push(audioLink);

        return links;
      },
      mailru: function(links, title) {
        var menuLinks = [];
        var popupLink;
        links.forEach(function(link) {
          var ext = link.ext;
          var format = link.name;
          var quality = link.subname;
          popupLink = { href: link.url, title: title, ext: ext, format: format, quality: quality, forceDownload: true };
          menuLinks.push(popupLink);
        });
        return menuLinks;
      }
    },

    /**
     * @param {Node|Element} target
     * @param {String|Array} links
     * @param {String} id
     * @param {Object} [_details]
     * @returns {{isShow: boolean, el: Node|Element, hide: Function, update: Function}}
     */
    quickInsert: function(target, links, id, _details) {
      _details = _details || {};
      var result = {};

      var hideMenu = function(e) {
        if (e && (e.target === target || target.contains(e.target))) {
          return;
        }

        if (!result.isShow) {
          return;
        }

        menu.style.display = 'none';
        mono.off(document, 'mousedown', hideMenu);
        result.isShow = false;
        _details.onHide && _details.onHide(menu);
      };

      var options = {
        links: links,
        button: target,
        popupId: id,
        showFileSize: true
        /*
         parent: args.parent,
         extStyle: args.extStyle,
         offsetRight: args.offsetRight,
         offsetTop: args.offsetTop,
         onItemClick: args.onItemClick
         */
      };

      mono.extend(options, _details);

      var menu = SaveFrom_Utils.popupMenu.create(options);

      _details.onShow && _details.onShow(menu);

      mono.off(document, 'mousedown', hideMenu);
      mono.on(document, 'mousedown', hideMenu);

      return mono.extend(result, {
        button: target,
        isShow: true,
        el: menu,
        hide: hideMenu,
        update: function(links) {
          options.links = links;
          SaveFrom_Utils.popupMenu.update(menu, options)
        }
      });
    }
  },

  frameMenu: {
    getBtn: function(details) {
      "use strict";
      var containerStyle = {
        verticalAlign: 'middle',
        position: 'absolute',
        zIndex: 999,
        fontFamily: 'arial, sans-serif'
      };

      for (var key in details.containerStyle) {
        containerStyle[key] = details.containerStyle[key];
      }

      var quickBtnStyle = details.quickBtnStyleObj || {
        display: 'inline-block',
        fontSize: 'inherit',
        height: '22px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '3px',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingRight: 0,
        paddingLeft: '28px',
        cursor: 'pointer',
        verticalAlign: 'middle',
        position: 'relative',
        lineHeight: '22px',
        textDecoration: 'none',
        zIndex: 1,
        color: '#fff'
      };

      if (details.singleBtn && !details.quickBtnStyleObj) {
        delete quickBtnStyle.borderTopRightRadius;
        delete quickBtnStyle.borderBottomRightRadius;
      }

      var selectBtnStyle = {
        position: 'relative',
        display: 'inline-block',
        fontSize: 'inherit',
        height: '24px',
        padding: 0,
        paddingRight: '21px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderLeft: 0,
        borderRadius: '3px',
        borderTopLeftRadius: '0',
        borderBottomLeftRadius: '0',
        cursor: 'pointer',
        color: '#fff',
        zIndex: 0,
        verticalAlign: 'middle',
        marginLeft: 0
      };

      for (var key in details.selectBtnStyle) {
        selectBtnStyle[key] = details.selectBtnStyle[key];
      }

      var quickBtnIcon = details.quickBtnIcon || mono.create('i', {
        style: {
          position: 'absolute',
          display: 'inline-block',
          left: '6px',
          top: '3px',
          backgroundImage: 'url('+SaveFrom_Utils.svg.getSrc('download', '#ffffff')+')',
          backgroundSize: '12px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '16px',
          height: '16px'
        }
      });

      var selectBtnIcon = details.selectBtnIcon || mono.create('i', {
        style: {
          position: 'absolute',
          display: 'inline-block',
          top: '9px',
          right: '6px',
          border: '5px solid #FFF',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent'
        }
      });

      var quickBtn;

      var btnContainer = mono.create('div', {
        id: details.btnId,
        style: containerStyle,
        on: details.on,
        append: [
          quickBtn = mono.create('a', {
            class: 'sf-quick-btn',
            style: quickBtnStyle,
            href: '#',
            append: [
              quickBtnIcon
            ]
          }),
          mono.create('style', {text: mono.style2Text({
            selector: '#' + details.btnId,
            style: details.nodeCssStyle || {
              opacity: 0.8,
              display: 'none'
            },
            append: [{
              'button::-moz-focus-inner': {
                padding: 0,
                margin: 0
              },
              '.sf-quick-btn': details.quickBtnCssStyle || {
                backgroundColor: 'rgba(28,28,28,0.1)'
              },
              '.sf-select-btn': {
                backgroundColor: 'rgba(28,28,28,0.1)'
              }
            }, {
              selector: [':hover', '.sf-over'],
              join: '',
              style: {
                opacity: 1
              },
              append: {
                '.sf-quick-btn': details.quickBtnOverCssStyle || {
                  backgroundColor: 'rgba(0, 163, 80, 0.5)'
                },
                '.sf-select-btn': {
                  backgroundColor: 'rgba(60, 60, 60, 0.5)'
                }
              }
            }, {
              join: '',
              '.sf-over': {
                append: {
                  '.sf-select-btn': {
                    backgroundColor: 'rgba(28,28,28,0.8)'
                  }
                }
              },
              '.sf-show': {
                display: 'block'
              }
            }]
          })})
        ]
      });

      var selectBtn = null;
      var setQuality = null;
      if (!details.singleBtn) {
        setQuality = function(text) {
          var node = typeof text === 'object' ? text : document.createTextNode(text);
          var first = selectBtn.firstChild;
          if (first === selectBtnIcon) {
            selectBtn.insertBefore(node, first);
          } else {
            selectBtn.replaceChild(node, first);
          }
        };
        selectBtn = mono.create('button', {
          class: 'sf-select-btn',
          style: selectBtnStyle,
          on: details.onSelectBtn,
          append: [
            selectBtnIcon
          ]
        });
        btnContainer.appendChild(selectBtn);
      }

      return {
        node: btnContainer,
        setQuality: setQuality,
        setLoadingState: function() {
          setQuality(mono.create('img', {
            src: SaveFrom_Utils.svg.getSrc('info', '#ffffff'),
            style: {
              width: '14px',
              height: '14px',
              marginLeft: '6px',
              verticalAlign: 'middle',
              top: '-1px',
              position: 'relative'
            }
          }));
        },
        selectBtn: selectBtn,
        quickBtn: quickBtn
      };
    },

    getHiddenList: function(hiddenList, options) {
      "use strict";
      var popupMenu = SaveFrom_Utils.popupMenu;
      var moreBtn = popupMenu.createPopupItem('-text-', options).el;
      mono.create(moreBtn, {
        text: mono.global.language.more + ' ' + String.fromCharCode(187),
        style: {
          cursor: 'pointer'
        },
        on: ['click', function() {
          var content = this.parentNode;
          var itemList = content.querySelectorAll('*[' + popupMenu.dataArrtVisible + ']');
          for (var i = 0, item; item = itemList[i]; i++) {
            item.style.display = 'block';
            item.setAttribute( popupMenu.dataArrtVisible, 1);
          }
          this.parentNode.removeChild(this);
          /*content.replaceChild(mono.create('i', {
            class: 'sf-separator'
          }), this);*/
        }]
      });

      var content = document.createDocumentFragment();
      content.appendChild(moreBtn);

      mono.create(content, {
        append: hiddenList
      });

      if (options.visibleCount === 0) {
        mono.trigger(moreBtn, 'click', {cancelable: true});
      }

      return content;
    },

    getMenuContainer: function(options) {
      "use strict";
      var popupMenu = SaveFrom_Utils.popupMenu;
      var button = options.button;
      var popupId = options.popupId;

      var container = mono.create('div',  {
          style: {
            position: 'absolute',
            minHeight: '24px',
            cursor: 'default',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'auto'
          }
      });

      if (popupId[0] === '#') {
        container.id = popupId.substr(1);
      } else {
        container.classList.add(popupId);
      }

      var menuContent = popupMenu.getContent(options);
      container.appendChild(menuContent.content);

      setTimeout(function() {
        menuContent.sizeIconList.forEach(function(icon) {
          mono.trigger(icon, 'click', {bubbles: false, cancelable: true});
        });
      });

      var pos = SaveFrom_Utils.getPosition(button, options.parent);
      var size = SaveFrom_Utils.getSize(button);

      var stopPropagationFunc = function(e){e.stopPropagation()};

      var topOffset = pos.top + size.height;
      var menuStyle = {
        top: topOffset + 'px',
        maxHeight: (document.body.offsetHeight - topOffset - 40) + 'px'
      };

      if (options.leftMenuPos) {
        menuStyle.left = pos.left + 'px';
      } else {
        menuStyle.right = (document.body.offsetWidth - pos.left - size.width) + 'px';
      }

      mono.create(container, {
        style: menuStyle,
        on: [
          ['click', stopPropagationFunc],
          ['mouseover', stopPropagationFunc],
          ['mouseup', stopPropagationFunc],
          ['mousedown', stopPropagationFunc],
          ['mouseout', stopPropagationFunc],
          ['wheel', function(e) {
            if (e.wheelDeltaY > 0 && this.scrollTop === 0) {
              e.preventDefault();
            } else
            if (e.wheelDeltaY < 0 && this.scrollHeight - (this.offsetHeight + this.scrollTop) <= 0) {
              e.preventDefault();
            }
          }]
        ],
        append: [
          mono.create('style', {text: mono.style2Text({
            selector: (popupId[0] === '#' ? '' : '.') + popupId,
            style: {
              display: 'none',
              fontFamily: 'arial, sans-serif',

              backgroundColor: 'rgba(28,28,28,0.8)',
              zIndex: 9999,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '190px',
              color: '#fff'
            },
            append: [{
              join: '',
              '.sf-show': {
                display: 'block'
              },
              '::-webkit-scrollbar-track': {
                backgroundColor: '#424242'
              },
              '::-webkit-scrollbar': {
                width: '10px',
                backgroundColor: '#424242'
              },
              '::-webkit-scrollbar-thumb': {
                backgroundColor: '#8e8e8e'
              }
            }, {
              '.sf-menu-item': {
                lineHeight: '24px',
                color: '#fff'
              },
              '.sf-menu-item:hover': {
                backgroundColor: '#1c1c1c'
              }
            }]
          })})
        ]
      });

      return container;
    },
    getMenu: function(target, links, id, _options) {
      "use strict";
      var options = {
        links: links,
        button: target,
        popupId: id || '#sf-frame-menu',
        showFileSize: true,
        sizeIconStyle: {
          color: '#fff'
        },
        linkClass: 'sf-menu-item',
        bindUmmyInfoDetails: {
          posLeft: true,
          widthLimit: 480,
          container: _options.container,
          createUmmyInfoDetails: {
            posLeft: true,
            darkTheme: true
          }
        },
        getHiddenListFunc: this.getHiddenList.bind(this)
      };

      for (var key in _options) {
        options[key] = _options[key];
      }

      var menu = this.getMenuContainer(options);

      (options.container || document.body).appendChild(menu);

      var hideMenu = function() {
        if (menu.parentNode) {
          menu.parentNode.removeChild(menu);
        }
        out.isShow = false;
        options.onHide && options.onHide();
      };

      options.onShow && options.onShow(menu);

      mono.off(document, 'mousedown', hideMenu);
      mono.on(document, 'mousedown', hideMenu);

      var out = {
        isShow: true,
        el: menu,
        hide: hideMenu,
        update: function(links) {
          var popupMenu = SaveFrom_Utils.popupMenu;
          var style = menu.lastChild;
          menu.textContent = '';

          options.links = links;
          var menuContent = popupMenu.getContent(options);

          setTimeout(function() {
            menuContent.sizeIconList.forEach(function(icon) {
              mono.trigger(icon, 'click', {bubbles: false, cancelable: true});
            });
          });

          menu.appendChild(menuContent.content);
          menu.appendChild(style);
        }
      };

      return out;
    }
  },

  mobileLightBox: {
    id: 'sf-lightbox',
    clear: function() {
      var el = document.getElementById(SaveFrom_Utils.mobileLightBox.id);
      if (el === null) {
        return;
      }
      el.parentNode.removeChild(el);
    },
    getTitle: function(item) {
      var title = [];

      title.push(item.format || '???');
      if (item.quality) {
        var quality = item.quality;

        if (item.sFps) {
          quality += ' ' + (item.fps || 60);
        }

        title.push(quality);
      }
      if (item['3d']) {
        title.push('3D');
      }
      if (item.noAudio) {
        title.push(mono.global.language.withoutAudio);
      }

      return title.join(' ');
    },
    createItem: function(listItem) {
      var mobileLightBox = SaveFrom_Utils.mobileLightBox;

      var button = mono.create('a', {
        style: {
          display: 'block',
          marginBottom: '6px',
          border: 'solid 1px #d3d3d3',
          lineHeight: '36px',
          minHeight: '36px',
          background: '#f8f8f8',
          verticalAlign: 'middle',
          fontSize: '15px',
          textAlign: 'center',
          color: '#333',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }
      });

      var filename = '';
      if (listItem.title) {
        var ext = (listItem.ext || listItem.format || '').toLowerCase();
        if (ext) {
          ext = '.' + ext;
        }
        filename = mono.fileName.modify(listItem.title + ext);
      }

      if (typeof listItem === 'string') {
        button.textContent = listItem;
        return button;
      } else {
        button.href = listItem.href;
        button.download = filename;
        button.textContent = mobileLightBox.getTitle(listItem);
      }

      if (listItem.forceDownload) {
        button.addEventListener('click', function(e) {
          SaveFrom_Utils.downloadOnClick(e, null, {
            el: this
          });
        });
      }

      if (listItem.isHidden) {
        button.classList.add('isOptional');
        button.style.display = 'none';
      }

      var ctrStyle = {
        cssFloat: 'right',
        lineHeight: '36px',
        fontSize: '75%',
        marginRight: '10px'
      };
      var svgStyle = {
        width: '16px',
        height: '16px'
      };
      var btnStyle = {
        padding: '10px',
        verticalAlign: 'middle',
        lineHeight: 0
      };
      var sizeIcon = SaveFrom_Utils.getFileSizeIcon(ctrStyle, btnStyle, svgStyle, {
        url: listItem.href
      });
      button.appendChild(sizeIcon.node);

      return button;
    },
    getItems: function(itemList) {
      var mobileLightBox = SaveFrom_Utils.mobileLightBox;

      if (typeof itemList === 'string') {
        return {list: [mobileLightBox.createItem(itemList)], hiddenCount: 0};
      }

      var list = [];
      for (var i = 0, item; item = itemList[i]; i++) {
        if (item.quality === 'ummy') {
          continue;
        }
        if (item.extra) {
          continue;
        }
        list.push({el: mobileLightBox.createItem(item), prop: item});
      }
      list = SaveFrom_Utils.popupMenu.sortMenuItems(list);
      var elList = [];
      var hiddenElList = [];
      for (i = 0, item; item = list[i]; i++) {
        if (item.prop.isHidden) {
          hiddenElList.push(item.el);
        } else {
          elList.push(item.el);
        }
      }
      return {list: elList.concat(hiddenElList), hiddenCount: hiddenElList.length};
    },
    show: function(itemList) {
      var mobileLightBox = SaveFrom_Utils.mobileLightBox;

      var topOffset = window.pageYOffset;
      var winHeight = window.innerHeight;
      var mTop = parseInt(winHeight / 100 * 15);
      var btnBox = undefined;
      var moreBtn;

      var getBtnBoxSize = function(hasMore) {
        "use strict";
        var i = hasMore ? 2 : 1;
        return winHeight - 46*i - mTop*2;
      };

      var setMoreBtnState = function(itemObj) {
        "use strict";
        if (itemObj.hiddenCount > 0) {
          btnBox.style.height = getBtnBoxSize(1) + 'px';
          moreBtn.style.display = 'block';
        } else {
          moreBtn.style.display = 'none';
          btnBox.style.height = getBtnBoxSize(0) + 'px';
        }

        if (itemObj.hiddenCount === itemObj.list.length) {
          onMoreBtnClick(moreBtn);
        }
      };

      var onMoreBtnClick = function (btnNode) {
        var state = 'none';
        var elList = btnNode.parentNode.querySelectorAll('.isOptional');
        if (btnNode.dataset.state !== 'open') {
          btnNode.dataset.state = 'open';
          btnNode.textContent = mono.global.language.more + ' ' + String.fromCharCode(171);
          state = 'block';
        } else {
          btnNode.dataset.state = 'close';
          btnNode.textContent = mono.global.language.more + ' ' + String.fromCharCode(187);
        }
        for (var i = 0, el; el = elList[i]; i++) {
          el.style.display = state;
        }
      };

      var exLb = document.getElementById(mobileLightBox.id);
      if (exLb !== null) {
        exLb.parentNode.removeChild(exLb);
      }


      var lbWidth = window.innerWidth;
      if (lbWidth <= 250) {
        lbWidth = '90%';
      } else {
        lbWidth = '70%';
      }

      if (!itemList || itemList.length === 0) {
        itemList = mono.global.language.noLinksFound;
      }

      var itemObj = mobileLightBox.getItems(itemList);

      var lightbox = mono.create('div', {
        id: mobileLightBox.id,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 9000,
          height: document.body.scrollHeight + 'px',
          background: 'rgba(0,0,0,0.85)',
          textAlign: 'center',
          boxSizing: 'content-box'
        },
        on: [
          ['click', function(e) {
            e.preventDefault();
            close();
          }]
        ],
        append: mono.create('div', {
          style: {
            display: 'inline-block',
            width: lbWidth,
            backgroundColor: '#eee',
            height: (winHeight - mTop*2)+'px',
            marginTop: (mTop + topOffset)+'px',
            borderRadius: '4px',
            padding: '8px',
            position: 'relative',
            boxSizing: 'content-box'
          },
          append: [
            btnBox = mono.create('div', {
              style: {
                overflowY: 'auto',
                marginBottom: '6px'
              },
              append: itemObj.list,
              on: ['touchmove', function(e) {
                e.stopPropagation();
              }]
            }),
            moreBtn = mono.create(mobileLightBox.createItem(mono.global.language.more + ' ' + String.fromCharCode(187)), {
              href: '#',
              on: ['click', function(e) {
                e.preventDefault();
                onMoreBtnClick(this);
              }]
            }),
            mono.create(mobileLightBox.createItem(mono.global.language.close), {
              style: {
                marginBottom: 0
              },
              on: ['click', function(e) {
                e.preventDefault();
                close();
              }]
            })
          ],
          on: ['click', function(e) {
            e.stopPropagation();
          }]
        })
      });

      setMoreBtnState(itemObj);

      document.body.appendChild(lightbox);

      var topPos = document.body.scrollTop;

      var result = {};

      var close = function() {
        if (!result.isShow) {
          return;
        }

        document.body.scrollTop = topPos;
        result.hide();
      };

      return mono.extend(result, {
        isShow: true,
        el: lightbox,
        hide: function() {
          lightbox.parentNode && lightbox.parentNode.removeChild(lightbox);
          result.isShow = false;
        },
        close: close,
        update: function(itemList) {
          if (lightbox.parentNode === null) {
            return;
          }

          if (!itemList || itemList.length === 0) {
            itemList = mono.global.language.noLinksFound;
          }

          btnBox.textContent = '';
          var itemObj = mobileLightBox.getItems(itemList);

          mono.create(btnBox, {
            append: itemObj.list
          });

          setMoreBtnState(itemObj);
        }
      });
    }
  },

  /**
   * @param {Object} details
   * @param {Array} [details.args]
   * @param {number} [details.timeout]
   * @param {function} details.func
   * @param {function} details.cb
   */
  bridge: function(details) {
    "use strict";
    details.args = details.args || [];
    if (details.timeout === undefined) {
      details.timeout = 300;
    }
    var scriptId = 'sf-bridge-' + parseInt(Math.random() * 1000) + '-' + Date.now();

    var listener = function (e) {
      window.removeEventListener('sf-bridge-' + scriptId, listener);
      var data;
      if (!e.detail) {
        data = undefined;
      } else {
        data = JSON.parse(e.detail);
      }
      details.cb(data);
    };

    window.addEventListener('sf-bridge-' + scriptId, listener);

    var wrapFunc = '(' + (function(func, args, scriptId, timeout) {
        /* fix */
        var node = document.getElementById(scriptId);
        if (node) {
          node.parentNode.removeChild(node);
        }

        var fired = false;
        var done = function(data) {
          if (fired) {
            return;
          }
          fired = true;

          var event = new CustomEvent('sf-bridge-' + scriptId, {detail: JSON.stringify(data)});
          window.dispatchEvent(event);
        };

        timeout && setTimeout(function() {
          done();
        }, timeout);

        args.push(done);

        func.apply(null, args);
    }).toString() + ')(' + [
        details.func.toString(),
        JSON.stringify(details.args),
        JSON.stringify(scriptId),
        parseInt(details.timeout)
      ].join(',') + ');';

    if (mono.isSafari) {
      var safariFix = function() {
        if (typeof CustomEvent === 'undefined') {
          CustomEvent = function (event, params) {
            params = params || { bubbles: false, cancelable: false };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
          };
          CustomEvent.prototype = window.Event.prototype;
        }
      };
      wrapFunc = wrapFunc.replace('/* fix */', '('+safariFix.toString()+')();');
    } else
    if (mono.isOpera) {
      wrapFunc = wrapFunc.replace('/* fix */', 'var CustomEvent = window.CustomEvent;');
    }

    var script = mono.create('script', {
      id: scriptId,
      text: wrapFunc
    });
    document.body.appendChild(script);
  }
};

SaveFrom_Utils.TutorialTooltip = function (details) {
  "use strict";
  var _this = this;
  this.details = {
    btnTopOffset: -3,
    btnLeftOffset: 0
  };

  mono.extend(this.details, details);

  this.onResize = this.onResize.bind(this);
  this.onResizeDebouce = mono.debounce(this.onResize, 250);
  this.onClose = this.onClose.bind(this);

  this.target = details.target;

  if (this.target.dataset.sfHasTooltip === '1') {
    return;
  }
  this.target.dataset.sfHasTooltip = '1';


  this.tooltipNode = this.getNode();


  this.target.addEventListener('mouseup', this.onClose);

  this.target.addEventListener(mono.onRemoveEventName, function() {
    _this.onClose && _this.onClose(1);
  });

  window.addEventListener('resize', this.onResizeDebouce);

  this.onResize();

  (details.parent || document.body).appendChild(this.tooltipNode);
};

SaveFrom_Utils.TutorialTooltip.prototype.getNode = function () {
  "use strict";
  var _this = this;
  var language = mono.global.language;

  var zIndex = (function() {
    var zIndex = 1000;
    var top = document.getElementById('masthead-positioner');
    var styleList = top && window.getComputedStyle(top, null);
    if (styleList) {
      zIndex = parseInt(styleList.getPropertyValue('z-index')) + 1;
    }
    return zIndex;
  })();

  var box = mono.create('div', {
    class: 'sf-tooltip',
    on: ['mouseup', function(e) {
      e.stopPropagation();
    }],
    append: [
      mono.create('span', {
        style: {
          display: 'inline-block',
          border: '8px solid transparent',
          borderRight: '10px solid #4D4D4D',
          borderLeft: 0,
          width: 0,
          top: '8px',
          left: '0px',
          position: 'absolute'
        }
      }),
      mono.create('span', {
        style: {
          display: 'inline-block',
          backgroundColor: '#4D4D4D',
          marginLeft: '10px',
          padding: '10px 10px',
          maxWidth: '220px',
          minWidth: '220px',
          lineHeight: '16px',
          fontSize: '14px',
          fontFamily: 'font-family: arial, sans-serif',
          color: '#fff'
        },
        append: [
          mono.create('p', {
            style: {
              margin: 0
            },
            append: mono.parseTemplate(language.tutorialTooltipText)
          }),
          mono.create('a', {
            class: 'sf-button',
            text: 'OK',
            style: {
              display: 'inline-block',
              textAlign: 'center',
              textDecoration: 'none',
              padding: '0 10px',
              cssFloat: 'right',

              marginTop: '5px',
              lineHeight: '20px',
              borderRadius: '3px',
              fontSize: '12px',
              color: '#fff',
              fontWeight: 'bolder',
              backgroundColor: '#167AC6',
              cursor: 'pointer'
            },
            on: ['click', function(e) {
              e.preventDefault();
              _this.onClose && _this.onClose();
            }]
          }),
          mono.create('style', {
            text: mono.style2Text({
              '.sf-tooltip': {
                position: 'absolute',
                zIndex: zIndex + 2,
                append: {
                  '.sf-button:hover': {
                    backgroundColor: '#126db3 !important'
                  },
                  '.sf-button:active': {
                    opacity: 0.9
                  }
                }
              }
            })
          })
        ]
      })
    ]
  });

  return box;
};

SaveFrom_Utils.TutorialTooltip.prototype.onClose = function (force) {
  "use strict";
  if (force && force.type === 'mouseup') {
    force = null;
  }

  if (this.tooltipNode) {
    this.tooltipNode.parentNode && this.tooltipNode.parentNode.removeChild(this.tooltipNode);
    this.tooltipNode = null;
  }

  window.removeEventListener('resize', this.onResizeDebouce);
  this.target.removeEventListener('mouseup', this.onClose);

  this.onClose = null;
  if (!force) {
    this.details.onClose && this.details.onClose();
  }
};

SaveFrom_Utils.TutorialTooltip.prototype.onResize = function () {
  "use strict";
  var btn = this.target;
  if (!btn.offsetParent || !btn.parentNode) {
    return this.onClose && this.onClose(1);
  }

  var btnPos = SaveFrom_Utils.getPosition(btn, this.details.parent);
  var top = btnPos.top + this.details.btnTopOffset;
  var left = btnPos.left + btnPos.width + this.details.btnLeftOffset;
  this.tooltipNode.style.top = top + 'px';
  this.tooltipNode.style.left = left + 'px';
};

SaveFrom_Utils.mutationWatcher = {
  /**
   * @return {MutationObserver}
   */
  getMutationObserver: function() {
    "use strict";
    var MutationObserverCtor = null;
    if (typeof MutationObserver !== 'undefined') {
      MutationObserverCtor = MutationObserver;
    } else
    if (typeof WebKitMutationObserver !== 'undefined') {
      MutationObserverCtor = WebKitMutationObserver;
    } else
    if (typeof MozMutationObserver !== 'undefined') {
      MutationObserverCtor = MozMutationObserver;
    } else
    if (typeof JsMutationObserver !== 'undefined') {
      MutationObserverCtor = JsMutationObserver;
    }
    return MutationObserverCtor;
  },
  isAvailable: function() {
    "use strict";
    return !!this.getMutationObserver();
  },
  disconnect: function(details) {
    "use strict";
    details.observer.disconnect();
  },
  connect: function(details) {
    "use strict";
    details.observer.observe(details.target, details.config);
  },
  joinMutations: function(mutations) {
    "use strict";
    var jMutations = [];
    var targetList = [];

    var jObj = {}, obj, hasNodes;
    var mutation, i, node, tIndex;
    while(mutation =  mutations.shift()) {
      tIndex = targetList.indexOf(mutation.target);

      if (tIndex === -1) {
        tIndex = targetList.push(mutation.target) - 1;
        jObj[tIndex] = {
          target: mutation.target,
          added: [],
          removed: []
        };
      }

      obj = jObj[tIndex];
      hasNodes = undefined;

      for (i = 0; node = mutation.addedNodes[i]; i++) {
        if (node.nodeType !== 1) {
          continue;
        }

        obj.added.push(node);
        hasNodes = true;
      }

      for (i = 0; node = mutation.removedNodes[i]; i++) {
        if (node.nodeType !== 1) {
          continue;
        }

        obj.removed.push(node);
        hasNodes = true;
      }

      if (hasNodes !== undefined && obj.inList === undefined) {
        obj.inList = true;
        jMutations.push(obj);
      }
    }

    return jMutations;
  },
  isMatched: null,
  prepareMatched: function() {
    "use strict";
    if (this.isMatched) {
      return;
    }

    var el = document.createElement('div');

    if (typeof el.matches === 'function') {
      this.isMatched = function(node, selector){
        return node.matches(selector);
      };
    } else
    if (typeof el.matchesSelector === 'function') {
      this.isMatched = function(node, selector){
        return node.matchesSelector(selector);
      };
    } else
    if (typeof el.webkitMatchesSelector === 'function') {
      this.isMatched = function(node, selector){
        return node.webkitMatchesSelector(selector);
      };
    } else
    if (typeof el.mozMatchesSelector === 'function') {
      this.isMatched = function(node, selector){
        return node.mozMatchesSelector(selector);
      };
    } else
    if (typeof el.oMatchesSelector === 'function') {
      this.isMatched = function(node, selector){
        return node.oMatchesSelector(selector);
      };
    } else
    if (typeof el.msMatchesSelector === 'function') {
      this.isMatched = function(node, selector){
        return node.msMatchesSelector(selector);
      };
    }

    el = null;
  },
  match: function(details, summaryList, mutation) {
    "use strict";
    var _this = this;
    var node, i, query, n;
    var queries = details.queries;
    var hasChanges = false;
    ['added', 'removed'].forEach(function(type) {
      var nodeList = mutation[type];
      for (n=0; node = nodeList[n]; n++) {
        for(i = 0; query = queries[i]; i++) {
          if (query.is !== undefined && query.is !== type) {
            continue;
          }
          var nodeArr = summaryList[i][type];
          if (_this.isMatched(node, query.css) === true) {
            nodeArr.push(node);
          } else {
            nodeArr.push.apply(nodeArr, node.querySelectorAll(query.css));
          }

          if (hasChanges === false) {
            hasChanges = nodeArr[0] !== undefined;
          }
        }
      }
    });

    return hasChanges;
  },
  filterTarget: function(queries, node) {
    "use strict";
    var i, query;
    for(i = 0; query = queries[i]; i++) {
      if (this.isMatched(node, query.css) === true) {
        return true;
      }
    }
    return false;
  },
  run: function(_details) {
    "use strict";
    var _this = this;
    var details = {
      config: {
        childList: true,
        subtree: true
      },
      target: document.body,
      filterTarget: []
    };
    mono.extend(details, _details);

    details._disconnect = this.disconnect.bind(this, details);
    details._connect = this.connect.bind(this, details);
    details._match = this.match.bind(this, details);

    var _summaryList = [];
    for(var i = 0; i < details.queries.length; i++) {
      _summaryList.push({
        added: [],
        removed: []
      });
    }
    _summaryList = JSON.stringify(_summaryList);

    this.prepareMatched();

    var mObserver = this.getMutationObserver();
    details.observer = new mObserver(function (mutations) {
      // console.time('o');
      var jMutations = _this.joinMutations(mutations);
      if (jMutations.length === 0) {
        // console.timeEnd('o');
        return;
      }

      var hasChanges = false;
      var mutation;
      var summaryList = JSON.parse(_summaryList);
      while(mutation = jMutations.shift()) {
        // console.log('mutation', mutation);
        if (_this.filterTarget(details.filterTarget, mutation.target) === false) {
          if (details._match(summaryList, mutation) === true) {
            hasChanges = true;
          }
        }
      }

      hasChanges === true && details.callback(summaryList);
      // console.timeEnd('o');
    });

    details.trigger = function (node) {
      var hasChanges = false;
      var summaryList = JSON.parse(_summaryList);

      var mutation = {
        added: [node],
        removed: []
      };
      if (details._match(summaryList, mutation)) {
        hasChanges = true;
      }

      hasChanges === true && details.callback(summaryList);
    };

    details.start = function() {
      details._disconnect();
      details._connect();
      details.trigger(details.target);
    };

    details.stop = function() {
      details._disconnect();
    };

    details.start();

    return details;
  }
};

SaveFrom_Utils.mutationAttrWatcher = {
  isAvailable: function() {
    "use strict";
    return !!SaveFrom_Utils.mutationWatcher.getMutationObserver();
  },
  disconnect: function(details) {
    "use strict";
    details.observer.disconnect();
  },
  connect: function(details) {
    "use strict";
    details.observer.observe(details.target, details.config);
  },
  run: function(_details) {
    "use strict";
    var _this = this;

    var details = {
      config: {
        attributes: true,
        childList: false,
        attributeOldValue: true
      },
      target: document.body
    };

    mono.extend(details, _details);

    if (!Array.isArray(details.attr)) {
      details.attr = [details.attr];
    }

    details.config.attributeFilter = details.attr;

    details._disconnect = this.disconnect.bind(this, details);
    details._connect = this.connect.bind(this, details);

    var _summaryList = [];
    for(var i = 0; i < details.attr.length; i++) {
      _summaryList.push({});
    }
    _summaryList = JSON.stringify(_summaryList);

    var mObserver = SaveFrom_Utils.mutationWatcher.getMutationObserver();
    details.observer = new mObserver(function (mutations) {
      var hasChanges = false;
      var mutation;
      var summaryList = JSON.parse(_summaryList);
      while(mutation = mutations.shift()) {
        // console.log('mutation', mutation);
        var index = details.attr.indexOf(mutation.attributeName);
        if (index === -1) {
          continue;
        }

        var value = mutation.target.getAttribute(mutation.attributeName);
        if (value === mutation.oldValue) {
          continue;
        }

        summaryList[index] = {
          value: value,
          oldValue: mutation.oldValue
        };

        hasChanges = true;
      }

      hasChanges === true && details.callback(summaryList);
    });

    details.start = function() {
      details._disconnect();
      details._connect();

      var hasChanges = false;
      var summaryList = JSON.parse(_summaryList);

      for (var i = 0, attributeName; attributeName = details.attr[i]; i++) {
        var value = details.target.getAttribute(attributeName);
        if (value === null) {
          continue;
        }
        summaryList[i] = {
          value: value,
          oldValue: null
        };

        hasChanges = true;
      }

      hasChanges === true && details.callback(summaryList);
    };

    details.stop = function() {
      details._disconnect();
    };

    setTimeout(function () {
      details.start();
    });

    return details;
  }
};
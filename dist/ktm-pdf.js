"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KtmPdf = function () {
  function KtmPdf(context, filePath) {
    _classCallCheck(this, KtmPdf);

    var PDFParser = require('pdf2json');
    this.filePath = filePath;
    this.parser = new PDFParser(this, 1);
  }

  _createClass(KtmPdf, [{
    key: 'parse',
    value: function parse() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._bindEvents({ resolve: resolve, reject: reject });
        _this.parser.loadPDF(_this.filePath);
      });
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents(promise) {
      var _this2 = this;

      this.parser.on('pdfParser_dataReady', function (pdfData) {
        var content = _this2.parser.getRawTextContent();
        var match;

        var _ = require('underscore');

        match = _this2.removeHeadings(content);
        match = match.slice(/\d/.exec(match).index, -1);
        match = match.slice(/[a-zA-Z]/.exec(match).index, -1);
        match = match.slice(/[a-zA-Z]/.exec(match).index, -1);
        match = match.split(/NO.+TREN.+NUMBER/);

        promise.resolve(Promise.all(_.flatten([_this2.parseSchedule(match[0]), _this2.parseSchedule(match[1])])));
      });
    }
  }, {
    key: 'parseSchedule',
    value: function parseSchedule(match) {
      var _this3 = this;

      var _ = require('underscore');

      var stationNames = _.compact(_.map(match.match(/[A-Z ./]+\d?\d:\d\d/g), function (regexInfo) {
        if (regexInfo) return regexInfo.slice(0, /\d/.exec(regexInfo).index);
      }));

      var promises = _.map(stationNames, function (stationName, index) {
        return _this3._slice(match, new RegExp(stationName).exec(match).index, -1).then(function (sliced) {
          return _this3._slice(sliced, 0, new RegExp(stationNames[index + 1]).exec(sliced).index || -1);
        }).then(function (stationData) {
          if (stationData) {
            var schedules = stationData.match(/\d\d:\d\d/g);
            return {
              route: stationNames[0] + '-' + stationNames[stationNames.length - 1],
              stationName: stationData.slice(0, /\d/.exec(stationData).index),
              schedules: schedules
            };
          }
        });
      });

      return promises;
    }
  }, {
    key: '_slice',
    value: function _slice(string, index, lastIndex) {
      return Promise.resolve(string.slice(index, lastIndex));
    }
  }, {
    key: 'removeHeadings',
    value: function removeHeadings(document) {
      return document.slice(/NO.+TREN.+NUMBER/.exec(document).index, -1);
    }
  }]);

  return KtmPdf;
}();

module.exports = { KtmPdf: KtmPdf };
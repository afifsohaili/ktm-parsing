"use strict"

class KtmPdf {
  constructor (context, filePath) {
    var PDFParser = require('pdf2json')
    this.filePath = filePath
    this.parser = new PDFParser(this, 1)
  }

  parse () {
    return new Promise((resolve, reject) => {
      this._bindEvents({ resolve, reject })
      this.parser.loadPDF(this.filePath)
    })
  }

  _bindEvents (promise) {
    this.parser.on('pdfParser_dataReady', (pdfData) => {
      var content = this.parser.getRawTextContent()
      var match

      var _ = require('underscore')

      match = this.removeHeadings(content)
      match = match.slice(/\d/.exec(match).index, -1)
      match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
      match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
      match = match.split(/NO.+TREN.+NUMBER/)

      promise.resolve(Promise.all(
        _.flatten([
          this.parseSchedule(match[0]),
          this.parseSchedule(match[1])
        ])
      ))
    })
  }

  parseSchedule (match) {
    var _ = require('underscore')

    var stationNames = _.compact(
      _.map(match.match(/[A-Z ./]+\d\d:\d\d/g), (regexInfo) => {
        if (regexInfo)
          return regexInfo.slice(0, -5)
      })
    )

    const promises = _.map(stationNames, (stationName, index) => {
      return this._slice(match, new RegExp(stationName).exec(match).index, -1).
        then((sliced) => {
          return this._slice(
            sliced,
            0,
            new RegExp(stationNames[index+1]).exec(sliced).index || -1
          )
        }).
        then((stationData) => {
          if (stationData) {
            const schedules = stationData.match(/\d\d:\d\d/g)
            return {
              route: `${stationNames[0]}-${stationNames[stationNames.length - 1]}`,
              stationName: stationData.slice(0, /\d/.exec(stationData).index),
              schedules: schedules
            }
          }
        })
    })

    return promises
  }

  _slice(string, index, lastIndex) {
    return Promise.resolve(string.slice(index, lastIndex))
  }

  removeHeadings (document) {
    return document.slice(/NO.+TREN.+NUMBER/.exec(document).index, -1)
  }
}

module.exports = { KtmPdf }

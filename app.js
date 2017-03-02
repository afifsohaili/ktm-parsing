var PDFParser = require('pdf2json')

var parser = new PDFParser(this, 1)

parser.on('pdfParser_dataReady', function (pdfData) {
  var content = parser.getRawTextContent()
  var match

  match = removeHeadings(content)
  match = match.slice(/\d/.exec(match).index, -1)
  match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
  match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
  match = match.split(/NO.+TREN.+NUMBER/)

  console.log(parseSchedule(match[0])[0])
  // console.log(parseSchedule(match[1]))
})

parser.loadPDF('./tmp/batu-caves.pdf')
parser.loadPDF('./tmp/klang.pdf')

function removeHeadings (document) {
  return document.slice(/NO.+TREN.+NUMBER/.exec(document).index, -1)
}

function parseSchedule (match) {
  var _ = require('underscore')

  var stationsData = _.compact(
    _.map(match.split(/\r\n/), function (data) {
      if (data.match(/^([A-Z]+).*\d+/)) {
        return data
      } else {
        return undefined
      }
    })
  )

  return _.map(stationsData, function (data) {
    var startOfSchedule = /[0-9]/.exec(data)
    var stationName = data.slice(0, startOfSchedule.index)
    var stationSchedule = data.slice(startOfSchedule.index)
    return {
      name: stationName,
      schedule: stationSchedule.match(/\d\d?:\d\d/g)
    }
  })
}

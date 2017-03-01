var PDFParser = require('pdf2json')

var parser = new PDFParser(this, 1)

parser.on('pdfParser_dataReady', function (pdfData) {
  var content = parser.getRawTextContent()
  var match

  match = content.slice(/NO.+TREN.+NUMBER/.exec(content).index, -1)
  match = match.slice(/\d/.exec(match).index, -1)
  match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
  match = match.slice(/[a-zA-Z]/.exec(match).index, -1)
  match = match.split(/NO.+TREN.+NUMBER/)

  // var schedule1 = parseSchedule(match[0]);
  var schedule2 = parseSchedule(match[0])
  console.log(schedule2)
})

parser.loadPDF('./test.pdf')

function parseSchedule (match) {
  var _ = require('underscore')

  console.log(
    _.compact(
      _.map(match.split(/\r\n/), function (data) {
        if (data.match(/^([A-Z]+).*\d+/)) {
          return data
        } else {
          return undefined
        }
      })
    )
  )

  var stationNames = _.map(match.match(/[A-Z]+((\s|\.|\/)*[A-Z])*/g), function (station) {
    station = station.replace(/\./g, '_')
    if (station.split(' ').length > 3) { return null }
    return station
  })
  stationNames = _.uniq(_.compact(stationNames))

  var stations = []

  for (var i = 0; i < stationNames.length - 1; i++) {
    var stationName = stationNames[i + 1].replace(/_/g, '.')
    var needle = new RegExp(stationName).exec(match)
    var station = match.slice(0, needle.index - 2)
    stations.push(station)
    match = match.slice(needle.index, -1)
  }

  stations.push(match.slice(0, /\r\n/.exec(match).index))

  stations = _.map(stations, function (stationData) {
    var stationName = stationData.slice(0, /\d/.exec(stationData).index)
    var stationSchedule = stationData.slice(/\d/.exec(stationData).index)

    stationSchedule = stationSchedule.match(/\d\d?:\d\d/g)

    return {
      name: stationName,
      schedule: stationSchedule
    }
  })

  return stations
}

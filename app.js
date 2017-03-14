var { KtmPdf } = require('./ktm-pdf.js')

process.stdout.write('\033c');

new KtmPdf(this, './tmp/batu-caves.pdf')
  .parse()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => console.log(error))

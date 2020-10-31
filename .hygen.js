const moment = require('moment');
const inflection = require('inflection');

const fileName = s => inflection.dasherize(s.replace('s', '-').toLowerCase());

module.exports = {
  helpers: {
    moment: date => moment(date),
    fileName,
  },
};

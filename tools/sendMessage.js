const key = require('./config').key;

const Imis = require('imis-server-sdk')
const imis = new Imis(key, 'minikb-watch')


module.exports = function (title = '', desp = '', notice = 0) {
  imis.send({
    logs: desp.substr(0, 170),
    notice,
    title
  })
}
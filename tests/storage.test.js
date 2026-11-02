const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const util = require('../wxmp/utils/util')

test('valid logs are preserved and malformed or failing storage falls back', () => {
  const logs = [123]
  assert.equal(util.readLogs({ getStorageSync: () => logs }), logs)
  for (const value of [null, '', 'bad', {}, 123]) {
    assert.deepEqual(util.readLogs({ getStorageSync: () => value }), [])
  }
  assert.deepEqual(util.readLogs({ getStorageSync() { throw Error('unavailable') } }), [])
})
test('launch and logs page tolerate unavailable storage', () => {
  const wx = { getStorageSync() { throw Error('unavailable') }, setStorageSync() { throw Error('full') } }
  let app
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../wxmp/app.js'), 'utf8'), {
    App: value => { app = value }, require: () => util, wx
  })
  assert.doesNotThrow(() => app.onLaunch())
  let page
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../wxmp/pages/logs/logs.js'), 'utf8'), {
    Page: value => { page = value }, require: () => util, wx
  })
  let result
  page.setData = value => { result = value }
  page.onLoad()
  assert.deepEqual(result.logs, [])
})

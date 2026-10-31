const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/js/myjs.js'), 'utf8');
function app(initial = {}) {
  const values = { ...initial };
  const elements = Object.fromEntries(Array.from({length: 7}, (_, i) => ['tr' + (i + 1), {innerHTML: ''}]));
  elements.account = {value: 'student@example.org'};
  elements.password = {value: 'not-a-real-password'};
  const requests = [], messages = [], events = [];
  const storage = {
    getItem: key => Object.hasOwn(values, key) ? values[key] : null,
    setItem: (key, value) => { values[key] = String(value); },
    removeItem: key => { delete values[key]; }
  };
  const context = vm.createContext({
    console, Date, document: {getElementById: id => elements[id]}, localStorage: storage,
    plus: {storage, nativeUI: {toast: value => messages.push(value), showWaiting() {}, closeWaiting() {}}, webview: {getWebviewById: () => ({})}},
    mui: {ajax: (url, options) => requests.push(options), fire: (...args) => events.push(args), back() {}}
  });
  vm.runInContext(source, context);
  return {context, values, elements, requests, messages, events};
}

test('course table treats stored course and note text as text, with valid class attributes', () => {
  const a = app({'"1"': '<img src=x onerror=alert(1)> & algebra', '"43"': '</textarea><script>alert(1)</script>'});
  a.context.GetAllClass();
  assert.match(a.elements.tr1.innerHTML, /&lt;img/);
  assert.doesNotMatch(a.elements.tr1.innerHTML, /<img/);
  assert.match(a.elements.tr1.innerHTML, /class="bg-primary"/);
  assert.doesNotMatch(a.elements.tr7.innerHTML, /<script>/);
});

test('refresh clears removed notes and retains one editable empty note cell', () => {
  const a = app({'"43"': 'old note'});
  a.context.GetAllClass();
  delete a.values['"43"'];
  a.context.GetAllClass();
  assert.doesNotMatch(a.elements.tr7.innerHTML, /old note/);
  assert.match(a.elements.tr7.innerHTML, /data-num="43"/);
  assert.match(a.elements.tr7.innerHTML, /colspan="7"/);
});

test('course table preserves all 42 slots and reads each storage slot only once', () => {
  const a = app();
  let reads = 0;
  a.context.plus.storage.getItem = () => { reads++; return 'course'; };
  a.context.GetAllClass();
  assert.equal(reads, 43);
  assert.match(a.elements.tr6.innerHTML, /data-num="42"/);
});

test('class lookup rejects empty, malformed and missing-field responses without throwing', () => {
  for (const response of [null, [], [null], [0], [{}], ['oops'], '<html>error</html>']) {
    const a = app();
    a.context.ClassExists = () => 1;
    a.context.GetCourseByClassName();
    assert.doesNotThrow(() => a.requests[0].success(response));
    assert.ok(a.messages.length);
  }
});

test('class lookup uses shared escaped rendering and clears previous note', () => {
  const a = app();
  a.context.ClassExists = () => 1;
  a.context.GetCourseByClassName();
  a.requests[0].success([{s1: '<script>bad</script>', s43: 'note'}]);
  assert.doesNotMatch(a.elements.tr1.innerHTML, /<script>/);
  a.requests[0].success([{s1: 'new'}]);
  assert.doesNotMatch(a.elements.tr7.innerHTML, /note/);
});

test('invalid refresh cannot erase cached courses or claim success', () => {
  for (const response of [null, [], [null], [0], [{}], ['oops']]) {
    const a = app({'"1"': 'cached', course_updata: '1'});
    a.context.UpdataCourse();
    assert.doesNotThrow(() => a.requests[0].success(response));
    assert.equal(a.values['"1"'], 'cached');
    assert.equal(a.values.course_updata, '1');
    assert.ok(!a.messages.includes('课表重置成功'));
  }
});

test('valid refresh normalizes absent and null cells instead of storing undefined', () => {
  const a = app({'"2"': 'previous', course_updata: '1'});
  a.context.UpdataCourse();
  a.requests[0].success([{s1: 'new', s2: null}]);
  assert.equal(a.values['"1"'], 'new');
  assert.equal(a.values['"2"'], '');
  assert.equal(a.values['"44"'], '');
  assert.equal(a.values.course_updata, '0');
  assert.equal(a.events.length, 1);
});

test('academic week counts calendar days: start midnight is week 1 and day 7 is week 2', () => {
  const {context} = app();
  assert.equal(context.GetDateDiff('2026-09-07', new Date(2026, 8, 7)), 1);
  assert.equal(context.GetDateDiff('2026-09-07', new Date(2026, 8, 13, 23, 59)), 1);
  assert.equal(context.GetDateDiff('2026-09-07', new Date(2026, 8, 14)), 2);
  assert.equal(context.GetDateDiff('2026-09-07', new Date(2026, 8, 6, 23, 59)), 0);
  assert.equal(context.GetDateDiff('2024-03-04', new Date(2024, 2, 11)), 2);
  assert.equal(context.GetDateDiff('2024/2/29', new Date(2024, 2, 7)), 2);
});

test('invalid semester dates return null without throwing', () => {
  const {context} = app();
  for (const value of [null, undefined, '', 'bad', '2026-02-30', {}, '2026-13-01']) {
    assert.equal(context.GetDateDiff(value), null);
  }
});

test('text conversion escapes multiline tags, ampersands and quotes before adding line breaks', () => {
  const {context} = app();
  assert.equal(context.Tohtml('<img\nsrc=x>& "\'\nend'), '&lt;img<br>src=x&gt;&amp;&nbsp;&quot;&#39;<br>end');
  assert.equal(context.Tohtml(null), '');
});

test('login discards a legacy saved password and never persists the supplied password', () => {
  const a = app({pwd: 'legacy-secret'});
  a.context.CheckIdExists = () => 0;
  a.context.CheckLogin();
  assert.equal(a.values.pwd, undefined);
});

test('refresh success callback only runs after a validated response', () => {
  const a = app();
  let calls = 0;
  a.context.UpdataCourse(() => calls++);
  a.requests[0].success([]);
  assert.equal(calls, 0);
  a.requests[0].success([{s1: ''}]);
  assert.equal(calls, 1);
});

test('canceling or waiting for refresh retains header notification until success', () => {
  const a = app({course_updata: '1'});
  const noop = () => {};
  const listener = {addEventListener: noop};
  a.elements.info = listener;
  a.context.document.querySelector = () => listener;
  a.context.window = {addEventListener: noop};
  a.context.Vue = function(options) { Object.assign(this, options.data, options.methods); };
  a.context.mui.init = noop;
  a.context.mui.plusReady = noop;
  let confirmation;
  a.context.mui.confirm = (message, title, buttons, callback) => { confirmation = callback; };
  const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).find(script => script.includes('var menu'));
  vm.runInContext(script, a.context);
  a.context.index.upcourse();
  confirmation({index: 0});
  assert.equal(a.context.index.course_updata, 1);
  assert.equal(a.values.course_updata, '1');
  assert.equal(a.requests.length, 0);
  a.context.index.upcourse();
  confirmation({index: 1});
  assert.equal(a.context.index.course_updata, 1);
  a.requests[0].success([{s1: 'new'}]);
  assert.equal(a.context.index.course_updata, 0);
  assert.equal(a.values.course_updata, '0');
});

test('dialog ignores repeated open, save and close and restores Android Back once', () => {
  const a = app();
  const nodes = {};
  const timers = [];
  let saves = 0, closes = 0;
  function node() { return {setAttribute() {}, addEventListener(event, handler) { this[event] = handler; }, classList: {add() {}}}; }
  a.context.document.getElementById = id => nodes[id];
  a.context.document.createElement = node;
  a.context.document.body = {
    appendChild(element) {
      assert.ok(!nodes.layer_root);
      nodes.layer_root = element;
      element.parentNode = this;
      nodes.layer_main = node();
      nodes.layer_btns = node();
    },
    removeChild() { delete nodes.layer_root; delete nodes.layer_main; delete nodes.layer_btns; }
  };
  a.context.setTimeout = callback => timers.push(callback);
  a.context.mui.os = {android: true};
  const oldBack = a.context.mui.back;
  const options = {content: 'dialog', btn: ['Save'], event: [() => saves++], closeEvent: () => closes++};
  a.context.layerOpen(options);
  a.context.layerOpen(options);
  assert.notEqual(a.context.mui.back, oldBack);
  const button = nodes.layer_btns;
  const tap = {target: {getAttribute: () => '0'}};
  button.tap(tap);
  button.tap(tap);
  a.context.layerClose(options.closeEvent);
  assert.equal(saves, 1);
  assert.equal(closes, 1);
  assert.equal(timers.length, 1);
  assert.equal(a.context.mui.back, oldBack);
  timers[0]();
  assert.equal(nodes.layer_root, undefined);
  assert.doesNotThrow(() => button.tap(tap));
  a.context.layerOpen(options);
  a.context.mui.back();
  assert.equal(closes, 2);
});

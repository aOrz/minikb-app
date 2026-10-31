const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadPage(name) {
  const requests = [], navigations = [], titles = [];
  let page;
  const wx = {
    request(options) {
      const task = { aborted: false, abort() { this.aborted = true; options.fail({ errMsg: 'abort' }); options.complete(); } };
      requests.push({ ...options, task });
      return task;
    },
    navigateTo(options) { navigations.push(options); },
    setNavigationBarTitle(options) { titles.push(options.title); }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../wxmp/pages', name, 'index.js'), 'utf8'), {
    wx,
    getApp() { return { getUserInfo() { /* Simulate profile permission denied: no success callback. */ } }; },
    Page(definition) { page = definition; }
  });
  page.data = JSON.parse(JSON.stringify(page.data));
  page.setData = function (changes) { Object.assign(this.data, changes); };
  return { page, requests, navigations, titles };
}
const route = { schoolName: 'yd', academe: '计', class: '2601' };
function respond(request, data, statusCode = 200) {
  request.success({ data, statusCode });
  request.complete();
}

test('empty initial classes and invalid selection do not crash or navigate', () => {
  const { page, navigations } = loadPage('index');
  page.search();
  assert.equal(navigations.length, 0);
  assert.match(page.data.error, /请选择/);
  page.data.classList = ['无数字班级'];
  page.search();
  assert.equal(navigations.length, 0);
});

test('switching from a long school list safely resets dependent selection', () => {
  const { page } = loadPage('index');
  page.data.pickerValue = [1, 40, 2];
  page.selectChange({ detail: { value: [0, 40, 2] } });
  assert.equal(page.data.pickerValue[1], 0);
  assert.ok(page.data.grade.length);
  page.data.pickerValue = [99, -1, 100];
  page.pickerSelected();
  assert.deepEqual(Array.from(page.data.pickerValue), [0, 0, 0]);
});

test('class requests validate malformed, HTTP error, and empty responses', () => {
  for (const [data, statusCode] of [[null, 200], [{ error: 'bad' }, 200], [['计2601'], 500], [[{}], 200], [['计2601'], null], [[], 200]]) {
    const { page, requests } = loadPage('index');
    page.onLoad();
    respond(requests[0], data, statusCode);
    assert.equal(page.data.classList.length, 0);
    assert.ok(page.data.error);
    assert.equal(page.data.loading, false);
  }
});

test('new class request clears stale choices and ignores all obsolete callbacks', () => {
  const { page, requests, navigations } = loadPage('index');
  page.onLoad();
  const old = requests[0];
  page.getClassName();
  assert.equal(old.task.aborted, true);
  respond(old, ['旧班级2601']);
  old.fail(); old.complete();
  assert.equal(page.data.classList.length, 0);
  assert.equal(page.data.loading, true);
  assert.equal(page.data.error, '');
  page.search();
  assert.equal(navigations.length, 0);
  respond(requests[1], ['计2602']);
  assert.equal(page.data.classList[0], '计2602');
  assert.equal(page.data.loading, false);
});

test('navigation safely encodes values and uses the selected class', () => {
  const { page, requests, navigations } = loadPage('index');
  page.onLoad();
  assert.equal(requests[0].data.c, 'Getclass');
  assert.ok(!requests[0].url.includes('?'));
  respond(requests[0], ['计2601&x=1']);
  page.search();
  assert.ok(navigations[0].url.endsWith('class=2601%26x%3D1'));
});

test('unload aborts class request and suppresses late callbacks', () => {
  const { page, requests } = loadPage('index');
  page.onLoad(); page.onUnload();
  assert.equal(requests[0].task.aborted, true);
  const data = JSON.stringify(page.data);
  respond(requests[0], ['计2601']);
  assert.equal(JSON.stringify(page.data), data);
});

test('course route and title work without profile access, missing options make no request', () => {
  const { page, requests, titles } = loadPage('course');
  page.onLoad(route); page.onReady();
  assert.equal(titles[0], '迷你课表-计2601');
  assert.equal(requests[0].data.collegeName, '计');
  assert.equal(page.data.loading, true);
  const missing = loadPage('course');
  missing.page.onLoad(); missing.page.onReady();
  assert.equal(missing.requests.length, 0);
  assert.match(missing.page.data.error, /不完整/);
});

test('course page handles empty, malformed and failed HTTP responses', () => {
  for (const [data, statusCode] of [[[], 200], [null, 200], [[{}], 200], [[null], 200], [[[]], 200], [[{ s1: '数学' }], null], [[{ s1: '数学' }], 503]]) {
    const { page, requests } = loadPage('course');
    page.onLoad(route); respond(requests[0], data, statusCode);
    assert.equal(page.data.course.length, 0);
    assert.ok(page.data.error);
    assert.equal(page.data.loading, false);
  }
});

test('course table retains six rows, seven weekdays and safe blank missing cells', () => {
  const { page, requests } = loadPage('course');
  page.onLoad(route);
  respond(requests[0], [{ s1: '数学\nA101', s2: null, s3: { bad: true }, s42: '实习' }]);
  assert.equal(page.data.course.length, 7);
  assert.ok(page.data.course.every(row => row.length === 8));
  assert.equal(page.data.course[1][1], '数学\nA101');
  assert.equal(page.data.course[1][2], '');
  assert.equal(page.data.course[1][3], '');
  assert.equal(page.data.course[6][7], '实习');
});

test('course failure permits retry and obsolete callbacks cannot replace newer table', () => {
  const { page, requests } = loadPage('course');
  page.onLoad(route);
  requests[0].fail(); requests[0].complete();
  assert.match(page.data.error, /请求失败/);
  assert.equal(page.data.loading, false);
  page.loadCourse();
  respond(requests[1], [{ s1: '新课表' }]);
  respond(requests[0], [{ s1: '旧课表' }]);
  assert.equal(page.data.course[1][1], '新课表');
  page.onUnload();
  const data = JSON.stringify(page.data);
  requests[1].fail(); requests[1].complete();
  assert.equal(JSON.stringify(page.data), data);
});

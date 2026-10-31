"""Real Chromium DOM smoke test with mocked MUI/HTML5+; no live API traffic.
Run: python tests/browser_smoke.py [screenshot-directory]
Requires Python Playwright and Chromium. Not a native-device end-to-end test.
"""
import json
import mimetypes
from pathlib import Path
import sys
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'src'
STUB = r'''
window.__ready = []; window.__requests = []; window.__backCalls = 0;
window.__store = {'"1"': '<img src=x onerror="window.__injected=1"> & math\nRoom 101', '"43"': '</textarea><script>window.__injected=1</script>'};
window.plus = { storage: {getItem: k => __store[k] || null, setItem: (k,v) => __store[k]=v},
 nativeUI: {toast() {}, showWaiting() {}, closeWaiting() {}}, webview: {getWebviewById: () => ({})} };
window.mui = function(selector) { return {on: function(event, child, handler) {
 document.querySelector(selector).addEventListener(event, function(e) { const el=e.target.closest(child); if(el) handler.call(el,e); });
}}; };
mui.plusReady = fn => __ready.push(fn); mui.init = () => {}; mui.os = {android: true};
mui.ajax = (url, options) => __requests.push(options); mui.fire = () => {};
mui.alert = () => {}; mui.back = () => { __backCalls++; };
'''

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 430, 'height': 900})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    def route(request):
        parsed = urlparse(request.request.url)
        if parsed.hostname != 'minikb.test':
            request.abort()
            return
        relative = parsed.path.lstrip('/')
        if relative == 'js/mui.min.js':
            request.fulfill(body=STUB, content_type='application/javascript')
            return
        file = (ROOT / relative).resolve()
        if not file.is_relative_to(ROOT) or not file.is_file():
            request.fulfill(status=404, body='Not found')
            return
        request.fulfill(body=file.read_bytes(), content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
    context.route('**/*', route)
    page.goto('http://minikb.test/kb.html')
    page.evaluate('__ready.forEach(fn => fn())')
    cell = page.locator('td[data-num="1"]')
    assert cell.text_content() == '<img src=x onerror="window.__injected=1"> & math\nRoom 101'
    assert page.locator('#tables img, #tables script').count() == 0
    assert page.locator('tbody tr').count() == 7
    assert page.locator('#tr7 td').get_attribute('colspan') == '7'
    cell.dispatch_event('longtap')
    assert page.locator('#et').input_value() == cell.text_content()
    cell.dispatch_event('longtap')
    assert page.locator('#layer_root').count() == 1, 'Repeated opening must not duplicate modal IDs'
    page.locator('#layer_btns td').nth(1).dispatch_event('tap')
    page.locator('#layer_btns td').nth(1).dispatch_event('tap')
    page.wait_for_timeout(350)
    assert page.locator('#layer_root').count() == 0
    assert page.evaluate('__requests.length') == 0, 'Cancel must not save'
    cell.dispatch_event('longtap')
    payload = '</textarea><img src=x onerror="window.__injected=1">\nA & B'
    page.locator('#et').fill(payload)
    page.locator('#layer_btns td').nth(2).dispatch_event('tap')
    page.locator('#layer_btns td').nth(2).dispatch_event('tap')
    page.wait_for_timeout(350)
    assert cell.text_content() == payload
    assert page.evaluate('__requests.length') == 1, 'Repeated save must not submit twice'
    assert page.evaluate('__store[\'"1"\']') == payload
    assert page.locator('#tables img, #tables script').count() == 0
    cell.dispatch_event('longtap')
    page.evaluate('mui.back(); mui.back();')
    page.wait_for_timeout(350)
    assert page.locator('#layer_root').count() == 0
    assert page.evaluate('__backCalls') == 1, 'Android back handler must be restored'
    cell.dispatch_event('longtap')
    page.locator('#layer_btns td').nth(0).dispatch_event('tap')
    page.wait_for_timeout(350)
    assert cell.text_content() == ''
    assert page.evaluate('__requests.length') == 2
    assert page.evaluate('window.__injected') is None
    assert not errors, errors
    if len(sys.argv) > 1:
        destination = Path(sys.argv[1]); destination.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(destination / 'course-smoke.png'), full_page=True)
    print(json.dumps({'passed': True, 'checks': ['escaped course/note DOM', 'edit round trip', 'duplicate open/save/close', 'cancel', 'Android back restore', 'delete'], 'page_errors': errors, 'real_network_requests': 0}))
    browser.close()

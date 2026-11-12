import {
  JOB_APPLICATION_BOOKMARKLET,
  JOB_MATCHES_PROGRESS_STATE,
} from '@vigilant-broccoli/common-js';
import { APP_TAB, ROOT_PATH } from '../app.const';

// Cleanup happens in `extractJobPosting`, so send the whole page, not a slice.
const BOOKMARKLET_TEXT_LIMIT = 300000;
const BOOKMARKLET_EXPAND_WAIT_MS = 600;
// Only collapsed "… more" / "Show more" / "See more" toggles; other expanders
// (menus, filters) are left alone.
const BOOKMARKLET_EXPANDER_PATTERN = /(…|\.\.\.)\s*more|(show|see)\s+more/i;
const BOOKMARKLET_RETRY_MS = 300;
const BOOKMARKLET_GIVE_UP_MS = 15000;

const UNSAFE_JS_CHAR_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeJsChars = (value: string) =>
  value.replace(
    /[<>\u002F\b\f\n\r\t\0\u2028\u2029]/g,
    char => UNSAFE_JS_CHAR_MAP[char],
  );

const BOOKMARKLET_TARGET_KEY = 'job-hunt-bookmarklet-target';

const framingOrigin = () => {
  const ancestor = window.location.ancestorOrigins?.[0];
  if (ancestor) return ancestor;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return '';
  }
};

const isUrlOnOrigin = (url: string, origin: string) => {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
};

// An embedding page (local-manager-next's Job Hunt) passes its own URL in
// `?bookmarklet=` so the bookmarklet opens it and the page relays the posting
// into this frame. It is honoured only while framed by that same origin, so a
// crafted link opened directly cannot point the bookmarklet at another site.
// Links inside the app drop the param, so the accepted URL is kept for the
// tab; call this once on load.
export const readBookmarkletTarget = () => {
  const own = `${window.location.origin}${ROOT_PATH}`;
  if (window.parent === window) return own;
  const requested = new URLSearchParams(window.location.search).get(
    JOB_APPLICATION_BOOKMARKLET.TARGET_PARAM,
  );
  try {
    if (requested && isUrlOnOrigin(requested, framingOrigin())) {
      sessionStorage.setItem(BOOKMARKLET_TARGET_KEY, requested);
    }
    return sessionStorage.getItem(BOOKMARKLET_TARGET_KEY) ?? own;
  } catch {
    return requested && isUrlOnOrigin(requested, framingOrigin())
      ? requested
      : own;
  }
};

// Runs on the job posting's page, so it cannot call the API (no bearer token,
// and the page's CSP may block it). It opens the target first, inside the
// click, so popup blockers allow it, then expands collapsed sections
// ("… more"), which keep their text out of the page until opened. It posts the
// page to the target's origin until it acknowledges, since the new tab may
// still be loading or redirecting to login.
export const buildBookmarklet = (target: string) => {
  const origin = new URL(target).origin;
  return `javascript:(function(){var o=${escapeUnsafeJsChars(JSON.stringify(origin))};var w=window.open(${escapeUnsafeJsChars(JSON.stringify(target))});document.querySelectorAll('[aria-expanded="false"]').forEach(function(b){if(${BOOKMARKLET_EXPANDER_PATTERN}.test(b.innerText))b.click()});setTimeout(function(){var m={source:'${JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE}',url:location.href,title:document.title,text:document.body.innerText.slice(0,${BOOKMARKLET_TEXT_LIMIT})};var t=setInterval(function(){w.postMessage(m,o)},${BOOKMARKLET_RETRY_MS});window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${JOB_APPLICATION_BOOKMARKLET.ACK}')clearInterval(t)});setTimeout(function(){clearInterval(t)},${BOOKMARKLET_GIVE_UP_MS})},${BOOKMARKLET_EXPAND_WAIT_MS})})()`;
};

const MATCHES_MAX_POSTINGS = 40;
const MATCHES_OPEN_WAIT_MS = 3000;
// Separate from the application bookmarklet's wait, which reads one page.
const MATCHES_EXPAND_WAIT_MS = 1500;
// Consecutive scrolls that reveal no new card before it stops.
const MATCHES_STUCK_ROUNDS = 3;
const MATCHES_SCROLL_WAIT_MS = 800;
const MATCHES_BACK_POLLS = 20;
const MATCHES_BACK_POLL_MS = 300;
// Longer than a scan, since the app may sit on a login page first.
const MATCHES_HELLO_GIVE_UP_MS = 300000;
// How far above "About the job" to look for the posting's age.
const MATCHES_AGE_LOOKBACK = 1500;
const MATCHES_DESCRIPTION_LIMIT = 20000;
const MATCHES_DESCRIPTION_MARKER = 'About the job';

// Runs on a LinkedIn job search page. The results list only holds each job's
// title and renders only the cards near the viewport, so it opens the cards on
// screen, scrolls the list a step, and repeats until scrolling reveals no new
// card. It copies each description from the detail pane, which replaces the
// page text on every click. Cards are the `[role=button][componentkey]` blocks in the
// left half of the page, since the list has no per-card ids or links and its
// class names change often; job-id links are the fallback for the older
// markup, and the job id comes from the address bar after each click, which
// may also have routed to the full posting page. It opens the target first, inside the click, so popup blockers
// allow it, and posts the batch to the target's origin until it acknowledges.
export const buildMatchesBookmarklet = (appTarget: string) => {
  const url = new URL(appTarget);
  const { origin } = url;
  // Opened directly, the app shows Matches itself; an embedding page is asked
  // to open its frame there.
  if (url.pathname === ROOT_PATH) url.pathname = APP_TAB.MATCHES.path;
  else
    url.searchParams.set(
      JOB_APPLICATION_BOOKMARKLET.PATH_PARAM,
      APP_TAB.MATCHES.path,
    );
  const target = url.toString();
  const script = [
    `var o=${escapeUnsafeJsChars(JSON.stringify(origin))};`,
    `var w=window.open(${escapeUnsafeJsChars(JSON.stringify(target))});`,
    'var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};',
    "var link=function(el){return el.matches('a[href]')?el:el.querySelector('a[href]')};",
    'var jobId=function(el){var a=link(el);var m=a&&(a.href.match(/\\/jobs\\/view\\/(\\d+)/)||a.href.match(/currentJobId=(\\d+)/));return m?m[1]:el.getAttribute("data-occludable-job-id")||el.getAttribute("data-job-id")};',
    'var byId=function(){var seen={},out=[];document.querySelectorAll(\'li[data-occludable-job-id],[data-job-id],a[href*="/jobs/view/"]\').forEach(function(el){var id=jobId(el);if(id&&!seen[id]){seen[id]=1;out.push({id:id,key:id,el:el})}});return out};',
    "var byCard=function(){return [].filter.call(document.querySelectorAll('[role=\"button\"][componentkey]'),function(el){var r=el.getBoundingClientRect();return r.left<innerWidth/2&&r.height>80&&el.innerText.length>40}).map(function(el){return{id:'',key:el.getAttribute('componentkey')||el.innerText.slice(0,80),el:el}})};",
    'var cards=function(){var found=byCard();return found.length>1?found:byId()};',
    // The target may still be loading or logging in, so a hello repeats until
    // the app acknowledges it; messages queue until then.
    `var ready=false,queue=[];var msg=function(items,state){return{source:'${JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE}',postings:items,progress:{state:state,captured:postings.length,seen:Object.keys(seen).length}}};`,
    'var flush=function(){while(queue.length)w.postMessage(queue.shift(),o)};',
    'var send=function(m){queue.push(m);if(ready)flush()};',
    `var hello=setInterval(function(){w.postMessage(msg([],'${JOB_MATCHES_PROGRESS_STATE.RUNNING}'),o)},${BOOKMARKLET_RETRY_MS});`,
    `window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${JOB_APPLICATION_BOOKMARKLET.ACK}'&&!ready){ready=true;clearInterval(hello);flush()}});`,
    `setTimeout(function(){clearInterval(hello)},${MATCHES_HELLO_GIVE_UP_MS});`,
    'var findBox=function(){var f=cards()[0];var b=f&&f.el.parentElement;while(b&&b.scrollHeight<=b.clientHeight+10)b=b.parentElement;return b};',
    'var box=findBox();if(box)box.scrollTop=0;',
    'var postings=[],seen={},stuck=0,pos=0;',
    // A click can route to the full posting page, which has no list; go back
    // to the results and the scroll position, one card at a time since the
    // old card elements are gone after that.
    `var ensureList=async function(){if(!/\\/jobs\\/view\\//.test(location.pathname))return;history.back();for(var k=0;k<${MATCHES_BACK_POLLS}&&!cards().length;k++)await sleep(${MATCHES_BACK_POLL_MS});box=findBox();if(box)box.scrollTop=pos};`,
    `while(stuck<${MATCHES_STUCK_ROUNDS}&&postings.length<${MATCHES_MAX_POSTINGS}){`,
    'await ensureList();',
    'var fresh=cards().filter(function(c){return !seen[c.key]});',
    `if(!fresh.length){if(box)box.scrollTop+=box.clientHeight*0.8;await sleep(${MATCHES_SCROLL_WAIT_MS});stuck++;continue}`,
    'stuck=0;',
    `var c=fresh[0];seen[c.key]=1;pos=box?box.scrollTop:0;`,
    'var head=c.el;',
    "var lines=head.innerText.split('\\n').map(function(s){return s.trim()}).filter(Boolean);var name=lines[0].replace(/\\s*\\(Verified job\\)/,'');var company=lines.slice(1).find(function(l){return l.indexOf(name.slice(0,15))!==0});",
    "c.el.scrollIntoView({block:'center'});(c.id?link(c.el)||c.el:c.el).click();",
    `await sleep(${MATCHES_OPEN_WAIT_MS});`,
    `document.querySelectorAll('[aria-expanded="false"]').forEach(function(b){if(${BOOKMARKLET_EXPANDER_PATTERN}.test(b.innerText))b.click()});`,
    `await sleep(${MATCHES_EXPAND_WAIT_MS});`,
    'var t=document.body.innerText;',
    `var at=t.indexOf(${escapeUnsafeJsChars(JSON.stringify(MATCHES_DESCRIPTION_MARKER))});`,
    // LinkedIn shows the age ("Reposted 2 days ago") above the description.
    `var ages=t.slice(Math.max(0,at-${MATCHES_AGE_LOOKBACK}),at).match(/\\d+\\s+(?:minute|hour|day|week|month)s?\\s+ago/gi);`,
    'if(at<0)continue;',
    `var url=c.id?location.origin+'/jobs/view/'+c.id+'/':(location.href.match(/(?:currentJobId=|\\/jobs\\/view\\/)(\\d+)/)?location.origin+'/jobs/view/'+RegExp.$1+'/':location.href+'#'+c.key);if(postings.some(function(p){return p.url===url}))continue;postings.push({url:url,title:[name,company].filter(Boolean).join(' | '),posted:ages?ages[ages.length-1]:'',text:t.slice(at,at+${MATCHES_DESCRIPTION_LIMIT})});send(msg([postings[postings.length-1]],'${JOB_MATCHES_PROGRESS_STATE.RUNNING}'))}`,
    'await ensureList();',
    `send(msg([],'${JOB_MATCHES_PROGRESS_STATE.DONE}'));`,
  ].join('');
  // The async wrapper returns a promise, which a `javascript:` URL would
  // otherwise render as the new page.
  return `javascript:(async function(){${script}})();void 0`;
};

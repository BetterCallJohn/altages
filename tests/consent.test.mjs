import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../cookies.js', import.meta.url), 'utf8');
const validChoice = analytics => JSON.stringify({version:1,analytics,expires:Date.now()+86400000});

function harness({id='G-TEST1234', stored=null, blocked=false}={}) {
  const scripts=[], deletedCookies=[], listeners={}, elements={};
  let reloads=0;
  const node = selector => elements[selector] ||= {dataset:{},addEventListener(event, callback){this[event]=callback;}};
  const yes=node('[data-choice="yes"]'), no=node('[data-choice="no"]');
  yes.dataset.choice='yes'; no.dataset.choice='no';
  const settings=node('settings');
  const dialog={open:false,setAttribute(){},querySelector:node,querySelectorAll:()=>[no,yes],show(){this.open=true;},showModal(){this.open=true;},close(){this.open=false;}};
  const document={hidden:false,querySelectorAll:selector=>selector==='[data-cookie-settings]'?[settings]:[],addEventListener(event,callback){listeners[event]=callback;},createElement:tag=>tag==='dialog'?dialog:{},body:{append(){}},head:{append(script){scripts.push(script);}}};
  Object.defineProperty(document,'cookie',{get:()=> '_ga=123; _ga_TEST1234=456; unrelated=789',set:value=>deletedCookies.push(value)});
  const window={ALTAGES_ANALYTICS_ID:id,addEventListener(event,callback){listeners[event]=callback;}};
  const location={origin:'https://altages.example',pathname:'/cookies/',hostname:'altages.example',reload(){reloads++;}};
  const localStorage={getItem(){if(blocked)throw Error('denied');return stored;},setItem(key,value){if(blocked)throw Error('denied');stored=value;}};
  vm.runInNewContext(source,{window,document,location,localStorage,setTimeout:()=>1,clearTimeout(){},Date,JSON,encodeURIComponent});
  return {scripts,window,dialog,deletedCookies,listeners,accept:()=>yes.click(),refuse:()=>no.click(),close:()=>node('.cookie-close').click(),reopen:()=>settings.click(),stored:()=>stored,reloads:()=>reloads};
}
test('no analytics ID: no tracker, no unsolicited banner',()=>{const h=harness({id:''});assert.equal(h.scripts.length,0);assert.equal(h.dialog.open,false);h.reopen();assert.equal(h.dialog.open,true);h.accept();assert.equal(h.scripts.length,0);});
test('no consent or closing the banner never loads Google',()=>{const h=harness();assert.equal(h.dialog.open,true);h.close();assert.equal(h.scripts.length,0);assert.equal(h.stored(),null);});
test('refusal persists and removes only GA cookies',()=>{const h=harness();h.refuse();assert.equal(JSON.parse(h.stored()).analytics,false);assert.equal(h.scripts.length,0);assert(h.deletedCookies.every(c=>c.startsWith('_ga')));assert.equal(harness({stored:h.stored()}).dialog.open,false);});
test('acceptance loads once, denies ads and removes query parameters from page URL',()=>{const h=harness();h.accept();h.accept();assert.equal(h.scripts.length,1);assert.equal(JSON.parse(h.stored()).analytics,true);const commands=h.window.dataLayer.map(a=>Array.from(a));assert.equal(commands[0][2].ad_storage,'denied');assert.equal(commands[0][2].ad_user_data,'denied');const config=commands.find(a=>a[0]==='config')[2];assert.equal(config.cookie_update,false);assert.equal(config.cookie_expires,15552000);assert.equal(config.allow_google_signals,false);assert.equal(config.page_location,'https://altages.example/cookies/');});
test('valid saved agreement loads; expired, malformed and invalid-version records do not',()=>{assert.equal(harness({stored:validChoice(true)}).scripts.length,1);for(const stored of ['broken','{}',JSON.stringify({version:1,analytics:true,expires:Date.now()-1}),JSON.stringify({version:2,analytics:true,expires:Date.now()+86400000})]){const h=harness({stored});assert.equal(h.scripts.length,0);assert.equal(h.dialog.open,true);}});
test('withdrawal disables Analytics, persists refusal and reloads to unload Google',()=>{const h=harness({stored:validChoice(true)});h.reopen();h.refuse();assert.equal(h.window['ga-disable-G-TEST1234'],true);assert.equal(JSON.parse(h.stored()).analytics,false);assert.equal(h.reloads(),1);});
test('unavailable storage stays denied until an explicit action',()=>{const h=harness({blocked:true});assert.equal(h.scripts.length,0);h.accept();assert.equal(h.scripts.length,1);h.refuse();assert.equal(h.reloads(),1);});
test('other-tab withdrawal disables the current tracker',()=>{const h=harness({stored:validChoice(true)});h.refuse();h.listeners.storage({key:'altages-consent-v1'});assert.equal(h.window['ga-disable-G-TEST1234'],true);});

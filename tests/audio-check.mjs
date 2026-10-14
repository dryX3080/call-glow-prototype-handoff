import assert from 'node:assert/strict';
import {createMicrophoneModel,smoothEnvelope} from '../dist/audio-model.js';
const run=(rms,duration=10)=>{const model=createMicrophoneModel({sensitivity:1});let peak=0,end=0;for(let n=0;n<duration*1000;n++){end=model.target(typeof rms==='function'?rms(n/1000):rms,.001);peak=Math.max(peak,end);}return {peak,end,model};};
const quiet=run(.001,60),normal=run(.006),loud=run(.03);
assert(quiet.end>.03&&quiet.end<.08);assert(normal.end>.35&&normal.end<.5);assert(loud.end>.85);
assert.equal(run(.0001).peak,0);assert.equal(run(.0003).peak,0);assert.equal(run(t=>t%1.4<.02?.03:0).peak,0);
assert.equal(quiet.model.levels.reference,.012);assert(Math.abs(quiet.end-run(.001,1).end)<.001);
let level=0;for(let n=0;n<75;n++)level=smoothEnvelope(level,1,.001,.075,.55);assert(Math.abs(level-.6321)<.001);for(let n=0;n<550;n++)level=smoothEnvelope(level,0,.001,.075,.55);assert(level>.23&&level<.24);
const sensitive=run(.001).end;assert(sensitive<normal.end);console.log(JSON.stringify({quiet:quiet.end,normal:normal.end,loud:loud.end,noise:'rejected',twentyMsClicks:'rejected',quiet60seconds:'no amplification',attack75ms:'pass',release550ms:'pass'},null,2));

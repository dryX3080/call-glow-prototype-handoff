export const initial = {speed:1,intensity:.32,distortion:.35,flow:.7,response:1,raysVoice:true,gradientVoice:true,sensitivity:1,paused:matchMedia('(prefers-reduced-motion: reduce)').matches,mode:'idle',level:0,syllable:0,frequency:.5};
export const state = {...initial};
export const clocks = {rays:0,gradient:0,animation:0};
// Preserved from the approved 6f82df0 version. Separate phrase and syllable envelopes.
export function voiceResponse(){
  const body=Math.min(1.35,state.response*(1.45*state.level/(1.+.45*state.level)+.45*state.syllable));
  const pulse=Math.min(1,state.response*state.syllable);
  return{rays:state.raysVoice?body:0,gradient:state.gradientVoice?body:0,rayPulse:state.raysVoice?pulse:0,gradientPulse:state.gradientVoice?pulse:0};
}

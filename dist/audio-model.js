// Exact fixed-reference microphone model from approved 6f82df0. No automatic gain.
export function createMicrophoneModel(state){
const micLevels={noise:.0001,reference:.012,rms:0,onset:0,hold:0};
function resetMicLevels(){Object.assign(micLevels,{noise:.0001,reference:.012,rms:0,onset:0,hold:0});}
// Preserve loudness differences; only the noise floor adapts during quiet input.
function microphoneTarget(rms,dt){
  micLevels.rms=rms;
  if(micLevels.hold===0&&rms<micLevels.noise*3+.00015){
    const rate=1-Math.exp(-dt/(rms<micLevels.noise?.5:1.5));
    micLevels.noise=Math.max(.00003,micLevels.noise+(rms-micLevels.noise)*rate);
  }
  const openGate=Math.max(.0004,(micLevels.noise*2.5+.0001)/Math.sqrt(state.sensitivity));
  if(rms>openGate){
    micLevels.onset+=dt;
    if(micLevels.onset>=.035)micLevels.hold=.14;
  }else{micLevels.onset=0;micLevels.hold=Math.max(0,micLevels.hold-dt);}
  if(micLevels.hold===0)return 0;
  const signal=Math.max(0,rms-openGate);
  const normalized=signal/micLevels.reference;
  return 1-Math.exp(-normalized*1.1*state.sensitivity);
}

return {levels:micLevels,reset:resetMicLevels,target:microphoneTarget};
}
export function smoothEnvelope(current,target,dt,attack,release){return current+(target-current)*(1-Math.exp(-dt/(target>current?attack:release)));}

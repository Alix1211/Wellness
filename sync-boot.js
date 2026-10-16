/* Runs before load(): preserve the local origin and restore the native mirror. */
window.GAIA_SYNC_BUSY=!!window.GaiaAndroid;
window.GAIA_SYNC_APPLYING=false;
try{
 const b=window.GaiaAndroid?.loadSave();
 if(b){const f=JSON.parse(b);if(f.format==='gaia-wellness-save'&&f.state?.v===3){localStorage.setItem('gaia-wellness-v3',JSON.stringify(f.state));localStorage.setItem('gaia-wellness-meta',JSON.stringify({rev:f.sync?.rev||0,savedAt:f.savedAt}));if(f.playlog)localStorage.setItem('gaia-wellness-playlog',JSON.stringify(f.playlog));}}
}catch{}

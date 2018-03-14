window.Util = {};
window.Util.appendScriptToHead = function ( src, loadedCallback ) {
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.type = 'text/javascript';
  if ( script.readyState ) {
    script.onreadystatechange = function onreadystatechange() {
      if (this.readyState === 'complete') {
        loadedCallback();
      }
    };
  }
  else {
    script.onload = loadedCallback;
  }
  script.src = src;
  head.appendChild(script);
};

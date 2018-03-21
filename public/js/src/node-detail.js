

(function () {

  function initialize() {

    // setup sidebar
    const $sideView = document.querySelector('.sideView');
    $sideView.innerHTML = window.templates.detailSideView({
      name: '',
      type: '',
      alarm_status: '',
      num_clients: '',
      uptime: '',
      coords: '',
      cng_name: '',
    });

    // setup tabbed content region

  }

  const domLoadedPromise = new window.Promise( (resolve) => {
    document.addEventListener('DOMContentLoaded', resolve);
  });

  domLoadedPromise.then(initialize);

})();

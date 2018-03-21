(function () {

  // TODO: Extract node types and other constants
  const nodeTypes = {
    DATACENTER: 'DataCenter',
    CNG: 'CNG',
    CCW: 'CCW'
  };

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function initialize( nodeDetailData ) {
    const type = getUrlParameter('type');
    const nodeDetail = type === nodeTypes.CCW
      ? nodeDetailData.node[0].ccw_info[0]
      : nodeDetailData.node[0].cng_info[0];
    const nodeBrief = nodeDetailData.node[0].node_brief;

    // setup sidebar
    const $sideView = document.querySelector('.sideView');
    $sideView.innerHTML = window.templates.detailSideView({
      alarm_status: '',
      name: nodeBrief.name,
      type: nodeBrief.type,
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

  domLoadedPromise
    .then(() => {
      const nodeID = getUrlParameter('id');
      return window.DataLoader.loadNodeDetail( nodeID );
    })
    .then( initialize );

})();

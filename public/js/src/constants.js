(function () {

  window.nodeTypes = {
    DATACENTER: 'DataCenter',
    CNG: 'CNG',
    CCW: 'CCW'
  };

  // window.ALARM_STATUS_NA = 'n/a';
  // img/icons/cwc-group-green.svg

  window.ICON_AWS_REGION = 'img/icons/aws-icon.svg';
  window.ICON_AZURE_REGION = 'img/icons/azure-icon.svg';
  window.ICON_GREEN_BRANCH = 'img/icons/ccw-green.svg';
  window.ICON_YELLOW_BRANCH = 'img/icons/ccw-yellow.svg';
  window.ICON_RED_BRANCH = 'img/icons/ccw-red.svg';

  window.ICON_GREEN_CLOUD = 'img/icons/cng-green.svg';
  window.ICON_YELLOW_CLOUD = 'img/icons/cng-yellow.svg';
  window.ICON_RED_CLOUD = 'img/icons/cng-red.svg';

  window.ICON_GROUP_CIRCLE = 'img/icons/group-circle.svg';
  window.ICON_CWC_GROUP_GREEN = 'img/icons/cwc-group-green.svg';
  window.ICON_CWC_GROUP_YELLOW = 'img/icons/cwc-group-yellow.svg';
  window.ICON_CWC_GROUP_RED = 'img/icons/cwc-group-red.svg';
  window.GROUP_STATUS_ICONS = [
    window.ICON_CWC_GROUP_GREEN,
    window.ICON_CWC_GROUP_YELLOW,
    window.ICON_CWC_GROUP_RED,
  ];

  window.ICON_DATA_CENTER = 'img/icons/dc.svg';

  window.ALARM_STATUS_CLEAR = 0;
  window.ALARM_STATUS_MINOR = 1;
  window.ALARM_STATUS_MAJOR = 2;
  window.mapNodeStatusToCode = {
    Clear: window.ALARM_STATUS_CLEAR,
    Minor: window.ALARM_STATUS_MINOR,
    Major: window.ALARM_STATUS_MAJOR,
  };
  window.mapCodeToNodeStatus = _.invert(window.mapNodeStatusToCode);

  window.mapNodeToIcon = ( nodeType, nodeStatus ) => {
    if ( nodeType === window.nodeTypes.DATACENTER ) return window.ICON_DATA_CENTER;
    if ( nodeStatus === window.ALARM_STATUS_CLEAR ) {
      if ( nodeType === window.nodeTypes.CNG ) return window.ICON_GREEN_CLOUD;
      if ( nodeType === window.nodeTypes.CCW ) return window.ICON_GREEN_BRANCH;
    }
    if ( nodeStatus === window.ALARM_STATUS_MINOR ) {
      if ( nodeType === window.nodeTypes.CNG ) return window.ICON_YELLOW_CLOUD;
      if ( nodeType === window.nodeTypes.CCW ) return window.ICON_YELLOW_BRANCH;
    }
    if ( nodeStatus === window.ALARM_STATUS_MAJOR ) {
      if ( nodeType === window.nodeTypes.CNG ) return window.ICON_RED_CLOUD;
      if ( nodeType === window.nodeTypes.CCW ) return window.ICON_RED_BRANCH;
    }
    return window.ICON_GREEN_BRANCH;
  };

})();

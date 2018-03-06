(function () {
  const infoBoxOptions = {
    disableAutoPan: false,
    maxWidth: 0,
    pixelOffset: new window.google.maps.Size(0, 0),
    zIndex: null,
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: '200px',
      height: '40px'
    },
    closeBoxURL: '',
    infoBoxClearance: new window.google.maps.Size(1, 1),
    isHidden: false,
    pane: 'floatPane',
    enableEventPropagation: false,
  };

  // Expose tooltip constructor for single instance of tooltip
  window.MapToolTip = function ( options ) {
    const nodeTypes = options.nodeTypes;
    const mouseState = options.mouseState;
    const mouseConfig = options.mouseConfig;

    this.toolTip = null;
    const _this = this;

    this.toggleMarker = function ( node ) {
      this.toolTip ? this.close() : this.openOnMarker( node );
    };

    this.openOnCluster = function ( cluster ) {
      const clusterNodes = cluster.getMarkers().map(( marker ) => marker.node);

      // close existing tooltip
      if ( this.toolTip ) {
        this.toolTip.close();
      }
      const toolTipHtml = window.templates.tableList({
        nodes: clusterNodes,
        type: 'cluster',
        columns: [
          {
            name: 'Name',
            width: 25,
            type: 'text',
            getValue: ( node ) => ( node.location ),
          },
          {
            name: 'Alarm Status',
            width: 25,
            type: 'alarmStatus',
          },
          {
            name: 'Number of Links Connected',
            width: 25,
            type: 'text',
            getValue: () => ( 13 ),
          },
          {
            name: 'Total Line Utilization',
            width: 25,
            type: 'text',
            getValue: () => ( 27 ),
          },
        ]
      });
      const toolTipWrap = document.createElement('div');
      toolTipWrap.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px;';
      toolTipWrap.innerHTML = toolTipHtml;
      infoBoxOptions.content = toolTipWrap;


      // close existing tooltip
      this.close();

      // create and show new tooltip
      this.toolTip = new window.InfoBox(infoBoxOptions);
      // spawn the tooltip on the first node in the cluster's position
      this.toolTip.setPosition(
        new window.google.maps.LatLng(clusterNodes[0].coords.lat, clusterNodes[0].coords.lng)
      );
      this.toolTip.open(window.googleMap);

      // Setup tooltip events
      const tooltipContainer = toolTipWrap.querySelector('.tableList');
      tooltipContainer.addEventListener('mouseover', () => {
        mouseState.mouseWithinTooltip = true;
      });
      tooltipContainer.addEventListener('mouseleave', function () {
        mouseState.mouseWithinTooltip = false;
        setTimeout(() => {
          if ( mouseState.mouseWithinMarker ) {
            return;
          }
          // _this.close();
        }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
      });
      return true;
    };

    this.openOnMarker = function ( node ) {
      const toolTipTemplate = ( node.type === nodeTypes.CNG
        ? window.templates.CNGToolTip
        : node.type === nodeTypes.CCW
          ? window.templates.CCWToolTip
          : null
      );

      const toolTipHtml = toolTipTemplate( node );

      const toolTipWrap = document.createElement('div');
      toolTipWrap.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px;';
      toolTipWrap.innerHTML = toolTipHtml;
      infoBoxOptions.content = toolTipWrap;

      // close existing tooltip
      this.close();

      // create and show new tooltip
      this.toolTip = new window.InfoBox(infoBoxOptions);
      this.toolTip.open(window.googleMap, node.marker);

      const tooltipContainer = toolTipWrap.querySelector('.tooltip');
      const tooltipX = toolTipWrap.querySelector('.tooltip__X');

      // Setup tooltip events
      tooltipX.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        _this.close();
      });

      tooltipContainer.addEventListener('mouseover', () => {
        mouseState.mouseWithinTooltip = true;
      });
      tooltipContainer.addEventListener('mouseleave', function () {
        mouseState.mouseWithinTooltip = false;
        setTimeout(() => {
          if ( mouseState.mouseWithinMarker ) {
            return;
          }
          _this.close();
        }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
      });
    };

    this.close = function () {
      if ( this.toolTip ) {
        this.toolTip.close();
        this.toolTip = null;
      }
    };
  };
})();


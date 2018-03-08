(function () {
  const TOOLTIP_WIDTH = 400;
  const infoBoxOptions = {
    disableAutoPan: false,
    maxWidth: 0,
    zIndex: null,
    closeBoxURL: '',
    infoBoxClearance: new window.google.maps.Size(1, 1),
    isHidden: false,
    pane: 'floatPane',
    enableEventPropagation: false,
    alignBottom: false,
  };

  const CNGOptions = {
    alignBottom: true,
    pixelOffset: new window.google.maps.Size( (-1) * (TOOLTIP_WIDTH / 2), -18),
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: `${TOOLTIP_WIDTH}px`,
    }
  };
  const CCWOptions = {
    alignBottom: true,
    pixelOffset: new window.google.maps.Size( (-1) * (TOOLTIP_WIDTH / 2), -18),
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: `${TOOLTIP_WIDTH}px`,
    }
  };
  const clusterOptions = {
    alignBottom: false,
    pixelOffset: new window.google.maps.Size(0, 0),
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: '200px',
    }
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
      // console.log('openOnCluster');
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
            type: 'text',
            width: 40,
            getValue: ( node ) => ( node.location ),
          },
          {
            name: 'Alarm Status',
            type: 'alarmStatus',
            width: 40,
            getValue: ( node ) => ( node.severity ),
          },
          {
            name: 'Links',
            type: 'text',
            width: 20,
            getValue: ( node ) => ( node.num_clients ),
          }
        ]
      });
      const toolTipWrap = document.createElement('div');
      toolTipWrap.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px; width: 350px;';
      toolTipWrap.innerHTML = toolTipHtml;
      infoBoxOptions.content = toolTipWrap;


      // close existing tooltip
      this.close();

      // create and show new tooltip
      this.toolTip = new window.InfoBox(
        Object.assign({}, infoBoxOptions, clusterOptions)
      );
      // spawn the tooltip on the first node in the cluster's position
      this.toolTip.setPosition(
        new window.google.maps.LatLng(cluster.getCenter().lat(), cluster.getCenter().lng())
      );
      this.toolTip.open(window.googleMap);

      // Setup tooltip events
      const tooltipContainer = toolTipWrap.querySelector('.tableList');
      const tooltipX = toolTipWrap.querySelector('.tooltip__X');

      // Setup tooltip events
      tooltipX.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        _this.close();
      });

      tooltipContainer.addEventListener('mouseenter', () => {
        // console.log('tooltip::mouseenter');
        mouseState.mouseWithinTooltip = true;
      });
      tooltipContainer.addEventListener('mouseleave', function () {
        // console.log('tooltip::mouseleave');
        mouseState.mouseWithinTooltip = false;
        setTimeout(() => {
          if (
            mouseState.mouseWithinMarker || // mouse from tooltip to marker
            mouseState.mouseWithinCluster // mouse from tooltip to marker
          ) {
            return;
          }
          _this.close();
        }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
      });
      return true;
    };

    this.openOnMarker = function ( node ) {
      // console.log('openOnMarker');
      let toolTipTemplate = null;
      let toolTipOptions = null;
      if ( node.type === nodeTypes.CNG ) {
        toolTipTemplate = window.templates.CNGToolTip;
        toolTipOptions = CNGOptions;
      }
      if ( node.type === nodeTypes.CCW ) {
        toolTipTemplate = window.templates.CCWToolTip;
        toolTipOptions = CCWOptions;
      }

      const toolTipHtml = toolTipTemplate( node );

      const toolTipWrap = document.createElement('div');
      toolTipWrap.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px;';
      toolTipWrap.innerHTML = toolTipHtml;
      infoBoxOptions.content = toolTipWrap;

      // close existing tooltip
      this.close();

      // create and show new tooltip
      this.toolTip = new window.InfoBox(
        Object.assign({}, infoBoxOptions, toolTipOptions),
      );
      this.toolTip.open(window.googleMap, node.marker);

      const tooltipContainer = toolTipWrap.querySelector('.tooltip');
      const tooltipX = toolTipWrap.querySelector('.tooltip__X');

      // Setup tooltip events
      tooltipX.addEventListener('click', (event) => {
        // console.log('tooltip::click');
        event.preventDefault();
        event.stopPropagation();
        _this.close();
      });

      tooltipContainer.addEventListener('mouseover', () => {
        // console.log('tooltip::mouseover');
        mouseState.mouseWithinTooltip = true;
      });
      tooltipContainer.addEventListener('mouseleave', function () {
        // console.log('tooltip::mouseleave');

        // mouseState.mouseWithinCluster

        mouseState.mouseWithinTooltip = false;
        setTimeout(() => {
          if (
            mouseState.mouseWithinMarker // mouse from tooltip to marker
          ) {
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


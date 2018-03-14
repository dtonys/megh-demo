(function () {
  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';
  const TOOLTIP_WIDTH = 500;
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

  const tooltipV2 = {
    alignBottom: true,
    pixelOffset: new window.google.maps.Size( (-1) * (TOOLTIP_WIDTH / 2), -21),
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: '500px',
    }
  };

  const toolTipAboveMarker = {
    alignBottom: true,
    pixelOffset: new window.google.maps.Size( (-1) * (TOOLTIP_WIDTH / 2), -21),
  };
  const toolTipBelowMarker = {
    alignBottom: false,
    pixelOffset: new window.google.maps.Size( (-1) * (TOOLTIP_WIDTH / 2), 21),
  };

  const clusterOptions = {
    alignBottom: false,
    pixelOffset: new window.google.maps.Size(0, 0),
    boxStyle: {
      padding: '0px 0px 0px 0px',
      width: '200px',
    }
  };

  const labelsArr = [];
  for ( let i = 0; i < 37; i++ ) labelsArr.push('');
  const chartOptions = {
    width: 350,
    height: 100,
    // X-Axis specific configuration
    axisX: {
      offset: 30,
      position: 'end',
      labelOffset: {
        x: 0,
        y: 0
      },
      showGrid: true,
      showLabel: true,
    },
    axisY: {
      type: window.Chartist.AutoScaleAxis,
      scaleMinSpace: 10,
      offset: 40,
      position: 'start',
      labelOffset: {
        x: 5,
        y: 4
      },
      showGrid: true,
      showLabel: true,
      labelInterpolationFnc: function (value) {
        return value + ' MB';
      }
    },
    showLine: true,
    showPoint: true,
    lineSmooth: false,
    low: 0,
    high: 20,
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 0
    },
    fullWidth: false,
  };

  function getPixelPosition( marker ) {
    const scale = Math.pow(2, window.googleMap.getZoom());
    const nw = new window.google.maps.LatLng(
      window.googleMap.getBounds().getNorthEast().lat(),
      window.googleMap.getBounds().getSouthWest().lng()
    );
    const worldCoordinateNW = window.googleMap.getProjection().fromLatLngToPoint(nw);
    const worldCoordinate = window.googleMap.getProjection().fromLatLngToPoint(marker.getPosition());
    const pixelOffset = new window.google.maps.Point(
      Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
      Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
    );
    return pixelOffset;
  }

  // Expose tooltip constructor for single instance of tooltip
  window.MapToolTip = function ( options ) {
    const nodeTypes = options.nodeTypes;
    const mapNodeStatusToCode = options.mapNodeStatusToCode;
    const mouseState = options.mouseState;
    const mouseConfig = options.mouseConfig;

    const mapCodeToNodeStatus = _.invert(mapNodeStatusToCode);

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
            type: 'text',
            width: 40,
            getValue: ( node ) => ( node.name ),
          },
          {
            name: 'Alarm Status',
            type: 'alarmStatus',
            width: 40,
            getValue: ( node ) => ( mapCodeToNodeStatus[node.alarm_status] ),
          },
          {
            name: 'Links',
            type: 'text',
            width: 20,
            // getValue: ( node ) => (  node.num_clients || 3 ),
            getValue: () => (''),
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
      const $tooltipContainer = toolTipWrap.querySelector('.tableList');
      const $tooltipX = toolTipWrap.querySelector('.tooltip__X');
      const $tableListHead = toolTipWrap.querySelector('.tableList__head');
      const $tableListContent = toolTipWrap.querySelector('.tableList__content');

      // Add a scrollbar if the # of items exceedes threshhold
      if ( clusterNodes.length > 10 ) {
        $tableListHead.style.overflowY = 'scroll';
        $tableListContent.style.overflowY = 'scroll';
      }
      else {
        $tableListHead.style.overflowY = 'auto';
        $tableListContent.style.overflowY = 'auto';
      }

      // Setup tooltip events
      $tooltipX.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        _this.close();
      });

      $tooltipContainer.addEventListener('mouseenter', () => {
        // console.log('tooltip::mouseenter');
        mouseState.mouseWithinTooltip = true;
      });
      $tooltipContainer.addEventListener('mouseleave', function () {
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

    this.loadNodeDetail = function ( nodeID ) {
      return window.unfetch(`/megh/api/v1.0/node/${encodeURIComponent(nodeID)}`, {
        credentials: 'include',
        headers: {
          'Authorization': BASIC_AUTH_SECRET
        }
      })
        .then(( response ) => {
          return response.json();
        })
        .then(( data ) => {
          return data;
        });
    };

    this.openOnMarker = function ( node ) {
      const toolTipOptions = tooltipV2;
      let tooltipPositioning = null;
      let toolTipTemplate = null;
      if ( node.type === nodeTypes.CCW ) {
        toolTipTemplate = window.templates.CCWToolTipV2;
      }
      if ( node.type === nodeTypes.CNG ) {
        toolTipTemplate = window.templates.CCWToolTipV2;
      }

      const $toolTipWrap = document.createElement('div');
      const widthHeightStr = node.type === nodeTypes.CCW
        ? 'width: 500px; height: 308px;'
        : 'width: 500px; height: 348px;';

      $toolTipWrap.style.cssText = `margin-top: 0px; background: #fff; padding: 0px; ${widthHeightStr}`;
      // Loading State -> Blank Screen
      $toolTipWrap.innerHTML = '<div></div>';
      infoBoxOptions.content = $toolTipWrap;

      // close existing tooltip
      this.close();

      // get below or above midpoint, dynamically set offset and position
      const mapNode = document.querySelector('#mapRegion');
      const midY = Math.floor( mapNode.offsetHeight / 2 );
      const markerPosition = getPixelPosition( node.marker );
      if ( markerPosition.y > midY ) {
        tooltipPositioning = toolTipAboveMarker;
      }
      else {
        tooltipPositioning = toolTipBelowMarker;
      }

      // create and show new tooltip
      this.toolTip = new window.InfoBox(
        Object.assign({}, infoBoxOptions, toolTipOptions, tooltipPositioning),
      );
      this.toolTip.open(window.googleMap, node.marker);

      function setupToolTip( interfaces ) {
        // initialize charts
        const $chart1 = $toolTipWrap.querySelector('.tooltipV2 .m-chart-1');
        const $chart2 = $toolTipWrap.querySelector('.tooltipV2 .m-chart-2');
        const chartData1 = {
          labels: labelsArr,
          series: [
            interfaces[0].throughput.up_link,
            interfaces[0].throughput.down_link,
          ]
        };
        const chartData2 = {
          labels: labelsArr,
          series: [
            interfaces[1].throughput.up_link,
            interfaces[1].throughput.down_link,
          ]
        };

        if ( $chart1 ) new window.Chartist.Line($chart1, chartData1, chartOptions); // eslint-disable-line
        if ( $chart2 ) new window.Chartist.Line($chart2, chartData2, chartOptions); // eslint-disable-line
        const $tooltipContainer = $toolTipWrap.querySelector('.tooltipV2');
        // const $tooltipX = toolTipWrap.querySelector('.tooltipV2__X');

        // // Setup tooltip events
        // $tooltipX.addEventListener('click', (event) => {
        //   // console.log('tooltip::click');
        //   event.preventDefault();
        //   event.stopPropagation();
        //   _this.close();
        // });

        $tooltipContainer.addEventListener('mouseover', () => {
          // console.log('tooltip::mouseover');
          mouseState.mouseWithinTooltip = true;
        });
        $tooltipContainer.addEventListener('mouseleave', function () {
          // console.log('tooltip::mouseleave');

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
      }

      // HACK: Hardcode ID, node list passes wrong ID
      if ( node.node_id === 'CNG1' ) node.node_id = 'CNG#1';

      this.loadNodeDetail( node.node_id )
        .then((data) => {
          // collect
          const nodeDetail = node.type === nodeTypes.CCW
            ? data.node[0].ccw_info[0]
            : data.node[0].cng_info[0];
          const nodeBrief = data.node[0].node_brief;

          // do the mapping
          nodeDetail.interfaces.forEach((item) => {
            item.alarm_status = mapCodeToNodeStatus[item.alarm_status];
          });

          const toolTipHtml = toolTipTemplate({
            alarm_status: mapCodeToNodeStatus[nodeBrief.alarm_status],
            name: nodeBrief.name,
            type: nodeBrief.type,
            cpu_utilization: nodeDetail.cpu_utilization,
            memory_utilization: nodeDetail.memory_utilization,
            bandwidth_utilization: nodeDetail.bandwidth_utilization,
            num_clients: nodeDetail.num_clients,
            region: nodeDetail.region,
            interfaces: nodeDetail.interfaces,
          });
          // render data to view
          $toolTipWrap.innerHTML = toolTipHtml;
          setupToolTip(nodeDetail.interfaces);
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

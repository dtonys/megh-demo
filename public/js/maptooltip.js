(function () {
  const ICON_BLACK_BRANCH = 'img/icons/ccw-black.svg';
  const ICON_BLACK_CLOUD = 'img/icons/cng-icon-black.svg';
  // const ALERT = <i class="fas fa-camera-retro"></i>

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

  const CNG_TooltipTemplate = _.template(`
    <div class="tooltip" >
      <a href="node-summary?ip=<%= ip_address %>" >
        <div class="tooltip__head--cloud" >
          <img class="tooltip__headIcon--cloud" src="${ICON_BLACK_CLOUD}" />
          [Cloud Name]
          <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
        </div>
        <div class="tooltip__row--dark" >
          <div class="tooltip__col" > Status </div>
          <div class="tooltip__col" >
            <div class="statusDot--<%= nodeStatusClass %>"></div>
            <%= status %>
          </div>
        </div>
        <% _.each([
          ['Location', location],
          ['IP Address', ip_address],
          ['Clients', num_clients],
          ['Field4', 'Field4'],
          ['Field5', 'Field5']
        ], function( item, index ) { %>
          <div class="tooltip__row--<%= index % 2 ? 'dark' : 'light' %>" >
            <div class="tooltip__col" > <%= item[0] %> </div>
            <div class="tooltip__col" > <%= item[1] %> </div>
          </div>
        <% }) %>
      </a>
    </div>
  `);

  const CCW_TooltipTemplate = _.template(`
    <div class="tooltip" >
      <a href="node-summary?ip=<%= ip_address %>" >
        <div class="tooltip__head--branch" >
          <img class="tooltip__headIcon--branch" src="${ICON_BLACK_BRANCH}" />
          [Branch Name]
          <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
        </div>
        <div class="tooltip__row--dark" >
          <div class="tooltip__col" > Status </div>
          <div class="tooltip__col" >
            <div class="statusDot--<%= nodeStatusClass %>"></div>
            <%= status %>
          </div>
        </div>
        <% _.each([
          ['Location', location],
          ['IP Address', ip_address],
          ['Clients', num_clients],
          ['Field4', 'Field4'],
          ['Field5', 'Field5'],
          ['Field6', 'Field6'],
          ['Field7', 'Field7']
        ], function( item, index ) { %>
          <div class="tooltip__row--<%= index % 2 ? 'dark' : 'light' %>" >
            <div class="tooltip__col" > <%= item[0] %> </div>
            <div class="tooltip__col" > <%= item[1] %> </div>
          </div>
        <% }) %>
      </a>
    </div>
  `);

  const clusterToolTipTemplate = _.template(`
    <div class="clusterTooltip" >
      <a href="node-summary?ip=<%= nodes[0].ip_address %>" >
        <div class="tooltip__head--branch" >
          <img class="tooltip__headIcon--branch" src="${ICON_BLACK_BRANCH}" />
          <%= nodes.length %> Branches
        </div>
        <div class="clusterTooltip__tableHead" >
          <div class="clusterTooltip__tableRow--darker" >
            <div class="clusterTooltip__tableColumn--1" > Name </div>
            <div class="clusterTooltip__tableColumn--2" > Alarm Status </div>
            <div class="clusterTooltip__tableColumn--3" > Number of Links Connected </div>
            <div class="clusterTooltip__tableColumn--4" > Total Line Utilization </div>
          </div>
        </div>
        <div class="tooltip__tableContent" >
          <% _.each(nodes, function(node, index){ %>
            <div class="clusterTooltip__tableRow--<%= index % 2 ? 'dark' : 'light' %>" >
              <div class="clusterTooltip__tableColumn--1" > <%= node.location %> </div>
              <div class="clusterTooltip__tableColumn--2" >
                <div class="statusDot--<%= node.nodeStatusClass %>"></div>
                <%= node.status %>
              </div>
              <div class="clusterTooltip__tableColumn--3" > 13 </div>
              <div class="clusterTooltip__tableColumn--4" > 27 </div>
            </div>
          <% }) %>
        </div>
      </a>
    </div>
  `);

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
      const toolTipHtml = clusterToolTipTemplate({
        nodes: clusterNodes,
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
      const tooltipContainer = toolTipWrap.querySelector('.clusterTooltip');
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
      return true;
    };

    this.openOnMarker = function ( node ) {
      const toolTipTemplate = ( node.type === nodeTypes.CNG
        ? CNG_TooltipTemplate
        : node.type === nodeTypes.CCW
          ? CCW_TooltipTemplate
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

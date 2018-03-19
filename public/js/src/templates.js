window.templates = {};

window.templates.tableList = _.template(`
  <div class="tableList" >
    <div class="tableList__header--<%= type %>" >
      <% if ( type === 'cluster' ) { %>
        <img class="tableList__headerIcon--branch" src="img/icons/ccw-black.svg" />
        <%= nodes.length %> Branches
      <% } %>
      <% if ( type === 'alarms' ) { %>
        <i class="fas fa-exclamation-triangle"></i>
        Alarms
      <% } %>
      <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
    </div>
    <div class="tableList__head" >
      <div class="tableList__row--darker" >
        <% columns.forEach(function( config ) { %>
          <div class="tableList__column" style="width: <%= config.width %>" >
            <%= config.name %>
          </div>
        <% })%>
      </div>
    </div>
    <div class="tableList__content" >
      <% _.each(nodes, function(node, index){ %>
        <div class="tableList__row--<%= index % 2 ? 'dark' : 'light' %>" >
          <% columns.forEach(function( config ) { %>
            <div class="tableList__column" style="width: <%= config.width %>" >
              <% if ( config.type === 'text' ) { %>
                <%= config.getValue(node) %>
              <% } %>
              <% if( config.type === 'alarmStatus' ) { %>
                <div
                  style="margin-top: 0px;"
                  class="statusDot--<%= config.getValue(node) %>"
                ></div>
                <%= config.getValue(node) %>
              <% } %>
            </div>
          <% })%>
        </div>
      <% }) %>
    </div>
  </div>
`);

window.templates.CNGToolTip = _.template(`
  <div class="tooltip" >
    <a href="node-summary?ip=<%= ip_address %>" >
      <div class="tooltip__head--cloud" >
        <img class="tooltip__headIcon--cloud" src="img/icons/cng-icon-black.svg" />
        [Cloud Name]
        <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
      </div>
      <div class="tooltip__row--dark" >
        <div class="tooltip__col" > Status </div>
        <div class="tooltip__col" >
          <div class="statusDot--<%= severity %>"></div>
          <%= severity %>
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

window.templates.SmallChart = _.template(`
  <div class="tooltipV2__chart" >
    <div class="tooltipV2__chartTitleWrap" >
      <div class="tooltipV2__chartTitle"> <%= interface.link_id %> </div>
      <div style="margin-right: 20px;" ></div>
      <div class="tooltipV2__chartStatus">
        <div style="width: 9px; height: 9px;" class="statusDot--<%= interface.alarm_status %> statusDot--small"></div>
        <%= interface.alarm_status %>
      </div>
      <% if ( type === 'CCW' ) { %>
        <div style="flex: 1;" ></div>
        <div class="tooltipV2__linkSpeedText" > Up/Down Link Speed </div>
        <div style="margin-right: 10px;" ></div>
        <div class="tooltipV2__linkSpeedStats">
          <%= interface.provider.up_mb_per_second %> MB/<%= interface.provider._mb_per_second %> MB
        </div>
      <% } %>
    </div>
    <div class="tooltipV2__chartBody" >
      <div class="ct-chart m-chart-<%= index %>"></div>
    </div>
  </div>
`);

window.templates.CCWToolTipV2 = _.template(`
  <div class="tooltipV2 tooltipV2--<%= type %>" >
    <div class="tooltipV2__left" >
      <div class="tooltipV2__title" >
        <% if ( type === 'CCW' ) { %>
          <img class="tooltipV2__headIcon--branch" src="img/icons/ccw-black.svg" />
          Cloud Wan Connector
        <% } %>
        <% if ( type === 'CNG' ) { %>
          <img class="tooltipV2__headIcon--cloud" src="img/icons/cng-icon-black.svg" />
          Cloud Native Gateway
        <% } %>
      </div>
      <% const items = [
          { name: 'Name', value: name, type: 'text' },
          { name: 'Region', value: region, type: 'text', nodeType: 'CNG' },
          { name: 'Alarm Status', value: alarm_status, type: 'alarmStatus' },
          { name: 'CPU Utilization', value: cpu_utilization+'%', type: 'text', nodeType: 'CCW' },
          { name: 'Memory Utilization', value: memory_utilization+'%', type: 'text', nodeType: 'CCW' },
          { name: 'Branches Connected', value: num_clients, type: 'text', nodeType: 'CNG' },
          {
            name: 'Bandwidth Utilization',
            value: bandwidth_utilization,
            type: 'list'
          },
        ]
        .filter(function(item) {
          return ( !item.nodeType || ( item.nodeType && type === item.nodeType ) )
        })
        .forEach(function(item) { %>
          <div class="tooltipV2__itemWrap" >
            <div class="tooltipV2__itemLabel" > <%= item.name %> </div>
            <div class="tooltipV2__itemContent" >
            <% if ( item.type === 'text' ) { %>
               <%= item.value %>
            <% } %>
            <% if ( item.type === 'alarmStatus' ) { %>
              <div style="width: 9px; height: 9px;" class="statusDot--<%= item.value %> statusDot--small"></div>
              <%= item.value %>
            <% } %>
            <% if ( item.type === 'list' ) { %>
              <% item.value.forEach(function( listItem ) { %>
                <div class="tooltipV2__listItemContent" ><%= listItem %></div>
              <% }) %>
            <% } %>
            </div>
          </div>
      <% }) %>
    </div>
    <div class="tooltipV2__right">
      <% if ( interfaces.length ) { %>
        <div class="tooltipV2__flexWrap" >
          <div class="linkIcon--blue" >
            <div class="linkIcon__circle" ></div>
            <div class="linkIcon__line" ></div>
          </div>
          <div class="tooltipV2__linkText" > Up Link Throughput </div>
          <div style="margin-right: 20px;" ></div>
          <div class="linkIcon--black" >
            <div class="linkIcon__circle" ></div>
            <div class="linkIcon__line" ></div>
          </div>
          <div class="tooltipV2__linkText" > Down Link Throughput </div>
        </div>
        <div style="margin-bottom: 15px;" ></div>
      <% } %>
      <% interfaces.forEach(function( interface, index ) { %>
        <%= window.templates.SmallChart({
          interface: interface,
          type: type,
          index: index + 1,
        }) %>
      <% }) %>
    </div>
  </div>
`);


window.templates.CCWToolTip = _.template(`
  <div class="tooltip" >
    <a href="node-summary?ip=<%= ip_address %>" >
      <div class="tooltip__head--branch" >
        <img class="tooltip__headIcon--branch" src="img/icons/ccw-black.svg" />
        [Branch Name]
        <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
      </div>
      <div class="tooltip__row--dark" >
        <div class="tooltip__col" > Status </div>
        <div class="tooltip__col" >
          <div class="statusDot--<%= severity %>"></div>
          <%= severity %>
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

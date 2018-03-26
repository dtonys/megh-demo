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
      <% if ( tooltipX ) { %>
        <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
      <% } %>
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
          <%= interface.provider.up_mb_per_second %> MBs/<%= interface.provider._mb_per_second %> MBs
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
          <div class="tooltipV2__linkText" >
            <%= type === 'CNG' ? 'Tx' : 'Up Link' %> Throughput </div>
          <div style="margin-right: 20px;" ></div>
          <div class="linkIcon--black" >
            <div class="linkIcon__circle" ></div>
            <div class="linkIcon__line" ></div>
          </div>
          <div class="tooltipV2__linkText" >
            <%= type === 'CNG' ? 'Rx' : 'Down Link' %> Throughput
          </div>
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

window.templates.detailSideView = _.template(`
  <%  let nodeIcon = window.mapNodeToIcon( type, alarm_status_code )
      nodeIcon = nodeIcon.replace('.svg', '.png');
  %>
  <div>
    <a href="/">
      <i class="sideView__arrowIcon fas fa-arrow-left"></i>
      <div class="sideView__backText" >Back to map view</div>
    </a>
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap sideView__title">
    <img class="sideView__titleIcon" src="img/icons/ccw-black.svg" />
    Starbucks store #110
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap" >
    <div class="sideView__itemLabel" >Alarm Status</div>
    <div class="sideView__itemContent" >
      <div class="statusDot--<%= alarm_status %>" ></div>
      <%= alarm_status %>
    </div>
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap" >
    <div class="sideView__itemLabel" >Uptime</div>
    <div class="sideView__itemContent" >
      <%= uptime %>
    </div>
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap" >
    <div class="sideView__itemLabel" >Number of Links</div>
    <div class="sideView__itemContent" > <%= num_clients %> </div>
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap" >
    <div class="sideView__itemLabel" >Location</div>
    <img src="http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCCAbZiKsTAjUlrndGI56yVYzVeo8nt5uk&zoom=12&size=270x209&maptype=roadmap&markers=icon:http://52.8.48.118/<%= nodeIcon %>|<%= coords.lat %>,<%= coords.lng %>" />
  </div>
  <div style="margin-bottom: 20px" ></div>
  <div class="sideView__itemWrap" >
    <div class="sideView__itemLabel" >CNG Connected to</div>
    <div class="sideView__itemContent" > CNG #1 </div>
  </div>
`);


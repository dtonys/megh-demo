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
                <div class="statusDot--<%= node.severity %>"></div>
                <%= node.severity %>
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

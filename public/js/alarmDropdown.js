(function () {

  window.AlarmDropDown = function ( options ) {
    this.$trigger = options.$trigger;
    this.$container = options.$container;
    this.state = {
      alarms: []
    };

    this.initialize = function () {
      this.setupEvents();
    };

    this.isOpen = function () {
      return this.$container.style.display === '';
    };

    this.setupEvents = function () {
      this.$trigger.addEventListener('click', this.toggle.bind(this));
    };

    this.toggle = function () {
      this.isOpen() ? this.close() : this.open();
    };

    this.open = function () {
      this.render();
      this.$container.style.display = '';
    };

    this.close = function () {
      this.$container.style.display = 'none';
      this.$container.innerHTML = '';
    };

    this.render = function () {
      const mockNodes = [
        {
          location: 'Loc 1',
          status: 'red',
        },
        {
          location: 'Loc 2',
          status: 'yellow',
        },
        {
          location: 'Loc 3',
          status: 'green',
        },
      ];
      this.$container.innerHTML = window.templates.tableList({
        nodes: mockNodes,
        type: 'alarms',
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
    };
  };
})();

(function () {

  window.AlarmDropDown = function ( options ) {
    this.$trigger = options.$trigger;
    this.$container = options.$container;

    this.state = {
      alarmHistory: [],
      num_alarms: 0,
    };

    this.initialize = function () {
      this.setupEvents();
    };

    this.isOpen = function () {
      return this.$container.style.display === '';
    };

    this.setupEvents = function () {
      if ( !this.triggerListener ) {
        this.triggerListener = this.toggle.bind(this);
        this.$trigger.addEventListener('click', this.triggerListener );
      }
    };

    this.teardownEvents = function () {
      this.$trigger.removeEventListener('click', this.triggerListener);
      this.triggerListener = null;
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

    this.updateAlarmData = function ( alarmData ) {
      this.state.alarmHistory = alarmData.alarms[0].alarm_history;
      this.state.num_alarms = alarmData.alarms[0].num_alarms;

      // update events
      if ( this.state.num_alarms > 0 ) {
        this.setupEvents();
      }
      else if ( !this.isOpen() ) {
        this.teardownEvents();
      }
      this.render();
    };

    this.updateAlarmCount = function () {
      const $alarmRedDotIcon = this.$trigger.querySelector('.navbar__alarmsIcon');
      const $alarmCountText = this.$trigger.querySelector('.navbar__alarmsIconText');
      // Update alarms num
      if ( this.state.num_alarms > 0 ) {
        $alarmRedDotIcon.style.display = '';
        $alarmCountText.innerHTML = this.state.num_alarms;
      }
      else {
        $alarmRedDotIcon.style.display = 'none';
      }
    };

    this.render = function () {
      // Update alarms dropdown view
      this.$container.innerHTML = window.templates.tableList({
        nodes: this.state.alarmHistory,
        type: 'alarms',
        columns: [
          {
            name: 'Name',
            type: 'text',
            width: 16,
            getValue: ( alarm ) => ( alarm.node_id ),
          },
          {
            name: 'Type',
            type: 'text',
            width: 16,
            getValue: ( alarm ) => ( alarm.type ),
          },
          {
            name: 'Instance',
            type: 'text',
            width: 17,
            getValue: ( alarm ) => ( alarm.instance ),
          },
          {
            name: 'Severity',
            type: 'alarmStatus',
            width: 17,
            getValue: ( alarm ) => ( alarm.severity ),
          },
          {
            name: 'Description',
            type: 'text',
            width: 17,
            getValue: ( alarm ) => ( alarm.description ),
          },
          {
            name: 'Time(UTC)',
            type: 'text',
            width: 17,
            getValue: ( alarm ) => ( alarm.occurrence_date ),
          },
        ]
      });
    };
  };
})();

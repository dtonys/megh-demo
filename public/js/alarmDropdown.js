(function () {

  window.AlarmDropDown = function ( options ) {
    const mouseConfig = options.mouseConfig;

    this.$trigger = options.$trigger;
    this.$container = options.$container;

    this.mouseWithinDropdown = false;

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
      if ( !this.boundOpen && !this.boundClose ) {
        this.boundOpen = this.open.bind(this);
        this.boundClose = this.closeWithDelay.bind(this);
        this.$trigger.addEventListener('mouseenter', this.boundOpen );
        this.$trigger.addEventListener('mouseleave', this.boundClose );
      }
    };

    this.teardownEvents = function () {
      if ( this.boundOpen && this.boundClose ) {
        this.$trigger.removeEventListener('mouseenter', this.boundOpen );
        this.$trigger.removeEventListener('mouseleave', this.boundClose );
        this.boundOpen = null;
        this.boundClose = null;
      }
    };

    this.open = function () {
      this.mouseWithinTrigger = true;
      this.render();
      this.$container.style.display = '';

      const $dropdown = this.$container.querySelector('.tableList');
      const $tooltipX = this.$container.querySelector('.tooltip__X');

      $tooltipX.addEventListener( 'click', this.close.bind(this) );
      $dropdown.addEventListener( 'mouseenter', () => {
        this.mouseWithinDropdown = true;
        // console.log('$dropdown::mouseenter');
        // console.log(`this.mouseWithinDropdown:: ${this.mouseWithinDropdown}`);
      });
      $dropdown.addEventListener( 'mouseleave', () => {
        this.mouseWithinDropdown = false;
        // console.log('$dropdown::mouseleave');
        window.setTimeout(() => {
          if ( this.mouseWithinTrigger ) return;
          this.close();
        }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS );
      });
    };

    this.close = function () {
      // close
      this.$container.style.display = 'none';
      this.$container.innerHTML = '';
    };

    this.closeWithDelay = function () {
      this.mouseWithinTrigger = false;
      window.setTimeout(() => {
        // console.log('this.close');
        // console.log(`this.mouseWithinDropdown:: ${this.mouseWithinDropdown}`);
        if ( this.mouseWithinDropdown === true ) return;
        this.close();
      }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS );
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

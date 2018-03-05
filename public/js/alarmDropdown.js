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
      this.$container.innerHTML = this.template( this.state );
    };

    this.template = _.template(`
      <div> AlarmDropDownTemplate </div>
    `);
  };
})();

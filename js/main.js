(function() {

  "use strict";

  var options, App;

  window.App = App = function(google, el) {
    this.google = google;

    this.el = el;

    this.geocoder = new this.google.maps.Geocoder();

    this.map = null;

    this.startMarker = null;

    this.centerMarker = null;

    this.circle = null;

    this.distance = 0;

    this._initMap();
  };

  App.prototype._initMap = function() {
    var that = this;

    this.map = new this.google.maps.Map(this.el, {
      zoom: 15,
      center: new this.google.maps.LatLng(35.709984, 139.810703)
    });
    this.map.addListener("center_changed", this._updateCenterMarker.bind(this));

    this.startMarker = new this.google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map
    });

    this.centerMarker = new this.google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map
    });

    this.circle = new google.maps.Circle({
      center: this.startMarker.getPosition(),       // 中心点(google.maps.LatLng)
      fillColor: 'transparent',   // 塗りつぶし色
      fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
      map: this.map,             // 表示させる地図（google.maps.Map）
      radius: 750,          // 半径（ｍ）
      strokeColor: '#ff0000', // 外周色
      strokeOpacity: 0.5,       // 外周透過度（0: 透明 ⇔ 1:不透明）
      strokeWeight: 5         // 外周太さ（ピクセル）
    });

    setTimeout(function() {
      that._updateStartMarker(that.map.getCenter());
      that._updateCenterMarker();
    }, 10);
  };

  App.prototype._updateCenterMarker = function() {
    this.centerMarker.setPosition(this.map.getCenter());
    this._updateDistance();
  };

  App.prototype._updateStartMarker = function(position) {
    this.startMarker.setPosition(position);
    this._updateDistance();
    this._updateCircle();
  };

  App.prototype._updateDistance = function() {
    this.distance = this.google.maps.geometry.spherical.computeDistanceBetween(this.centerMarker.getPosition(), this.startMarker.getPosition());
    this.onDistanceUpdated(this.distance);
  };

  App.prototype._updateCircle = function() {
    this.circle.setCenter(this.startMarker.getPosition());
  };

  App.prototype.setStartPoint = function(address, onError) {
    var that = this;

    if (address == null) {
      this._updateStartMarker(this.map.getCenter());
      return;
    }

    this.geocoder.geocode({
      address: address
    }, function(results, status) {
      if (status == that.google.maps.GeocoderStatus.OK) {
        // Set the position of the specified address.

        that.map.setCenter(results[0].geometry.location);
        that._updateStartMarker(results[0].geometry.location);

      } else {
        // Error.

        onError();

      }
    });
  };

  App.prototype.onDistanceUpdated = function(distance) {};

})();
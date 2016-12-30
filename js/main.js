(function() {

  "use strict";

  var options, App;

  window.App = App = function(el) {

    /**
     * 地図を配置する HTML 要素
     *
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Geocoder Object.
     *
     * @type {google.maps.Geocoder}
     */
    this.geocoder = new google.maps.Geocoder();

    this.map = null;

    this.startMarker = null;

    this.centerMarker = null;

    this.circle = null;

    this.lineOptions = [
      { angle: 15,  type: 0 },
      { angle: 45,  type: 1 },
      { angle: 75,  type: 0 },
      { angle: 105, type: 0 },
      { angle: 135, type: 1 },
      { angle: 165, type: 0 },
      { angle: 195, type: 0 },
      { angle: 225, type: 1 },
      { angle: 255, type: 0 },
      { angle: 285, type: 0 },
      { angle: 315, type: 1 },
      { angle: 345, type: 0 }
    ];

    this.lineStyles = [
      {
        color: "#ff0000",
        width: 5
      },
      {
        color: "#0000ff",
        width: 3
      }
    ];

    this.lineList = [];

    /**
     * 起点から中心点までの距離
     *
     * @private
     * @type {Number}
     */
    this.distance = 0;

    this._initMap();
  };

  /**
   * 地図を初期化する。
   *
   * @private
   */
  App.prototype._initMap = function() {
    var that = this;

    this.map = new google.maps.Map(this.el, {
      zoom: 15,
      center: new google.maps.LatLng(35.709984, 139.810703)
    });
    this.map.addListener("center_changed", this._updateCenterMarker.bind(this));

    this.startMarker = new google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map
    });

    this.centerMarker = new google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map
    });

    this.circle = new google.maps.Circle({
      center: this.startMarker.getPosition(),
      map: this.map,
      fillColor: "transparent",
      fillOpacity: 0.5,
      radius: 750,
      strokeColor: '#ff0000',
      strokeOpacity: 0.5,
      strokeWeight: 3
    });

    this.lineOptions.forEach(function(option) {
      that.lineList.push(new google.maps.Polyline({
        path: that._getLinePath(option.angle),
        map: that.map,
        strokeColor: that.lineStyles[option.type].color,
        strokeOpacity: 0.5,
        strokeWeight: that.lineStyles[option.type].width
      }));
    });

    setTimeout(function() {
      that._updateStartMarker(that.map.getCenter());
      that._updateCenterMarker();
    }, 10);
  };

  /**
   * 中心点マーカーを更新する。
   *
   * @private
   */
  App.prototype._updateCenterMarker = function() {
    this.centerMarker.setPosition(this.map.getCenter());
    this._updateDistance();
  };

  /**
   * 指定された場所に起点マーカーを設定する。
   *
   * @private
   * @param  {[type]} position [description]
   * @return {[type]}          [description]
   */
  App.prototype._updateStartMarker = function(position) {
    this.startMarker.setPosition(position);
    this._updateDistance();
    this._updateCircle();
    this._updateLine();
  };

  /**
   * 起点から中心点までの距離を更新する。
   *
   * @private
   */
  App.prototype._updateDistance = function() {
    this.distance = google.maps.geometry.spherical.computeDistanceBetween(
      this.centerMarker.getPosition(),
      this.startMarker.getPosition()
    );
    this.onDistanceUpdated(this.distance);
  };

  /**
   * 円を更新する。
   *
   * @private
   */
  App.prototype._updateCircle = function() {
    this.circle.setCenter(this.startMarker.getPosition());
  };

  /**
   * 線を更新する。
   *
   * @private
   */
  App.prototype._updateLine = function() {
    var that = this;

    this.lineList.forEach(function(line, i) {
      line.setPath(that._getLinePath(that.lineOptions[i].angle));
    });
  };

  /**
   * 起点を始点とし、指定された角度を持つ線のパスを取得する。
   *
   * @private
   * @param  {Number} angle 角度(deg)
   * @return {Array}        パス
   */
  App.prototype._getLinePath = function(angle) {
    return [
      this.centerMarker.getPosition(),
      new google.maps.geometry.spherical.computeOffset(this.centerMarker.getPosition(), 100000, angle)
    ];
  };

  /**
   * 起点を設定する。
   * 住所が設定されていない場合は、現在の中心を起点に設定する。
   *
   * @public
   * @param {String}   address 住所
   * @param {Function} onError エラー時のイベントハンドラ
   */
  App.prototype.setStartPoint = function(address, onError) {
    var that = this;

    if (address == null) {
      this._updateStartMarker(this.map.getCenter());
      return;
    }

    this.geocoder.geocode({
      address: address
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // Set the position of the specified address.

        that.map.setCenter(results[0].geometry.location);
        that._updateStartMarker(results[0].geometry.location);

      } else {
        // Error.

        onError();

      }
    });
  };

  /**
   * 起点から中心点までの距離が更新されたときに呼ばれるイベントハンドラ。
   *
   * @param  {Number} distance 距離
   */
  App.prototype.onDistanceUpdated = function(distance) {};

})();
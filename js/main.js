(function() {

  "use strict";

  var options, App;

  window.App = App = function(google, el) {
    this.google = google;

    this.el = el;

    this.geocoder = new this.google.maps.Geocoder();

    // 八方位
    this.angleList = [
      15,
      75,
      105,
      165,
      195,
      255,
      285,
      345
    ];

    this.map = null;

    this.startMarker = null;

    this.centerMarker = null;

    this.circle = null;

    this.lineList = [];

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
      map: this.map,
      fillColor: 'transparent',   // 塗りつぶし色
      fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
      radius: 750,          // 半径（ｍ）
      strokeColor: '#ff0000', // 外周色
      strokeOpacity: 0.5,       // 外周透過度（0: 透明 ⇔ 1:不透明）
      strokeWeight: 5         // 外周太さ（ピクセル）
    });

    this.angleList.forEach(function(angle) {
      that.lineList.push(new google.maps.Polyline({
        path: that._getLinePath(angle),
        map: that.map,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
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
    this.distance = this.google.maps.geometry.spherical.computeDistanceBetween(
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
      line.setPath(that._getLinePath(that.angleList[i]));
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
      new google.maps.geometry.spherical.computeOffset(this.centerMarker.getPosition(), 2000000, angle)
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

  /**
   * 起点から中心点までの距離が更新されたときに呼ばれるイベントハンドラ。
   *
   * @param  {Number} distance 距離
   */
  App.prototype.onDistanceUpdated = function(distance) {};

})();
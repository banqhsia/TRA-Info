import moment from 'moment'
import stations from '../../static/stations.json'
import periods from '../../static/periods.json'
import tripLines from '../../static/triplines.json'
import trainClassMaps from '../../static/trainclassmaps.json'
import trainClasses from '../../static/trainclasses.json'


export default {

  /**
   * Transform `台` into `臺` in order to search the station.
   * return string with `臺`
   */
  taiTransform: function (w) {
    return w.replace(/台/g, '臺') || '';
  },

  /* Replace whitespace more than 1, split into array
   * return keyword Array
   */
  strToArray: function (s) {
    return s.replace(/\s{1,}/ig, ' ').split(' ');
  },

  /* return the result of searching `trainClassMap`.
   * undefined is returned if there's no such train class definition
   */
  searchTrainClass: function (def = '') {

    for (let i in trainClassMaps) {
      if (trainClassMaps[i].classDef.indexOf(def.toLowerCase()) >= 0) {
        return trainClassMaps[i].classDetail;
      }
    }

  },

  getStations: function () {
    return axios.get(
      process.env.API_BASE_URL + 'api/stations'
    )
  },

  getStationDetail: function (stationNo, date) {

    let toBuild = _.pickBy({
      no: stationNo,
      date: date,
    })

    let query = new URLSearchParams(toBuild).toString()

    return axios.get(
      process.env.API_BASE_URL + 'api/station?' + query
    )
  },

  /**
   * Search Date
   */
  searchDate: function (d) {

    d = d || '';

    // Year Handling format
    let yearCondition = ['YYYY-M-D', 'YYYY年M月D日', 'YYYY/M/D'];
    // Month && Day only handling format
    let noYearCondition = ['M-D', 'M月D日', 'M/D', 'M月D'];

    function getToday() {
      return moment().format('YYYY-MM-DD');
    }
    // Get the weekday by given string
    function getDay(d) {
      return moment().isoWeekday(d);
    }
    // Check if the given condition matches the format of date
    // It's an alias of `moment.js`
    function isValidDate(param) {
      return moment(d, param, true).isValid();
    }

    // Get the moment() instance by many ways
    let m = (() => {

      // If matches the following format (下週一, 週三, 星期六, 禮拜天... etc...)
      if (d.match(/(下)?(週|星期|禮拜)(一|二|三|四|五|六|日|天)/)) {

        // Replace '禮拜' to '星期'
        d = d.replace('禮拜', '星期');

        // If contains `下` then stands for `NEXT`
        if (/^下/.test(d)) {
          // Remove `下` of the start of String, and add 1 week for the `next`.
          return getDay(d.replace(/下/g, '')).add(1, 'WEEK');
        }

        // Determine if the date is before today or not. If so, get the next weekday
        if (getDay(d).isBefore(getToday())) {
          return getDay(d).add(1, 'WEEK');
        }

        return getDay(d);
      }

      // If matches the `Year` format
      if (yearCondition.map(isValidDate).includes(true)) {
        return moment(d, 'YYYY-MM-DD');
      }

      // If matches the `noYear` format
      if (noYearCondition.map(isValidDate).includes(true)) {
        return (moment(d, 'MM-DD').isBefore(getToday())) ?
          moment(d, 'M-D').add(1, 'year') :
          moment(d, 'M-D');
      }

      // Match 今天, 明天, 大後天 .. etc.., get the offset against today
      let v = (() => {

        v = periods.find((period) => {
          return period.dateDefine == d
        });

        // Find no result, return `add 0 days` (today)
        return (v) ? v.dateValue : 0;

      })();

      return moment().add(v, 'DAYS');

    })();

    return {
      'date': m.format('YYYY-MM-DD'),
      'humanize': m.format('YYYY年MM月DD日 (dddd)'),
      'today': moment(getToday()).isSame(m.format('YYYY-MM-DD')),
    };
  },

  /**
   * Check if the train has departured
   */
  isDeparture: function (departure) {

    let today = moment().format('YYYY-MM-DD');
    let now = moment().format('HH:mm');

    return (moment(now, 'HH:mm').isAfter(moment(departure, 'HH:mm'))) ?
      true :
      false;

  },

  /**
   * Determine if the train is delay.
   * t: TrainNo, delayInfo: Delay info given from component
   */
  isDelay: function (t, delayInfo, wantsColor) {

    return (() => {

      let r = delayInfo.find((delay) => {
        return delay.TrainNo == t
      });

      // Check if find a train
      r = (r) ? r.DelayTime : false;

      if (!wantsColor) {
        return Number(r) === 0 ? null : r;
      }

      // Otherwise wants color...
      if (r !== false) {
        return Number(r) === 0 ? 'green' : 'yellow';
      }

      // Find nothing
      return false;

    })();

  },

  /**
   * Time subtract, return difference (string)
   * Use moment.js, and strip `0小時` from the result.
   */
  timeDiff: function (s, e) {

    // Create a moment object that contains time difference.
    let timeObject = moment.utc(
      moment(e, 'HH:mm').diff(
        moment(s, 'HH:mm')
      )
    )

    let r = {
      // Sort
      value: timeObject.format('HH:mm'),
      // Display
      humanize: timeObject.format('H[小時]m[分鐘]').replace(/^0小時/g, '')

    }

    // Handle `Invalid date`. Avoid to display.
    return (timeObject == 'Invalid date') ? '' : r;
  },

  /**
   * Trim train class description
   */
  trainClassZH: function (t, wantsColor) {

    // If TRA left train class name blank, use English name instead
    t = (t.Zh_tw) ? t.Zh_tw : t.En

    let r = t.replace(/自強\(普悠瑪\)/g, '普悠瑪').replace(/自強\(太魯閣\)/g, '太魯閣')
      .replace(/自強\(DMU2800、2900、3000型柴聯及 EMU型電車自強號\)/g, '自強')
      .replace(/區間快/g, '區間快車').replace(/.*(Chu-Kuang).*/g, '莒光').replace(/.*(Tze-Chiang).*/g, '自強')
      .replace(/\(.+\)/g, '') || '其他';

    if (wantsColor) {

      return trainClasses.find((trainClass) => {
        return trainClass.classDesc == r
      }).classColor;

    }

    return r;

  },

  /**
   * Transform `TrainTypeID` into train class
   * wantsColor[Boolean] determine if the call wants color.
   */
  trainClass: function (c = '', wantsColor) {

    let testField = () => {
      return (wantsColor) ? 'classColor' : 'classDesc';
    }

    return trainClasses.find((trainClass) => {
      return trainClass.classNo == c
    })[testField()]

  },

  /**
   * Return Trip Lines description
   */
  tripLine: function (l = 0, wantsColor) {
    if (wantsColor) {
      return _.get(tripLines, l).lineColor;
    }

    return _.get(tripLines, l).lineDesc;
  },

  /**
   * Return TRUE if the DMU note exists.
   */
  DMULabel: function (n) {
    return /柴聯自強號(，|。)/ig.test(n);
  },

  // *********************************
  //  Requests
  // *********************************

  /**
   * Get live board information (delay information)
   */
  getLiveboard: function (station) {

    return axios.get(
      process.env.API_BASE_URL + '/LiveBoard/' + station
    )
  },


  /**
   * Get daily timetable with Origin and Destination
   */
  searchTimetableBetweenOriginAndDestination: function (keyword) {
    return axios.get(
      process.env.API_BASE_URL + 'api/search?keyword=' + keyword
    )
  },

  /**
   * Get the fares between startStation and destStation
   */
  getODFare: function (start, dest) {

    return axios.get(
      process.env.API_BASE_URL + '/ODFare/' +
      start + '/to/' + dest
    )

  },

  /**
   * Get the specific train information by TrainNo
   */
  searchTimetableByTrainNo: function (trainNo, date) {

    let query = new URLSearchParams({
      no: trainNo,
      date: date,
    }).toString()

    return axios.get(
      process.env.API_BASE_URL + 'api/train?' + query
    )
  },

  /**
   * 特定車站的所有列車
   */
  getTimetableByStationNo: function (stationNo, date = null) {
    let toBuild = _.pickBy({
      no: stationNo,
      date: date,
    })

    let query = new URLSearchParams(toBuild).toString()

    return axios.get(
      process.env.API_BASE_URL + 'api/station/timetable?' + query
    );
  },

  /**
   * 是否為跨日列車
   */
  overNightLabel: function (OverNightStationID) {
    return OverNightStationID !== "";
  },

  /**
   * 車種顏色
   */
  trainTypeColor: function (typeCode) {
    let typeColors = {
      /** 太魯閣 */ "1": "blue",
      /** 普悠瑪 */ "2": "pink",
      /** 自強 */ "3": "red",
      /** 莒光 */ "4": "orange",
      /** 區間快 */ "10": "grey"
    };

    return _.get(typeColors, typeCode, "");
  }
}

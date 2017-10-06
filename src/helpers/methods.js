import moment from 'moment'
import stations from '../../static/stations.json'
import periods from '../../static/periods.json'
import trainClassMaps from '../../static/trainclassmaps.json'

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

  /**
   * Search a station
   * return JSON Object
   * s: station Name/station Code.
   * fuzzy: fuzzy search mode.
   */
  searchStation: function (s = '', fuzzy = false) {

    // Return false if `s` is falsy.
    if (!s) return false;

    let r;

    // Use Fuzzy mode when `fuzzy` is true
    if (fuzzy) {

      r = new Fuse(stations, {
        // Fuse.js Fuzzy searching score
        threshold: 0.2,
        // Define which field to find
        keys: ['Station_Name', 'Station_EName', 'Station_Code_3', 'Station_Code_4'],
      }).search(s)[0]

    } else {

      // Test which field will go on
      let testField = () => {

        // 	Matches `Station_Code_4`. eg. 1008, 1017...
        if (/^\d{4}$/.test(s)) {
          s = Number(s);
          return 'Station_Code_4'
        }

        // Matches `Station_Code_3`. eg. 2, 4, 26, 100, 108
        if (/^\d{1,3}$/.test(s)) {
          s = Number(s);
          return 'Station_Code_3'
        }

        // Else: Search `Station_Name`.
        s = this.taiTransform(s)
        return 'Station_Name'

      }

      r = stations.find((station) => {
        return station[testField()] == s || false
      });

    }

    // Remove Station Sub Name from the Object.
    if (r) {
      let removeRegex = /(.+)\s?\((.+)\)/

      r.Station_EName = r.Station_EName.replace(removeRegex, "$1")
      r.EnglishName = r.EnglishName.replace(removeRegex, "$1")
    }

    return r || false;

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
   * Return TRUE if the DMU note exists.
   */
  DMULabel: function (n) {
    return /柴聯自強號(，|。)/ig.test(n);
  },

  /**
   * Return TRUE if the train is across between 2 days.
   */
  acrossDayLabel: function (n) {
    return /跨日/ig.test(n);
  },

  // *********************************
  //  Requests
  // *********************************

  /**
   * Get live board information (delay information)
   */
  getLiveboard: function (station) {

    return axios.get(
      'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/LiveBoard/' + station + '?$format=JSON'
    )
  },


  /**
   * Get daily timetable with Origin and Destination
   */
  getDailyTimeTableOD: function (start, dest) {

    return axios.get(
      'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/' +
      start + '/to/' + dest + '/' + this.period.date + '?$format=JSON'
    )

  },

  /**
   * Get the fares between startStation and destStation
   */
  getODFare: function (start, dest) {

    return axios.get(
      'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/ODFare/' +
      start + '/to/' + dest + '?$format=JSON'
    )

  },

  /**
   * Get the specific train information by TrainNo
   */
  getDailyTimeTable: function (train) {

    return axios.get(
      'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/' +
      train + '/' + this.period.date + '?$format=JSON'
    )
  },

  /**
   * Send a request to get train info
   */
  getTrainInfo: function (station) {

    return axios.get(
      'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/Station/' +
      station + '/' + this.period.date + '?$format=JSON'
    );
  }
}

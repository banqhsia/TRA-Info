import moment from 'moment'
import stations from '../../static/stations.json'

export default {

  /**
   * Transform `台` into `臺` in order to search the station.
   * return string with `臺`
   */
  taiTransform: function (w) {
    return w.replace('台', '臺') || '';
  },

  /**
   * Search a station
   * return JSON Object
   * s: station Name/station Code.
   */
  searchStation: function (s) {

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

    let r = stations.find((station) => {
      return station[testField()] == s || false
    });

    // Remove Station Sub Name from the Object.
    let removeRegex = /(.+)\s?\((.+)\)/

    r.Station_EName = r.Station_EName.replace(removeRegex, "$1")
    r.EnglishName = r.EnglishName.replace(removeRegex, "$1")

    return r;

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
      // try {
      //   var v = $filter('filter')(period, {
      //     dateDefine: d || false
      //   }, true)[0].dateValue;
      // } catch (e) {
      //   var v = 0;
      // }

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
  }



}

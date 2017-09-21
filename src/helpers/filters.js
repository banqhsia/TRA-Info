import moment from 'moment'
import tripLines from '../../static/triplines.json'
import trainClasses from '../../static/trainclasses.json'

export default {

  /**
   * Return Trip Lines description
   */
  tripLine: function (l = 0, wantsColor) {

    let testField = () => {
      return (wantsColor) ? 'lineColor' : 'lineDesc';
    }

    return tripLines.find((tripLine) => {
      return tripLine.lineNo == l || 0
    })[testField()];
  },

  /**
   * Transform `TrainClassificationID` into train class
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
   * Formatting note. Strip `每日行駛。` from note.
   */
  noteFormat: function (n = '') {
    return n.replace('每日行駛。', '').replace(/柴聯自強號(，|。)/ig, '');
  },

  /**
   * Return TRUE if the DMU note exists.
   */
  DMULabel: function (n) {
    return /柴聯自強號(，|。)/ig.test(n);
  },

  /**
   * Time subtract, return difference (string)
   * Use moment.js, and strip `0小時` from the result.
   */
  timeDiff: function (s, e) {
    let r = moment.utc(
      moment(e, 'HH:mm').diff(
        moment(s, 'HH:mm')
      )
    ).format('H[小時]m[分鐘]').replace(/^0小時/g, '');

    // Handle `Invalid date`. Avoid to display.
    return (r == 'Invalid date') ? '' : r;
  }
}

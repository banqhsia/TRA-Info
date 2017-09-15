import moment from 'moment'
import tripLines from '../../static/triplines.json'
import trainClasses from '../../static/trainclass.json'

export default {

  /**
   * Trip Lines
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
}

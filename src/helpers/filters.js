import moment from 'moment'
import trainClasses from '../../static/trainclasses.json'

export default {

  /**
   * Formatting note. Strip `每日行駛。` from note.
   */
  noteFormat: function (n = '') {
    return n.replace('每日行駛。', '').replace(/柴聯自強號(，|。)/ig, '');
  },

}

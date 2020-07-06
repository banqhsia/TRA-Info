export default {
    'isNotEmpty': function (value) {
        return !_.isEmpty(value);
    },
    'isNotNull': function (value) {
        return !_.isNull(value);
    }
}
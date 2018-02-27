let
  test = require('tape'),
  time = require('../index');

test('default layout', function(t) {
  let want = '2016-01-02T03:04:06.999Z',
      YMDhms = new time.Parser('YMDhms'),
      t20 = new time.Parser('20');

  [
    '2016-01-02T03:04:06.999Z',
    '2016-1-2T3:4:6.999Z',
    'Sat, 2016-1-2T3:4:6.999Z',
    'Sat, 2016 jan 2 3:4:6.999Z',
    'Sat, 2016 Jan 2 3:4:6.999',
    '2016 01 02 03 04 06.999',
    '2016/01/02 03 04 06.999',
    '2016 Jan 02 03 04 06.999',
    '2016 Jan 02 03 04 06.999 -0000',
    '2016 Jan 02 03 04 06.999 +00:00',
    '2016 Jan 02 03 04 06.999 GMT-0000',
    '2016 Jan 02 03 04 06.999 GMT+00:00',
    '2016 Jan 02 03 04 06.999 UTC-0000',
    '2016 Jan 02 03 04 06.999 UTC+00:00',
    '2016 Jan 02 03 04 06.999 Z-0000',
    '2016 Jan 02 03 04 06.999 Z+00:00',
    '2016 Jan 02 03 04 06.999GMT0000',
    '2016 Jan 02 03 04 06.999GMT00:00',
    '2016 Jan 02 03 04 06.999UTC0000',
    '2016 Jan 02 03 04 06.999UTC00:00',
    '2016 Jan 02 03 04 06.999Z0000',
    '2016 Jan 02 03 04 06.999Z00:00',
    '2016 Jan 02 03 04 06.999Z0',
    '2016 Jan 02 03 04 06.999Z00',
    '20160102 03:04:06.999',
    '20160102T030406.999',
    '20160102030406.999',
    '030406.999 20160102 ',
    'Jan 02 2016 03:04:06.999',
    'Jan 2 2016 03:04:06.999',
    'Jan 2 03:04:06.999 2016 ',
    '02-Jan-2016 03:04:06.999 ',
    '02 Jan 03:04:06.999 2016 ',
    '2 Jan 03:04:06.999 2016 ',
    '03:04:06.999 20160102',
    '03:04:06.999T20160102'
  ].forEach((s,i) => {
    t.equal(String(time.parse(s)), want, s);
    if (i < 28)
      t.equal(String(YMDhms.parse(s)), want, s);
    if (!s.endsWith(' '))
      t.equal(String(t20.parse(s.replace('2016', '16'))), want, s);
  });

  t.end();
});

test('20-0700 layout', function(t) {
  let want = '2016-01-02T03:04:06UTC-0700',
      parser = new time.Parser('20-0700');
  [
    '2016 Jan 02 03:04:06',
    '2016 01 2 03:04:06',
    '160102 03:04:06UTC-07',
    '16 1 2 03:04:06Z-7',
  ].forEach((s,i) => {
    t.equal(String(parser.parse(s)), want, s);
  });
  t.end();
});

test('20MDhmsY-0700 layout', function(t) {
  let want = '2016-01-02T03:04:06UTC-0700',
      parser = new time.Parser('20MDhmsY-0700');

  [
    'Jan 02 03:04:06 2016',
    '01 2 03:04:06 16',
    '1  2 03:04:06 16',
  ].forEach((s,i) => {
    t.equal(String(parser.parse(s)), want, s);
  });
  t.end();
});

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
    'Jan-02-2016 03:04:06.999',
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

test('UTC offsets', function(t) {
  let ymd = '2018-02-28';
  [
    '2018-02-28','Z',
    'Feb-28-2018','Z',

    '2018-02-28Z+0800', '+',
    '2018-02-28 Z+8:0', '+',
    '2018-02-28 Z+8', '+',

    '2018-02-28Z-0800', '-',
    '2018-02-28 Z-8:0', '-',
    '2018-02-28 Z-8', '-',

    '2018-02-28Z+0800 LSC', '+',
    '2018-02-28 Z+8:0 LSC', '+',
    '2018-02-28 Z+8 LSC', '+',

    '2018-02-28Z-0800 LSC', '-',
    '2018-02-28 Z-8:0 LSC', '-',
    '2018-02-28 Z-8 LSC', '-',
  ].forEach((s,i,a) => {
    if (i & 1) return;
    let date = String(time.parse(s)),
      offset = date.endsWith('Z') && 'Z' || date.slice(-5);
    t.equal(date.slice(0, 10), ymd, s);
    t.equal(offset, a[i + 1] === 'Z' && 'Z' || a[i + 1] + '0800', s);
  });

  t.equal(String(time.parse('02-2018')).slice(0, 7), '2018-02', '02-2018');
  t.equal(String(time.parse('-2018')).slice(0, 8), '-2018-00', '-2018');
  t.end();
});

test('null', function(t) {
  let ymd = new time.Parser('YMD');
  [
    '2018022803',
    '20180229',
    '20180100',
    '20180132',
    '20181100',
    '20181131',
    '20181301',
    '20180001',
    '2018MM01'
  ].forEach((s,i,a) => {
    t.equal(String(time.parse(s)), 'null', s);
    t.equal(String(ymd.parse(s)), 'null', s);
  });

  t.end();
});

test('throw Error', function(t) {
  t.throws(()=> {
    new time.Parser('YMDY');
  });
  t.throws(()=> {
    [
      '2018Z-13',
      '2018Z+13',
      '2018Z-1160',
      '2018Z+1160',

      '19710630235960',
      '19711231235960',
      '19720630010160',
      '99991231235960',
    ].forEach(time.parse);
  }, /^Error: (Dup|Inv|Leap)/);
  t.end();
});

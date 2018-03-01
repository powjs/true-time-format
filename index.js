let
  ISSUES = 'https://github.com/powjs/true-time-format/issues',
  WEEKDAY = [
    'sun','mon','tue','wed','thu','fri','sat'
  ],
  MONTH = [
    'jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'
  ],
  // https://www.ietf.org/timezones/data/leapseconds
  EXPIRESDAY = 20181228,
  EXPIRED = `Leapseconds list has expired on ${EXPIRESDAY}, ${ISSUES}`,
  LEEPSECOND = [
    19720630,
    19721231,
    19731231,
    19741231,
    19751231,
    19761231,
    19771231,
    19781231,
    19791231,
    19810630,
    19820630,
    19830630,
    19850630,
    19871231,
    19891231,
    19901231,
    19920630,
    19930630,
    19940630,
    19951231,
    19970630,
    19981231,
    20051231,
    20081231,
    20120630,
    20150630,
    20161231
  ],
  STYLES = {
    '422222': 'YMDhms',
    '4M2222': 'YMDhms',
    '222222': 'YMDhms',
    '2M2222': 'YMDhms',

    '2M4222': 'DMYhms',
    '2M2224': 'DMhmsY',

    '224222': 'MDYhms',
    'M24222': 'MDYhms',
    'M22222': 'MDYhms',
    'M22224': 'MDhmsY',

    '42222': 'YMDhm',
    '4M222': 'YMDhm',
    '22222': 'YMDhm',
    '2M222': 'YMDhm',

    '22422': 'MDYhm',
    'M2422': 'MDYhm',
    '2M422': 'MDYhm',

    '422': 'YMD',
    '4M2': 'YMD',
    '222': 'YMD',
    '2M2': 'YMD',

    '224': 'MDY',
    'M24': 'MDY',
    '2M4': 'DMY',

    '22': 'YM',
    '42': 'YM',
    '4M': 'YM',
    '2M': 'YM',
    '24': 'MY',
    'M4': 'MY',
    'M2': 'MY',

    '8222': 'YMDhms',
    '6222': 'YMDhms',
    '2228': 'hmsYMD',
    '2226': 'hmsYMD',

    '822': 'YMDhm',
    '622': 'YMDhm',
    '228': 'hmYMD',
    '226': 'hmYMD',

    '8': 'YMD',
    '6': 'YMD',
    '4': 'Y'
  };

function offset(s) {
  let x = parseInt(s);
  if (invalidOffset(x))
    throw Error('Invalid Time offset from UTC: ' + s);
  return x;
}

function invalidOffset(x) {
  let y = x % 100;
  return x < -1200 || x > 1200 || y < -59 || y > 59;
}

class Time {
  constructor() {
    this.year = 0;
    this.month = 0;
    this.day = 0;
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.nanosecond = 0;
    this.offset = 0;
    this.dst = false;
    this.lsc = false;
  }

  toString() {
    let
      Y = this.year,
      M = xx(this.month),
      D = xx(this.day),
      h = xx(this.hour),
      m = xx(this.minute),
      s = xx(this.second),
      n = nanoString(this.nanosecond),
      T = this.dst && 'DST' || 'T',
      Z = UTCoffsets(this.offset),
      L = this.lsc && 'LSC' || '';
    return `${Y}-${M}-${D}${T}${h}:${m}:${s}${n}${L}${Z}`;
  }
}

function nanoString(x) {
  if (!x) return '';
  if (x % 1000 === 0) x = x / 1000;
  if (x % 1000 === 0) x = x / 1000;
  return '.' + x;
}

function UTCoffsets(x) {
  if (!x) return 'Z';
  let s = x < 0 && 'UTC-' || 'UTC+';
  if (x < 0) x = -x;
  return s + xx(x / 100) + xx(x % 100);
}

function xx(x) {
  return (x < 10 && '0' || '') + x.toString();
}

function assert(t) {
  if (t.hour > 23 || t.minute > 59 || t.month > 12 ||
    !t.month && t.day) return null;

  if (t.second === 60) {
    // or (Y<<9)+(M<5)+D
    let x = t.year * 10000 + t.month * 100 + t.day;
    if (x > EXPIRESDAY) throw new Error(EXPIRED);

    if (t.hour != 23 || t.minute != 59 || t.day > 31 || LEEPSECOND.indexOf(x) < 0)
      return null;
  }else if (t.second > 59) return null;

  if (t.month === 2) {
    if (t.day < 29) return t;
    if (t.day > 29 || !t.year) return null;

    // See: https://en.wikipedia.org/wiki/Talk%3ALeap_year
    let x = t.year;
    return x & 3 || x % 100 === 0 && x % 400 || x % 3200 === 0 ? null : t;
  }

  if (t.month < 8)
    return t.day <= 30 + (t.month & 1) && t || null;
  return t.day <= 31 - (t.month & 1) && t || null;
}

function nanoSeconds(s) {
  return parseInt((s + '000000000').substring(0, 9));
}

class Parser {
  constructor(layout) {
    let m = layout.match(/^\d+/);
    this.offset = 0;
    this.since = m ? parseInt(m[0]) * 100 : 0;
    if (m) layout = layout.slice(m[0].length);

    m = layout.match(/[+-]\d{4}$/);
    if (m) {
      this.offset = offset(m[0]);
      layout = layout.slice(0, m.index);
    }

    this.layout = '';
    let flag = 0;
    for (let i = 0 ; i < layout.length; i++) {
      let s = layout[i],
          x = 'YMDhms'.indexOf(s);
      if (x === -1) continue;
      if (this.layout.indexOf(s) !== -1)
        throw Error('Duplicate layout: ' + layout);
      this.layout += s;
      flag += x < 3 ? 10 : 1;
    }
    this.flag = (flag >= 10 ? '' : '0') + flag.toString();
  }

  normalize(timeString, t) {
    let i,m;

    if (WEEKDAY.indexOf(timeString.substring(0, 3).toLowerCase()) !== -1) {
      m = timeString.match(/^[A-Za-z]+\s*,?\s*/);
      timeString = timeString.substring(m[0].length);
    }

    m = timeString
      .match(/(GMT|UTC|Z)([+-]?)(\d{0,2})(:?)(\d{0,2})/);
    i = m && 1 || 0;
    if (!i) {
      m = timeString.match(/([+-])(\d{1,2})(:?)(\d{0,2})$/);
      // Exclude: Feb-2018, Feb-28-2018, 28-Feb-2018, 28-02-2018, -69
      if (m && m[1] === '-' && !m[3]) {
        let x = timeString.substring(0, m.index).match(/(\d+|[A-Za-z]+)$/);
        if (!m.index || x && (x.index === 0 || timeString[x.index - 1] === '-'))
          m = null;
      }
    }

    if (m && m[0].endsWith(':')) return '';

    if (!m)
      t.offset = this.offset;
    else {
      t.offset = 100 * parseInt(m[i + 2] || '0') + parseInt(m[i + 4] || '0');
      if (m[i + 1] === '-') t.offset = -t.offset;
      if(invalidOffset(t.offset)) return '';
      timeString = trim(timeString, m.index, m[0].length);
    }

    i = timeString.indexOf('LSC');
    if (i !== -1) {
      t.lsc = true;
      timeString = trim(timeString, i, 3);
    }

    m = timeString.match(/(DST|T)\d/);
    if (m) {
      t.dst = m[1].length === 3;
      timeString = trim(timeString, m.index, m[1].length);
    }

    m = timeString.match(/\.\d{3,9}/);
    if (m) {
      t.nanosecond = nanoSeconds(m[0].substring(1));
      timeString = trim(timeString, m.index, m[0].length);
    }
    return timeString.trimRight();
  }

  parse(timeString) {
    let
      t = new Time(),
      layout = this.layout,
      normal = this.normalize(timeString, t),
      bc = normal.startsWith('-') || normal.startsWith('BC'),
      seq = normal.split(/[^\dA-Za-z]+/),
      form;

    if (bc) seq.shift();

    form = seq.reduce(function(sum, s) {
      return sum + (s[0] > '9' ? 'M' : s.length <= 2 && 2 ||
      s.length <= 14 && s.length || '?');
    }, '');

    if (!form || form.length > 6) return null;

    if (!layout)
      layout = STYLES[form] || '';

    if (bc && layout && layout[0] !== 'Y') return null;

    if (layout && layout.length !== form.length && form.length > 2) {
      let
        i = form.indexOf('8') + 1 || form.indexOf('6') + 1,
        x = seq[--i];
      if (x && layout.search(/[YMD]{3}/, i) === i) {
        seq = [x.slice(0, -4), x.slice(-4, -2), x.slice(-2)]
          .concat(seq.slice(0, i)).concat(seq.slice(i + 1));
        layout = layout.slice(i, i + 3) + layout.slice(0, i) + layout.slice(i + 3);
        form = layout;
      }
    }

    if (layout.length !== form.length) {

      layout = layout || 'YMDhms';
      let x = seq[0], b = 4,i = layout.search(/[YMD]{3}/);

      if (i === -1) return null;

      if (i)
        layout = layout.slice(i, i + 3) +
          layout.slice(0, i) + layout.slice(i + 3);

      if (form === '86' || form === '66') {
        b = form === '66' && 2 || 4;
        x += seq[1];
        seq.pop();
        // form = '422222';
      }else if (form === '68') {
        x = seq[1] + x;
        seq.shift();
        // form = '422222';
      }else if (form === '12') {
        b = 2;
        // form = '222222';
      }else if (form !== '14')
        return null;
      // else form = '422222';

      for (let i = b; i < x.length; i += 2)
        seq.push(x.slice(i, i + 2));
      seq[0] = x.slice(0, b);
    }

    let since = bc ? 0 : this.since;

    for (let i = 0; i < seq.length; i++)
      if (!assign(layout[i], seq[i], t, since))
        return null;
    if (bc) t.year = -t.year;
    return assert(t);
  }
}

function trim(s, b, len) {
  return s.substring(0, b) + ' ' + s.substring(b + len);
}

function assign(k, x, t, since) {
  let v;
  if (x[0] <= '9')
    v = parseInt(x);
  else {
    v = MONTH.indexOf(x.substring(0, 3).toLowerCase()) + 1;
    if (!v || k !== 'M') return false;
  }

  switch (k) {
    case 'Y':
      t.year = v + (x.length === 2 ? since : 0);
      break;
    case 'M':
      t.month = v;
      break;
    case 'D':
      t.day = v;
      break;
    case 'h':
      t.hour = v;
      break;
    case 'm':
      t.minute = v;
      break;
    case 's':
      t.second = v;
      break;
    default:
      return false;
  }
  return true;
}

let parser = new Parser('');

exports.Parser = Parser;

exports.parse = function(timeString) {
  return parser.parse(timeString);
};

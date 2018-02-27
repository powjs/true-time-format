# True-Time-Format

Smart parsing date and time format for true time.

Support:

1. The default hundred years value
1. Daylight Saving Time
1. Nanoseconds
1. Leap second

## Install

```
$ yarn add true-time-format
```

## Usage

```js
let time = require('true-time-format');

// for normal datetime string
time.parse('Monday, 02-Jan-06 15:04:05');
time.parse('2006-01-02');
time.parse('02-Jan-2006T15:04:05.999 UTC-0700');

// DST means Daylight Saving Time
// LSC means expecting to consider leap second effects in time calculations
time.parse('02 Jan DST15:04:05.999LSC 2006');

// customize
let parser = new time.Parser('20DYM+0800');

parser.parse('281802');

parser.parse('28 2018 Feb UTC+08:00');
parser.parse('28 2018 Feb GMT+0800');
parser.parse('28-18-02Z+0800');
```

## Layout

The layout argument for un-normal datetime string only.

The layout:

   20-0700

Means:

1. If you match a two-digit year, it represents `20xx` years
1. If the data does not contain UTC offset, use `UTC-0700`

### The default hundred years value

The layout optional number prefix represents the default hundred years value,
such as `19` which means `19xx` if it matches a two-digit year.

### Y

Represents the year.

### M

Represents the month, digits or month word.

### D

Represents the day.

### h

Represents the hour.

### m

Represents the minute.

### s

Represents the second and dot nanosecond.

### UTC offsets

The layout optional suffix `+hhmm` or` -hhmm` means
the default UTC offset, default is `+0000`.


## License

BSD 2-Clause License

Copyright (c) 2018, YU HengChun <achun.shx@qq.com>
All rights reserved.

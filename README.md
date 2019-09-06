# JCron
**Client-Server Synchronisation  for Static Sites with Changing Data, © 2018 Libor Spacek.**  
**Please send bitcoin donations to: 1FEW1E1bXjc6f1bQKdbxpPpTeYvxiLwTLN**

Licence: BSD-3-Clause  

#### Description

**This model is applicable to all web publishing situations where data is being updated globally, without input from individual clients. Thus frequently changing data can be served on static sites in simple and efficient way.**

These few lines of Javascript synchronise all clients in real time with server updates. This avoids lots of load, programming, databases, etc. on the server side and achieves the benefits of static site even for time sensitive, frequently updated data. 

Webpage deploying this script will display cascading countdown clock with time remaining till the next reload: first it counts down only hours, then only minutes and finally only seconds, thus alerting the clients without being boring. The cascading also puts minimal load on the client's browser.

All global clients reload the new data at the same time, as soon as it is published, without the server having to send them any explicit 'server-side events alerts'. It works regardless of any obscure client and server timezones and summertimes, even ones with fractional hours, as in South Australia. The reloads are synchronised and performed repeatedly at specified UTC times:

Daily: `hourset(0-23):minset(0-59)+n*mingap(0-59):serverdelay(0-59)`  
Hourly: `24:minset(0-59):serverdelay(0-59)`  
Every few minutes: `24:minset+n*mingap(0-59):serverdelay(0-59)`

`TZ=UTC` should be the first line of the server's crontab, otherwise some clients might get out of step with cron's clock. This is mandatory especially if the server runs on some local timezone or daylight saving time (using settimers.sh takes care of this).

#### Files

**timer.js** script is to be deployed with the server crontab. It is assumed that crontab fires up some scripts that are updating website contents at those same set  times. The timer.js script needs the above four timing constants to be manually set in its source file in concert with the crontab time settings. Do not forget to reset crontab with `crontab -r` when stopping operations.

**stubtimer.js** and **settimers** are provided for advanced use. The bash shell constructs programmatically **dtimer.js** (short for dynamic timer) from stubtimer.js and supplied timing parameters. At the same time it sets up the crontab. This achieves the following objectives:

- avoidance of errors in the manual setting of the parameters.
- prevention of unintended mismatches with crontab. 
- minimal human intervention.
- automated updating of several websites at different times.
- ability to change the timings programmatically.
- HTML agnostic, i.e. html file(s) are untouched.
- minimal knowledge of crontab needed.

#### Usage

Set the four constants at the top of `timer.js` to synchronise with  crontab (settimers.sh takes care of this). See an example below. 

- `hourset` set to one of 0-23 will perform reload(s) just during that one hour each day, at `hourset : minset+n*mingap : serverdelay` UTC time.
- `hourset` as any other number, typically 24, causes reloads at all hours at  `minset+n*mingap : serverdelay` minutes and seconds past each UTC  hour.
- `mingap` (gap between reloads in minutes) can be set to one of 1..59. This  activates repeated reloads at mingap minutes intervals, starting at minset minutes past the hour. When mingap is set to zero, there is just one reload at minset minutes past the hour.
- `serverdelay` is to be set in all cases to the required number of seconds that the server will need to do its work before the clients start downloading. It's value can be estimated  from the logs of your server update script. Allow a few extra seconds for a margin of error if your server has to wait for some  unpredictable  downloads of new data. When `serverdelay` is set too short, the clients will not get to see the latest data refreshed immediately.

When the time is up, the clients' windows are reloaded with forced read directly from the server.
Visitors returning to your site later may have to manually reload their cache to catch up with the server update(s) that may have happened while they were away. Similarly,  if your server exceeds its allocated server delay.

#### Deployment in HTML
- Clone or download the JCron directory to your www directory.
- Edit the four constants in timer.js, as described above.
- Put `<script src="JCron/timer.js"></script>` somewhere in your html  header. 
- Alternatively, use the dynamic version  `<script src="JCron/dtimer.js"></script>` and supply the four constants, plus the script to be fired up by crontab, as arguments to settimers.sh.
- Change the html `<body>` tag to: `<body onload="timermod.start();">` not forgetting the quotes! 
- Countdown clock is diplayed in `<span id="countdown"></span>` or any other tag with `id="countdown"`. It can be put anywhere convenient within your html page and formatted with CSS as desired. See an example application in [tipbot.com](https://tipbot.com/index.html).

#### Release Notes
- 11th April 2019
Added the dynamic version. 
Expanded functionality to allow mingap reloads also during the one specified hourset hour.
Mingap must be one of 1..59 to activate frequent reloads.
Changed `hourset` setting for 'all hours' from "*" to 24. Specific hour will now be set only with one of 0..23.

- 21st January 2019
Added the functionality of being able to run the regular 'mingap' reloads starting from 'minset', rather than starting always from 0 minutes (whole hours).

#### Example

These settings in timer.js will reload all clients four seconds past each of: 5,15,25,35,45,55 minutes past each hour:
> const hourset = 24;
const minset = 5;
const mingap = 10;
const serverdelay = 4;

The corresponding dtimer.js gets constructed invoking:

`settimers.sh 24 5 10 4 "bin/webpage-update.sh >> logfile.log 2>&1"`

The corresponding crontab entries will be:

`TZ=UTC`  
`5-59/10 * * * * bin/webpage-update.sh >> logfile.log 2>&1`

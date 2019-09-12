# JCron
**Client-Server Synchronisation  for Static Sites with Changing Data  
Wednesday, 11. September 2019, © 2018,2019 Libor Spacek.**  

Licence: BSD-3-Clause  

#### Description

*This model is applicable to all (static) web publishing situations where global data is being updated frequently and modifications to suit individual clients are not necessary. Thus frequently changing data can be served on static sites in a very simple and efficient way.*

A few lines of JCron Javascript synchronise all clients in real time with server
updates. This avoids unnecessary load, programming, databases, etc. on the 
server side and achieves the benefits of a static site even for time sensitive,
frequently changing data. 

Webpages deploying this script will display cascading countdown clock with time remaining till the next reload: first it counts down only hours, then only minutes and finally only seconds, thus alerting the clients without being boring. The cascading also puts minimal load on the client's browser.

All global clients reload the new data at the same time, soon after it is published, without the server having to send them any explicit 'server-side events'. It works regardless of any obscure client and server timezones and summertimes, even ones with fractional hours, as in South Australia. The reloads are synchronised and performed repeatedly at specified UTC times:

Daily: `hourset(0-23):minset(0-59)+n*mingap(0-59):serverdelay(0-59)`  
Hourly: `24:minset(0-59):serverdelay(0-59)`  
Every few minutes: `24:minset+n*mingap(0-59):serverdelay(0-59)`

`TZ=UTC` should be the first line of any server's crontab, otherwise some clients may get out of step with cron's clock. This is mandatory especially if the server runs on some local timezone or daylight saving time (using included settimers script takes care of this).

#### Files

**timer.js** script is to be deployed with the server's `crontab`. It is assumed that crontab fires up some scripts that are updating the website contents at those same set times. 
The above four timing constants should be manually set at the top of the javascript source file in concert with the crontab time settings. Remember to reset crontab with `crontab -r` when stopping operations.

**stubtimer.js** and **settimers** are provided for advanced use. 
The bash script `settimers` constructs programmatically **dtimer.js** (short for dynamic timer)
from `stubtimer.js` and supplied timing parameters. At the same time it sets up the crontab. This achieves the following objectives:

- avoidance of errors in the manual setting of the parameters.
- prevention of unintended mismatches with crontab. 
- minimal human intervention.
- automated updating of several websites at different times.
- ability to change the timings programmatically.
- HTML agnostic, i.e. html file(s) are untouched.
- knowledge of crontab not required. 


#### Usage

Set the four constants at the top of `timer.js` to synchronise with  `crontab`.
Using `settimers` takes care of this automatically. See an example below. 

- **hourset** set to one of 0-23 performs reload(s) just during *the specified hour* each day, at `hourset : minset+n*mingap : serverdelay` UTC time. Any other value, typically 24, activates reloads in the same way but after *each* UTC  hour.
- **mingap** (gap between reloads in minutes) can be set to one of 1..59. This  activates repeated reloads at mingap minutes intervals, starting at **minset** minutes past the hour. When mingap is set to zero, there is just one reload at minset minutes past the hour.
- **serverdelay** is to be set in all cases to the required number of seconds that the server will need to do its work before the clients start downloading. Its value can be estimated  from the logs of the  server by applying the `time` command. Allow a few extra seconds for a margin of error if your server has to wait for some  unpredictable  http downloads of new data. When serverdelay is set too short, the clients will not get to see the latest data refreshed immediately and may have to refresh their page manually.

Note: when the time is up, the clients' pages get automatically reloaded with a read directly from the server. Visitors returning to the site after the reload has just taken place may have to wait until the next reload. They can of course reload manually to catch up with the server update(s) that may have happened while they were away. This is assentially the same situation as described above, when the server exceeds its allocated server delay and so the clients reload just a little too soon. 

ToDo: fix this by refreshing the cache?

#### Deployment in HTML
- Clone or download the JCron directory to your www directory.
- Edit the four constants in timer.js, as described above.
- Put `<script src="JCron/timer.js"></script>` somewhere in your html  header. 
- Alternatively, use the dynamic version  `<script src="JCron/dtimer.js"></script>` and supply the four constants, plus the script to be fired up by crontab, as arguments to `settimers`. Change the html `<body>` tag to: `<body onload="timermod.start();">` not forgetting the punctuation! 
- Countdown clock is diplayed in `<span id="countdown"></span>` or any other tag with `id="countdown"`. It can be put anywhere convenient within your html page and formatted with CSS as desired. See an example application in [tipbot.com](https://tipbot.com/index.html).

#### Release Notes

- 12th September 2019 improved this README.md file and started pushing through git.

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

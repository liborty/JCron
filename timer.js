// Timer.js © 2018 Libor Spacek
// Licence: BSD-3-Clause
// Website: tipbot.com
// Send bitcoin contributions to: 1FEW1E1bXjc6f1bQKdbxpPpTeYvxiLwTLN
// *****************************************************************************
// For more details, see JCron/README.md
/*jshint esversion: 6*/
var timermod = ( function() { // this closure is just to keep the globals safe
// *****************************************************************************
// change only the following four constants:
const hourset = 24; // hourset = "*" means repeat at all hours
const minset = 0; // reloads at minset minutes past the hour (0-59) 
const mingap = 6; // gap in minutes between reloads, should be a factor of 60
const serverdelay = 3; // seconds for the server to create new html (0-59)
// *****************************************************************************
// relative times in milliseconds
const day = 86400000;
const hour = 3600000; 
const minute = 60000; 
const second =  1000;
// *****************************************************************************
let clock;	// timeout process to kill
let thenms;
// *****************************************************************************
// showTime() runs periodically until the clock runs out ( reaches thenms )
// then reloads client's window and stops until new activation from
// start: by new html file (via cron) 
function showTime() {
   var current = new Date(); // absolute time now in UTC milliseconds since 1970
   var mstogo = thenms - current.getTime(); // milliseconds to go
   if (mstogo < second) // time is up completely, termination condition
      {  clearTimeout(clock); // stop the clock
         window.location.reload(true); //<===== reload client's page here, now!
         return true;  }
   var gap = hour;  // default time between checks, an hour to start with
   // the cascading gap may be shortened below, from  hours->minutes->seconds 
   var timestr = " hours"; // construct the diplay message string
   if ( mstogo < hour ) { timestr = " minutes"; gap = minute; }
   if ( mstogo < minute ) { timestr = " seconds"; gap = second; }
	document.getElementById('countdown').innerHTML = Math.ceil(mstogo/gap) + timestr;
	clearTimeout(clock); // stop the clock 
 	clock = setTimeout(showTime, gap); // gets called again after (new) gap time
   return(true);
}
// the envelope closure "timermod" returns this closure, which gets executed by
// html call onload="timermod.start();"
return { 
   start: function() {
	   let dt = new Date(); // absolute time now in UTC milliseconds since 1970
      let nowms = dt.getTime();
      let nowhour = dt.getUTCHours();
      if (hourset >= 0 && hourset < 24) { dt.setUTCHours(hourset); } // hours
  		dt.setUTCMinutes(minset); // set minutes past the hour
  		dt.setUTCSeconds(serverdelay); // add seconds for server in every case
      thenms = dt.getTime(); // absolute time in ms @ reload 
		// find the correct next time to run down to
		if ( hourset >= 0 && hourset < 24 && nowhour > hourset ) { // over the hour
			 thenms += day; }
		while (( nowms - thenms ) > 0) { 
			if ( mingap == 0 ) { thenms += hour; } // over the minset, zero mingap
		   else { thenms += mingap*minute; } // find the next mingap
		   } 
	   showTime(); 
      return true; } // end of 'start' closure
 }; // return
})(); // envelope module

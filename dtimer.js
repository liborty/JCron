var timermod = ( function( hourset = 24, minset = 3, mingap = 5, serverdelay = 3)
// var timermod = ( function( hourset = -1, minset = 3, mingap = 6, serverdelay = 3)
{ // to activate, uncomment or prepend the previous line with desired parameters
// *****************************************************************************
// dtimer.js © 2018 Libor Spacek
// Licence: BSD-3-Clause
// Website: tipbot.com
// Send bitcoin contributions to: 1FEW1E1bXjc6f1bQKdbxpPpTeYvxiLwTLN	
// *****************************************************************************
// For more details, see README.md
/*jshint esversion: 6*/
const day = 86400000; // relative times in milliseconds
const hour = 3600000; 
const minute = 60000; 
const second =  1000;

let clock;	// timeout process to kill
let thenms;

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
	   let load = new Date(); // absolute time now in UTC milliseconds since 1970
      let nowms = load.getTime(); 
      let reloadgap = hour;		 // default reloads gap
  		load.setUTCMinutes(minset); // set minutes past the hour
  		load.setUTCSeconds(serverdelay); // add seconds for server in every case
      if (hourset >= 0 && hourset < 24)	{
			load.setUTCHours(hourset); // set reload at hourset on the clock
			reloadgap = day; } // when hourset are specified, runs only once a day
		else if (mingap > 0) { reloadgap = mingap*minute; }
      thenms = load.getTime(); // absolute time in ms @ reload
      while (nowms > thenms) thenms += reloadgap; // find the next time
      // showTime() countdown clock will run periodically until the clock runs out,
      // then it reloads cient's page.
      showTime(); 
      return true; } // end of 'start' closure
 }; // return
})(); // envelope module

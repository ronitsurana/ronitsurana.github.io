# ronitsurana.github.io
ClockCraft

**--Overview--**

  This JavaScript code creates a clock application that allows users to create and customize multiple clocks on a webpage. The clocks display the current time in different time zones and provide additional 
  features such as setting a background image, changing the clock color, and using a stopwatch.

**--Features--**

  Clock Creation: Users can create multiple clocks on the webpage, each displaying the current time in a specific time zone.
  
  Styling with Bootstrap: The application uses Bootstrap for styling, providing a responsive and visually appealing interface.
  
  Clock Customization: Users can customize each clock by changing its color, setting a background image, and choosing a time zone.
  
  Timer and Stopwatch: The application includes a timer and stopwatch functionality, allowing users to set countdown timers and measure elapsed time.
  
  Picture-in-Picture (PiP): Users can enable Picture-in-Picture mode for a clock, allowing it to be displayed in a separate window.

**--Usage--**

  Creating Clocks
  To create a clock, add a <div> element with the data-value attribute set to "clock" to your HTML file. The script will automatically detect and initialize clocks within these div elements.

**--HTML Code--**

  <div data-value="clock"></div>
  
**--Customizing Clocks--**

  Color: Click on the clock to open the configuration menu. Change the clock color using the color picker and click "Apply."

  Background Image: Choose an image file using the file input and click "Apply" to set it as the background for the clock.

  Time Zone: Select a time zone from the dropdown menu and click "Apply" to change the displayed time zone.

**--Timer and Stopwatch--**

  Timer: Click the "Timer" button to set a countdown timer. Enter the desired hours, minutes, and seconds.

  Second Timer: Click the "Second Timer" button to set a countdown timer in seconds.

  Stopwatch: Click the "StopWatch" button to start or stop the stopwatch. The elapsed time will be displayed, and you can reset it by clicking the button again.

**--Picture-in-Picture (PiP)--**

  Click the "PiP" button to open the clock in Picture-in-Picture mode. Note that not all browsers may support this feature, it is tested on Chrome Version 119.0.6045.199 on desktop.
  Future builds may enable the PiP feature for other browsers and mobile browsers.
  
**--Additional Configuration--**

  Remove Background Image: Click the "Remove" button to remove the background image.
  
**--Styling--**

  The application uses Bootstrap for styling. You can customize the appearance further by modifying the Bootstrap stylesheet link or by adding your own styles.

**--Dependencies--**

  Bootstrap: The application uses Bootstrap for styling. Make sure you have an internet connection to load Bootstrap from CDN.

  Colors.js: The application uses Colors.js for color manipulation. The script includes a CDN link to load this library.

**--License--**

  This clock application is open-source and available under the MIT License.

**--Acknowledgments--**

  Special thanks to the developers of Bootstrap and Colors.js for providing the tools used in this project.

**--Author--**

  Ronit Surana
	
  ronitsurana1819@gmail.com

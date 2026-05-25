# Quest Schedule Exporter

A lightweight and fast web application designed for University of Waterloo students to instantly convert their Quest class schedules into a universal `.ics` calendar file to Google Calendar, Apple Calendar, or Outlook.

Check out the live website here: <a href="https://yinol1.github.io/schedule-exporter/" target="_blank">Quest Schedule Exporter</a> 

## ✨ Features
* **100% Private:** Your data never leaves your computer. All parsing and processing happen locally inside your web browser (no databases, no analytics, no external servers).
* **Phantom-Class Protection:** Automatically detects the correct first day of classes for individual courses, preventing generic "term start date" calendar clutter.
* **Full Term Integration:** Implements strict RFC 5545 calendar specifications, therefore fully compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.


## 🛠️ How to Use

1. **Log into Quest:** Go to the University of Waterloo Quest portal and navigate to your **Class Schedule**.
2. **Switch to List View:** Ensure your schedule is toggled to the **List View** format for the current term.
3. **Copy everything:** Press `Ctrl + A` (or `Cmd + A` on Mac) and copy the entire page's raw text.
4. **Paste and Convert:** Paste the text directly into the input box on the website and click **Download .ics File**.
5. **Import:** Drag and drop the downloaded file directly into your calendar application of choice.

### P.S.

The Quest Schedule Exporter that I originally used on UW Flow did not work (May 2025). So why not I make my own :)

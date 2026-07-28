function generateICS(rawInput) {
    // Converting Quest Date Time Format into .ics
    function formatDateTime(dateStr, timeStr) {
        timeStr = timeStr.replace(/\s+/g, '');
        const [year, month, day] = dateStr.split('/');

        let [time, modifier] = [timeStr.slice(0,-2), timeStr.slice(-2)];
        let [hour, minute] = time.split(':');
        
        if (hour === '12') {
            hour = modifier === 'PM' ? '12' : '00';
        }
        else if (modifier === 'PM') {
            hour = parseInt(hour, 10) + 12;
        }

        return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}${minute.padStart(2, '0')}00`;
    }

    function normalizeDaysString(daysString) {
        return daysString
            .replace(/Su/gi, 'su,')
            .replace(/Sa/gi, 'sa,')
            .replace(/Th/gi, 'th,')
            .replace(/T(?!h)/gi, 'tu,')
            .replace(/W/gi, 'we,')
            .replace(/F/gi, 'fr,')
            .replace(/M/g, 'mo,')
            .toUpperCase()
            .replace(/,+/g, ',')
            .replace(/^,|,$/g, '');
    }

    const now = new Date();
    const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    rawInput = rawInput.replace(/\t/g, '\n').replace(/[–—]/g, '-');
    const lines = rawInput.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    // Initiate .ics Content
let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Quest Schedule Exporter//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VTIMEZONE",
        "TZID:America/Toronto",
        "BEGIN:DAYLIGHT",
        "TZOFFSETFROM:-0500",
        "TZOFFSETTO:-0400",
        "DTSTART:19700308T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
        "TZNAME:EDT",
        "END:DAYLIGHT",
        "BEGIN:STANDARD",
        "TZOFFSETFROM:-0400",
        "TZOFFSETTO:-0500",
        "DTSTART:19701101T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
        "TZNAME:EST",
        "END:STANDARD",
        "END:VTIMEZONE"
    ];

    let currentCourseTitle = "Unknown";
    let currentComponent = "";
    let currentTime = "";
    let currentRoom = "";
    let expectRoom = false;

    // Searching and Extracting Schedule Information
    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        if (expectRoom) {
            currentRoom = trimmedLine;
            expectRoom = false;
            return;
        }

        const dateMatch = trimmedLine.match(/(\d{4}\/\d{1,2}\/\d{1,2})\s*-\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
        if (dateMatch) {
            const currentTimeUpper = currentTime.toUpperCase();
            if (currentTimeUpper.includes("TBA") || trimmedLine.toUpperCase().includes("TBA")) return;

            const timeParts = currentTime.split(' ');
            if (timeParts.length < 2) return;

            const daysString = timeParts[0];
            const timeRange = currentTime.replace(daysString, '').trim();
            const timeSplit = timeRange.split(/\s*-\s*/);
            if (timeSplit.length < 2) return;
            const [startTimeStr, endTimeStr] = timeSplit;

            const startDateStr = dateMatch[1];
            const endDateStr = dateMatch[2];

            const rruleDays = normalizeDaysString(daysString);
            if (!rruleDays) return;

            const [sYear, sMonth, sDay] = startDateStr.split('/');
            let actualStartObj = new Date(sYear, sMonth - 1, sDay);
            const dayMap = {"SU":0, "MO":1, "TU":2, "WE":3, "TH":4, "FR":5, "SA":6};
            const allowedDays = rruleDays.split(',').map(d => dayMap[d]).filter(d => d !== undefined);
            if (!allowedDays.length) return;

            let loopGuard = 0;
            while (!allowedDays.includes(actualStartObj.getDay()) && loopGuard < 7) {
                actualStartObj.setDate(actualStartObj.getDate() + 1);
                loopGuard++;
            }

            const safeStartYear = actualStartObj.getFullYear();
            const safeStartMonth = String(actualStartObj.getMonth() + 1).padStart(2, '0');
            const safeStartDay = String(actualStartObj.getDate()).padStart(2, '0');
            const safeStartDateStr = `${safeStartYear}/${safeStartMonth}/${safeStartDay}`;

            const dtStart = formatDateTime(safeStartDateStr, startTimeStr);
            const dtEnd = formatDateTime(safeStartDateStr, endTimeStr);

            const [eYear, eMonth, eDay] = endDateStr.split('/');
            const endObj = new Date(eYear, eMonth - 1, eDay);
            endObj.setDate(endObj.getDate() + 1);

            const safeYear = endObj.getFullYear();
            const safeMonth = String(endObj.getMonth() + 1).padStart(2, '0');
            const safeDay = String(endObj.getDate()).padStart(2, '0');
            const rruleUntil = `${safeYear}${safeMonth}${safeDay}T040000Z`;

            const safeTitle = currentCourseTitle.replace(/\s+/g, '');
            const randomString = Math.random().toString(36).substring(2, 10);
            const uid = `${dtStart}-${safeTitle}-${randomString}@questexporter.com`;

            const eventBlock = [
                "BEGIN:VEVENT",
                `UID:${uid}`,
                `DTSTAMP:${dtStamp}`,
                `SUMMARY:${currentCourseTitle} (${currentComponent})`,
                `LOCATION:${currentRoom}`,
                `DTSTART;TZID=America/Toronto:${dtStart}`,
                `DTEND;TZID=America/Toronto:${dtEnd}`,
                `RRULE:FREQ=WEEKLY;UNTIL=${rruleUntil};BYDAY=${rruleDays}`,
                "END:VEVENT"
            ].join('\r\n');

            icsContent.push(eventBlock);
            return;
        }

        const isCourseTitleLine = trimmedLine.includes(' - ') && !trimmedLine.includes(':') && !/\b(?:AM|PM)\b/i.test(trimmedLine) && !/^\d{4}\/\d{1,2}\/\d{1,2}/.test(trimmedLine);
        if (isCourseTitleLine) {
            currentCourseTitle = trimmedLine.split(' - ')[0].trim();
            return;
        }

        if (["LEC", "TUT", "LAB", "TST", "SEM"].includes(trimmedLine.toUpperCase())) {
            currentComponent = trimmedLine;
            return;
        }

        if (/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i.test(trimmedLine)) {
            currentTime = trimmedLine;
            expectRoom = true;
            return;
        }
    });

    icsContent.push("END:VCALENDAR");

    return icsContent.join('\r\n');
}
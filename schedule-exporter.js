(function main() {
    // Converting Quest Date Time Format into .ics
    function formatDateTime(dateStr, timeStr) {
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

    // Paste and Slice into Lines
    const rawInput = prompt("Copy and Paste the entire 'List View' page under 'Class Schedule' in Quest here:");
    if (!rawInput) {
        alert("No text detected. Exiting program.");
        return;
    }

    const lines = rawInput.split('\n');

    // Initiate .ics Content
    let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Quest Schedule Exporter//EN",
        "CALSCALE:GREGORIAN"
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

        if (trimmedLine.includes(' - ') && !trimmedLine.includes(':') && !trimmedLine.includes('AM') && !trimmedLine.includes('PM')) {
            currentCourseTitle = trimmedLine.split(' - ')[0].trim();
        }
        else if (["LEC", "TUT", "LAB", "TST", "SEM"].includes(trimmedLine)) {
            currentComponent = trimmedLine;
        }
        else if ((trimmedLine.includes('AM') || trimmedLine.includes('PM')) && trimmedLine.includes(':')) {
            currentTime = trimmedLine;
            expectRoom = true;
        }
        else if(/\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}/.test(trimmedLine)) {
            const dates = trimmedLine;
            if (currentTime.includes("TBA") || dates.includes("TBA")) return;
        }
    })

})();
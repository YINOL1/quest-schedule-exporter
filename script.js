document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('questInputArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Download
    downloadBtn.addEventListener('click', () => {
        const rawText = inputArea.value;
        
        if (rawText.trim() === "") {
            alert("Please paste your schedule first!");
            return;
        }

        const finalICSString = generateICS(rawText);

        if (!/BEGIN:VEVENT/.test(finalICSString)) {
            alert('No calendar events were detected. Please paste the full Quest list view schedule exactly as shown in the List View.');
            return;
        }

        const blob = new Blob([finalICSString], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Quest_Schedule.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Clear
    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        inputArea.focus();
    });
});
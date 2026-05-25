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

        const blob = new Blob([finalICSString], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Quest_Schedule.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Clear
    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        inputArea.focus();
    });
});
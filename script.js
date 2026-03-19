// Wait for the entire page to load before running our code
document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('fuelForm');

    // Make sure the form actually exists
    if (!form) {
        console.error("Could not find the fuelForm in the HTML.");
        return;
    }

    form.addEventListener('submit', function(e) {
        // THIS is the magic line that stops the page reload!
        e.preventDefault(); 
        
        console.log("JavaScript intercepted the form submission!"); // Test message

        const plateInput = document.getElementById('plateNumber').value.trim();
        const limitReached = document.getElementById('limitYes').checked;
        const resultDiv = document.getElementById('result');

        // 1. Extract the last digit of the number plate
        const match = plateInput.match(/\d/g);
        if (!match) {
            showResult("Invalid Input", "Please enter a valid number plate containing numbers.", "danger-text");
            return;
        }
        const lastDigit = parseInt(match[match.length - 1]);
        const isPlateEven = (lastDigit % 2 === 0);

        // 2. Setup current date (reset time to midnight for accurate day math)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let nextDate = new Date(today);

        // 3. Logic: If weekly limit IS reached
        if (limitReached) {
            // Find how many days until the NEXT Saturday
            let daysUntilSat = 6 - today.getDay(); 
            
            // If today is Saturday (0 days until Sat) AND they reached the limit, 
            // it means they reached it today. The next reset is in 7 days.
            if (daysUntilSat === 0) daysUntilSat = 7; 
            
            nextDate.setDate(today.getDate() + daysUntilSat);

            // Now we are at the reset Saturday. Is this date matching their plate?
            // Use a while loop just in case (handles month-end edge cases)
            while ((nextDate.getDate() % 2 === 0) !== isPlateEven) {
                nextDate.setDate(nextDate.getDate() + 1);
            }

            showResult(
                "Weekly Limit Reached", 
                `Your limit resets on Saturday.<br><strong class="warning-text">Next eligible date:<br>${formatDate(nextDate)}</strong>`, 
                ""
            );

        // 4. Logic: If weekly limit is NOT reached
        } else {
            const isTodayEven = (today.getDate() % 2 === 0);

            if (isPlateEven === isTodayEven) {
                // Eligible today!
                showResult(
                    "Clear to go!", 
                    `<strong class="success-text">You can refuel TODAY!</strong>`, 
                    ""
                );
            } else {
                // Not eligible today, start checking from tomorrow
                nextDate.setDate(today.getDate() + 1);
                
                while ((nextDate.getDate() % 2 === 0) !== isPlateEven) {
                    nextDate.setDate(nextDate.getDate() + 1);
                }

                showResult(
                    "Not eligible today", 
                    `Odd/Even mismatch.<br><strong class="warning-text">Next eligible date:<br>${formatDate(nextDate)}</strong>`, 
                    ""
                );
            }
        }
    });
});

// Helper function to show results
function showResult(title, message, className) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<h3>${title}</h3><div class="${className}">${message}</div>`;
}

// Helper function to format the date nicely
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

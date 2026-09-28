import React, { useState } from 'react';
import axios from 'axios';

export default function TimesheetForm() {
    const [hours, setHours] = useState(0);
    const [date, setDate] = useState('');

    const submitTimesheet = async () => {
        await axios.post('https://localhost:5001/api/timesheets', { date, hours });
        alert('Timesheet submitted!');
    };

    return (
        <div>
            <h2>Submit Timesheet</h2>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} />
            <button onClick={submitTimesheet}>Submit</button>
        </div>
    );
}

const getCurrentDate = (date = null) => {
    // Get current UTC time or parsed date in UTC
    const baseDate = date ? new Date(date) : new Date();

    // Convert to Myanmar time (Asia/Yangon, UTC+6:30)
    const myanmarTime = new Date(baseDate.toLocaleString('en-US', { timeZone: 'Asia/Yangon' }));

    const dd = String(myanmarTime.getDate()).padStart(2, '0');
    const MM = String(myanmarTime.getMonth() + 1).padStart(2, '0');
    const YYYY = myanmarTime.getFullYear();

    const currentDate = `${dd}${MM}${YYYY}`;
    console.log("current date", currentDate);
    return currentDate;
};

module.exports = {
    getCurrentDate
};

export function formatMessageTime(rawDate) {
    const date = new Date(rawDate);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    return date.toLocaleTimeString('en-US', options);
}

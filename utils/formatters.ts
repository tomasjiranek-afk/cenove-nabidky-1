export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString; // return original string if invalid
        }
        return new Intl.DateTimeFormat('cs-CZ').format(date);
    } catch (e) {
        return dateString; // return original string on error
    }
}

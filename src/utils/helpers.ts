export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const getTodayDateString = (): string => {
    const date = new Date();
    // Return YYYY-MM-DD to match database format
    return date.toISOString().split('T')[0];
};

export const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    // If already YYYY-MM-DD, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;

    // If DD/MM/YYYY, convert to YYYY-MM-DD
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    return dateString;
};

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

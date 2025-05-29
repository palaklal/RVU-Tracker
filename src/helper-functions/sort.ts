const sortObjectsByDate = (arr: any[]) => {
    return arr.sort((a:any, b:any) => {
        if (!a.Date && !b.Date) return 0;
        if (!a.Date) return 1;
        if (!b.Date) return -1;
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    });
};

const sortRowsByDate = ((rows: any) => {
    return rows.sort((a:any[], b:any[]) => {
        if (!a[1] && !b[1]) return 0; // Both dates are undefined
        if (!a[1]) return 1; // a[1] is undefined, b[1] is defined
        if (!b[1]) return -1; // b[1] is undefined, a[1] is defined
        return new Date(a[1]).getTime() - new Date(b[1]).getTime();
    });
});

export { sortObjectsByDate, sortRowsByDate };
export function formateDateIntoUTC(date: string | Date): string 
{
    const parsedDate = new Date(date);

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getUTCDate()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}


export function formateDate(date: string | Date): string 
{
    const parsedDate = new Date(date);

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}
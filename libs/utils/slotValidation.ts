import moment from 'moment';

export function validateTime(time: string) 
{
    const parsedTime = moment(time, 'hh:mm A');

    if (!parsedTime.isValid()) {
        return false;
    }

    // Convert to 24-hour format
    // return parsedTime.format('HH:mm');
    return true;
}

export function validateSlotTime(startTime: string, endTime: string) 
{
    const start = moment(startTime, 'hh:mm A');
    const end = moment(endTime, 'hh:mm A');

    if (!start.isValid() || !end.isValid()) {
        return false;
    }

    if (!end.isAfter(start)) {
        return false;
    }

    return true;
}


export const getSlotDays = (days:number) => {
    const datesArray = [];
    const today = moment().clone().add(1, "days");
  
    for (let i = 0; i <= days; i++) {
      const currentDate = today.clone().add(i, "days");
      datesArray.push({
        date: currentDate.format("DD"),
        month: currentDate.format("MMMM"),
        day: currentDate.format("ddd"),
        year: currentDate.format('YYYY')
      });
    }
  
    return datesArray;
  };
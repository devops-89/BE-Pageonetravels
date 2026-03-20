# Flight Fare Caluclation

Calculation of Comission: 
Comission is calulation on the Base Fare charge

Price showing breakup: 
Base Fare + commission 

total tax 

convenience charge

totalssrcharges 

publishedFare+commission


# Hotel Fare Calculation

```
  const calculateRoomPrice = (room) => {
  const totalFare = Number(room?.TotalFare || 0);
  const totalTax = Number(room?.TotalTax || 0);

  const percentage = Number(hotelPrice?.COMMISSION?.percentage || 0);
  const isFixed =
    hotelPrice?.COMMISSION?.commission_type === COMMISSION_TYPE.FIXED;

  let serviceCharge = 0;

  if (isFixed) {
    serviceCharge = percentage;
  } else {
    serviceCharge = (totalFare * percentage) / 100;
  }

  console.log("Hotel Detail Service charge:",serviceCharge);
  const finalAmount = totalFare + serviceCharge;

  return {
    totalFare,
    totalTax,
    serviceCharge,
    finalAmount,
  };
};

```
const control = {};

control.formatDateHoy = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

control.formatDateManana = (date) => {
  var d = new Date(date);
  let DIA_EN_MILISEGUNDOS = 24 * 60 * 60 * 1000;
  (d = new Date(d.getTime() + DIA_EN_MILISEGUNDOS)),
    (month = "" + (d.getMonth() + 1)),
    (day = "" + d.getDate()),
    (year = d.getFullYear());

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

control.getMonth = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1);
  if (month.length < 2) month = "0" + month;
  return month;
};

control.getAno = (date) => {
  var d = new Date(date);
  const year = d.getFullYear();
  return year;
};

control.monthToString = (month) => {
  let meses = [
    { value: "01", name: "ENE" },
    { value: "02", name: "FEB" },
    { value: "03", name: "MAR" },
    { value: "04", name: "ABR" },
    { value: "05", name: "MAY" },
    { value: "06", name: "JUN" },
    { value: "07", name: "JUL" },
    { value: "08", name: "AGO" },
    { value: "09", name: "SEPT" },
    { value: "10", name: "OCT" },
    { value: "11", name: "NOV" },
    { value: "12", name: "DIC" },
  ];
  const i = meses.findIndex((m) => m.value === month);
  if (i > -1) return meses[i].name;
  return month;
};

control.formatDateMonth = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, year].join("/");
};

control.formatDateYear = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year].join("/");
};

control.formatMonth = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1);
  if (month.length < 2) month = "0" + month;
  return month;
};

control.addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

control.removeMinutes = (date, minutes) => {
  var fecha = new Date(date);
  fecha.setMinutes(fecha.getMinutes() - minutes);
  return fecha;
};

control.addMinutes = (date, minutes) => {
  var fecha = new Date(date);
  fecha.setMinutes(fecha.getMinutes() + minutes);
  return fecha;
};

control.restDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

control.formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("/");
};

control.daysBetwenTwoDates = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);

  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;

  // Calculating the time difference between two dates
  const diffInTime = date2.getTime() - date1.getTime();

  // Calculating the no. of days between two dates
  const diffInDays = Math.ceil(diffInTime / oneDay);

  return diffInDays;
};

module.exports = control;

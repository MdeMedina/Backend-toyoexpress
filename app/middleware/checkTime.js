const { formatDateHoy, formatDateManana } = require("../helpers/dates/dates");
const { DateTime } = require("luxon");
const Time = require("../models/date");

const checkearTime = async (ahora) => {
  let ahora_mismo = ahora.split("-");
  ahora_mismo = `${ahora_mismo[0]}-${ahora_mismo[1]}-${ahora_mismo[2]}`;
  ahora_mismo = ahora_mismo.split("T");
  ahora_mismo = `${ahora_mismo[0]} ${ahora_mismo[1]}`;
  ahora_mismo = DateTime.fromSQL(ahora_mismo);
  // console.log(ahora_mismo);

  let malaHora = false;
  let date = await Time.find({});
  date = date[0];
  const { apertura, cierre } = date;

  let hoy_cierre;

  const hoy = `${formatDateHoy(new Date())} ${apertura}`; // 2022-10-25T10:00
  if (cierre < apertura) {
    hoy_cierre = `${formatDateManana(new Date())} ${cierre}`; // 2022-10-26T20:00
  } else {
    hoy_cierre = `${formatDateHoy(new Date())} ${cierre}`; // 2022-10-25T20:00
  }

  const apertura_final = DateTime.fromSQL(hoy);

  const cierre_final = DateTime.fromSQL(hoy_cierre);

  if (ahora_mismo >= cierre_final || ahora_mismo < apertura_final) {
    // FUERA DE AQUI
    malaHora = true;
    return {
      malaHora: malaHora,
      apertura: apertura,
      cierre: cierre,
    };
  } else {
    return malaHora;
  }
};

module.exports = {
  checkearTime,
};

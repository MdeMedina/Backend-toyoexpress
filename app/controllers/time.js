const Time = require("../models/date");


let _cache = null;
let _cacheAt = 0;
const TTL_MS = 60_000; // 1 minuto. Puedes subirlo a 5-10 min si casi no cambian.

const getTime = async (req, res) => {
  try {
    const now = Date.now();
    if (_cache && (now - _cacheAt) < TTL_MS) {
      // Respuesta desde caché, pero actualizamos serverNow para sincronía fina
      return res.status(200).json({ ..._cache, serverNow: Date.now() });
    }

    const doc = await Time.findOne({}, "apertura cierre updatedAt").lean();
    if (!doc) return res.status(404).json({ error: "please create a date!" });

    _cache = {
      apertura: doc.apertura,
      cierre: doc.cierre,
      updatedAt: doc.updatedAt
    };
    _cacheAt = now;

    // Esta cabecera no es imprescindible, pero ayuda a clientes
    res.set("Cache-Control", "private, max-age=60");
    return res.status(200).json({ ..._cache, serverNow: Date.now() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Llama a esto al final de updateTime
const invalidateTimeCache = () => { _cache = null; _cacheAt = 0; };


const updateTime = async (req, res) => {
  let dates = await Time.find({});
  dates = dates[0];
  const { body } = req;
  if (!dates) {
    const date = await Time.create({
      apertura: body.apertura,
      cierre: body.cierre,
    });
    res.status(200).send({
      response: `Horario creado con exito, abrira a las ${date.apertura} y cerrara a las ${date.cierre}`,
    });
  } else {
    dateId = dates._id;
    await Time.findOneAndUpdate(dateId, body, (err, updatedDate) => {
      if (err) {
        res
          .status(500)
          .send({ errorMessage: "error al actualizar el horario" });
      }
      {
        res.status(200).send({
          response: `Horario actualizado con exito, abrira a las ${body.apertura} y cerrara a las ${body.cierre}`,
        });
      }
    }).clone();
  }
};
module.exports = {getTime, invalidateTimeCache, updateTime };

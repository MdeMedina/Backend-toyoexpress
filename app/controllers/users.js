const { httpError } = require("../helpers/handleError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validateJwt = require("../middleware/validateJwt");
const signToken = require("../middleware/signToken");
const { checkearTime } = require("../middleware/checkTime");

const authUser = (req, res) => {
  res.send(req.user);
};

const actNumber = async(req, res) => {
  const { body } = req;
  const act = await User.findOneAndUpdate(
    { email: body.email },
    {
      cantidadM: body.cantidadM
    }
  );
  res.status(200).send("Usuario actualizado con exito");

}

const actNotificaciones = async(req, res) => {
  const { body } = req;
  const act = await User.findOneAndUpdate({
    email: body.email
  },
  {notificaciones: body.notificaciones}
  );
  res.status(200).send(act)
}

const loginUser = async (req, res) => {
  const { body } = req;
  try {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      res
        .status(403)
        .send({ errormessage: "ususario y/o contraseña inválida" });
    } else {
      const isMatch = await bcrypt.compare(body.password, user.password);
      if (isMatch) {
        if (user.permissions.obviarIngreso === false) {
          const check = await checkearTime();
          if (check.malaHora == true) {
            res.status(401).json({
              errormessage: `No se puede ingresar, el sitio abre de nuevo a las ${check.apertura}, por favor intentelo de nuevo a esa hora`,
            });
          } else {
            const signed = signToken(user._id);
            res.status(200).json({
              message:
                "El usuario a ingresado correctamente, sera redirigido a la pagina de inicio",
              key: signed,
              name: user.username,
              permissions: user.permissions,
              email: user.email,
              cantidadM: user.cantidadM,
              messageId: user.messageId
            });
          }
        } else {
          const signed = signToken(user._id);
          res.status(200).json({
            message:
              "El usuario a ingresado correctamente, sera redirigido a la pagina de inicio",
            key: signed,
            name: user.username,
            permissions: user.permissions,
            email: user.email,
            cantidadM: user.cantidadM,
            messageId: user.messageId
          });
        }
      } else {
        res
          .status(403)
          .send({ errormessage: "ususario y/o contraseña inválida" });
      }
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({ ok: true, users, count: users.length });
};

const registerUser = async (req, res) => {
  const { body } = req;
  try {
    const isUser = await User.findOne({ email: body.email });
    const users = await User.find({})
    if (isUser) {
      return res.status(403).send("usuario ya existe");
    }
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(body.password, salt);
    const user = await User.create({
      email: body.email,
      password: hashed,
      salt,
      username: body.username,
      permissions: body.permissions,
      cantidadM: 10,
      messageId: users.length + 1,
      notificaciones: []
    });
    const signed = signToken(user._id);
    res.status(201).send(user);
  } catch (e) {
    httpError(res, e);
  }
};

const actUser = async (req, res) => {
  const { body } = req;
  const act = await User.findOneAndUpdate(
    { _id: body._id },
    {
      email: body.email,
      username: body.username,
      permissions: body.permissions,
    }
  );
  res.status(200).send("Usuario actualizado con exito");
};
const deleteUsers = async (req, res) => {
  const { body } = req;
  const del = await User.findOneAndDelete({ _id: body._id });
  res.status(200).send(del);
};

module.exports = {
  registerUser,
  loginUser,
  authUser,
  getUsers,
  actUser,
  deleteUsers,
  actNumber,
  actNotificaciones
};

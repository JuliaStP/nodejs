const db = require("../database");
const { serializeUser } = require("../scripts/serialize");
const token = require("../auth/token");
const formidable = require("formidable");
const path = require("path");
const fsex = require("fs-extra");
const User = require("../database/schemas/user");
const bCrypt = require("bcryptjs");
const Jimp = require("jimp");
const fs = require("fs");
const util = require("util");
const { useFormControl } = require("@material-ui/core");
const { LensTwoTone } = require("@material-ui/icons");

module.exports.registration = async (req, res) => {
  const { username } = req.body;
  const user = await db.getUserByName(username);

  if (user) {
    return res.status(409).json({ message: "This user already exists" });
  }

  try {
    const newUser = await db.createUser(req.body);

    res.status(201).json(serializeUser(newUser));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports.login = async (req, res) => {
  const tokens = await token.createTokens(req.user);

  res.json({
    ...serializeUser(req.user), //gets user from db
    ...tokens,
  });
};

module.exports.getProfile = async (req, res) => {
  res.json({
    ...serializeUser(req.user),
  });
};

module.exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const form = new formidable.IncomingForm();
    const upload = path.join("./database", "upload");
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return next(err);
      }

      const resizePhoto = async (filePath) => {
        try {
          const fileDir = path.dirname(filePath);
          const pic = await Jimp.read(filePath);
          await pic.resize(250, 250);
          const nameImage = `${Date.now()}_250x250.png`;
          await pic.writeAsync(path.join(upload, nameImage));
          return path.join(fileDir, nameImage);
        } catch (e) {
          console.log("error: ", e);
        }
      };

      const readFile = util.promisify(fs.readFile);

      const toBase64 = {
        encode: async (pics, type = "image/jpeg") => {
          const pathToImage = path.join(process.cwd(), pics);
          const imageBitmap = await readFile(pathToImage);
          const encodeImage = `data:${type};base64,${Buffer.from(
            imageBitmap
          ).toString("base64")}`;

          return encodeImage;
        },
      };

      let user = req.user;
      let image = user.image;
      if (files.avatar) {
        const fileName = path.join(upload, files.avatar.name);
        fsex.moveSync(files.avatar.path, fileName);
        const resizePath = await resizePhoto(fileName);
        image = await toBase64.encode(resizePath, files.avatar.type);
      }

      let username = user.username

      const updateUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { ...fields, username, image },
        { new: true }
      )

      // const { oldPassword, newPassword } = fields;
      // let password = user.password;

      // if (oldPassword && newPassword) {
      //   let user = await User.findByIdAndUpdate(
      //     { _id: req.user.id },
      //     { oldPassword }
      //   );
      //   console.log(oldPassword);
        
      // }if (!user.validPassword(fields.oldPassword)) {
      //   res.status(400).json({ message: 'Invalid password' })
      // }
      // if (user.validPassword(fields.oldPassword)) {
      //   user.setPassword(newPassword);
      //   user = await user.save();
      //   return user;
      // } 

      const response = {
        id: updateUser._id,
        username: updateUser.userName,
        surName: updateUser.surName,
        firstName: updateUser.firstName,
        middleName: updateUser.middleName,
        permission: updateUser.permission,
        image: image,
      };

      const { oldPassword, newPassword, confirmPassword } = fields;
      let password = user.password;

      if (oldPassword && newPassword) {
        let user = await User.findByIdAndUpdate(
          { _id: req.user.id },
          { oldPassword }
        );
        if (!user.validPassword(oldPassword)) {
          res.status(400).json({ message: 'Invalid password' })
        }
        if (oldPassword === newPassword) {
          res.status(400).json({ message: 'New password can not be Old password' })
        }
        if (newPassword !== confirmPassword) {
          res.status(400).json({ message: 'Passwords do not match' })
        }
      }

      if (user.validPassword(fields.oldPassword)) {
        user.setPassword(newPassword);
        user = await user.save();
        return user;
      } 

      res.status(201).json(response);
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Oops, something went wrong" });
  }
};

module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.headers["authorization"];
  const tokens = await token.refreshTokens(refreshToken);

  res.json({
    ...tokens,
  });
};

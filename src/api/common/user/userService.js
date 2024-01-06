const UserRepository = require("./userRepository");
const bcrypt = require('bcrypt');
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const userSchema = require("./userSchema");
class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  validate(user, context) {
    let options = {
      abortEarly: false,
      context: context,
    };
    return userSchema.validateAsync(user, options);
  }

  getCount() {
    return this.repository.getCount();
  }

  findByEmail(email) {
    return this.repository.findByEmail(email);
  }

  findByUsername(username) {
    return this.repository.findByUsername(username);
  }

  findById(id, params = undefined) {
    return this.repository.findById(id, params);
  }

  addUser(user) {
    const AuthService = require("../auth/authService");
    const authService = new AuthService();

    return this.validate(user, {
      reqType: "POST",
    }).then(async () => {
      console.log('user', user)
      if (user.password) {
        const salt = await bcrypt.genSalt(15)
        user.password = await bcrypt.hash(user.password, salt);
        // const { salt, passwordHash } = await cipher.saltHashPassword(user.password);
        // user.salt = salt;
        // user.passwordHash = passwordHash;
      }
      const u = await this.repository.listAggregated({ email: user.email });
      if (u.length > 0) {
        throw {
          details: [
            {
              message: "User with this email already exists",
            },
          ],
        };
      }
      let newUser = await this.repository.add(user);
      console.log('new', newUser)
      return newUser;
    });
  }



  addMany(users) {
    return this.repository.addMany(users);
  }

  async editUser(id, user) {
    if (user.password) {
         const salt = await bcrypt.genSalt(15)
        user.password = await bcrypt.hash(user.password, salt);
    }
    const updatedUser = await this.repository.edit(id, user);
    return updatedUser;
  }

  async deleteUser(id) {
    const deleteDef = this.repository.delete(id);
    return deleteDef
  }

  changePassword(id, salt, passwordHash) {
    return this.repository.changePassword(id, salt, passwordHash);
  }

  list(filter) {
    return Promise.all([
      this.repository.listAggregated(filter),
      // this.repository.getCountFiltered(filter),
    ]).then(([data]) => {
      return {
        data: data,
        meta: {
          count: 0,
        },
      };
    });
  }


  randomPassword(length) {
    const lettersBig = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lettersSmall = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*()-+<>";
    const numbers = "0123456789";

    var pass = "";
    for (var x = 0; x < length; x++) {
      if (x === 0) {
        var i = Math.floor(Math.random() * lettersBig.length);
        pass += lettersBig.charAt(i);
      }

      if (x === 1) {
        var i = Math.floor(Math.random() * lettersSmall.length);
        pass += lettersSmall.charAt(i);
      }

      if (x === 2) {
        var i = Math.floor(Math.random() * symbols.length);
        pass += symbols.charAt(i);
      }

      if (x > 2) {
        var i = Math.floor(Math.random() * numbers.length);
        pass += numbers.charAt(i);
      }
    }

    console.log(pass);
    return pass;
  }

  findOne(params) {
    return this.repository.findByFilter(params);
  }
}

module.exports = UserService;

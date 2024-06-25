import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const startSession = (req, user) => {
    return new Promise((fulfill, reject) => {
      req.session.regenerate((err) => {
        if (!err) {
          req.session.user = user; 
          fulfill(user);
        } else {
          reject(err);
        }
      });
    });
  };


const endSession = (req) => {
    return new Promise((fulfill, reject) => {
      req.session.destroy((err) => {
        if (!err) {
            fulfill(null);
        }
        else {
            reject(err)
        }
      })
    });
};


const register = (username, email, password) => {
    return new Promise(async (fulfill, reject) => {
      if (password.length <= 8)
      {
        return reject({message: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS'})
      }
  
      const user = await User.findOne({username: username})
        
      if (user)
      {
        return reject({message: 'USERNAME ALREADY EXISTS, CHOOSE ANOTHER'})
      }
      
      const hash = bcrypt.hashSync(password, 8)
  
      const newUser = new User({
        username: username,
        password: hash,
        email: email
      }).save()
  
      return fulfill(newUser)
    });
}


const login = (username, password) => {
    return new Promise(async (fulfill, reject) => {
  
      const user = await User.findOne({username: username})
      if (!user) 
      {
        return reject({message: "USER NOT FOUND"})
      }
  
      if (bcrypt.compareSync(password, user.password))
      {
        return fulfill(user)
      }
      else
      {
        return reject({message: "INCORRECT PASSWORD"})
      }
  
    });
};


export  {
    startSession,
    endSession,
    register,
    login
  };
import mongoose from 'mongoose';

const SpendingList = mongoose.model('SpendingList');

const addNewList = (user, name, month) => {
    return new Promise(async (fulfill, reject) => {
        const list = await SpendingList.findOne({name: name, user: user.username})
        if (list) {
            return reject({message: "list name already exists for user; choose another"})
        }

        const newList = new SpendingList({
            user: user.username,
            name: name,
            month: month
          }).save()

          return fulfill(newList)
    });
}

const addItemToList = (listName, itemName, itemPrice) => {
    
}

export { addNewList }
const mongoose  =require('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema ({
    email: {type: String},
    password: {type: String}
});

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, 8);
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user',userSchema);
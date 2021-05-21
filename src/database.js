const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Streaming', {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
 .then(db => console.log('DB Streaming is connected'))
 .catch(err => console.error(err));

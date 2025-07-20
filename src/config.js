const dotenv = require('dotenv')
dotenv.config();

const config = {
    MONGODBURI: process.env.MONGO_URI,
    SECRETKEY: process.env.SECRET_KEY

}
module.exports = config
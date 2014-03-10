The OpenShift `nodejs` cartridge documentation can be found at:

https://github.com/openshift/origin-server/tree/master/cartridges/openshift-origin-cartridge-nodejs/README.md

SETUP INSTRUCTIONS
=====================
1. Make sure you have node (v >= 0.6.0) installed
2. Make sure you have mongodb installed
3. Run "npm install" from the root directory of the app to install dependencies
4. Start a mongo database ("mongod" in shell)
5. To run in debug mode (for development) use "node --debug server.js"

Dependencies:
Mongodb (v2.2)
Node (>= v0.6.0)

Node dependencies:
express
handlebars
mongoose
passport
less-middleware
bcrypt
nodemailer

Documentation:
Node: http://nodejs.org/
MongoDB: http://www.mongodb.org/
Express: http://expressjs.com/
mongoose: http://mongoosejs.com/
Less: http://lesscss.org/
less-middleware: https://github.com/emberfeather/less.js-middleware
Handlebars: http://handlebarsjs.com/
bcrypt: https://github.com/ncb000gt/node.bcrypt.js/
nodemailer: https://github.com/andris9/Nodemailer
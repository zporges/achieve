Achieve
=======
Millions of individuals have goals but struggle to achieve them. Research shows that writing down goals, sharing them with friends, and receiving feedback can increase the likelihood that these goals are achieved. However, there is limited research on technologies that support groups of friends working together toward goals. We are designing Achieve, a social application in which groups of friends can collaborate toward goal achievement. We have made novel design decisions involving persuasion and motivation due to our focus on previously established strong social ties. Achieve allows individuals to set personally achievable goals, yet encourages both collaboration and competition by allowing friends to compare measurable progress and hold each other accountable.

Install Locally
===============
- Install Node.js: http://nodejs.org
- Install MongoDB: http://www.mongodb.org
- $ npm install
  - installs other dependencies outlined in package.json

Running Locally
===============
- Start mongo
  - $ mongod
- Start server (production mode)
  - $ node server.js
- Start server (debug mode)
  - $ node server.js ­­debug

SETUP INSTRUCTIONS
=====================
1. Make sure you have node (v >= 0.6.0) installed
2. Make sure you have mongodb installed
3. Run "npm install" from the root directory of the app to install dependencies
4. Start a mongo database ("mongod" in shell)
5. To run in debug mode (for development) use "node --debug server.js"

Code Structure
==============
- The main server file is in achieve/server.js
- All of the dependencies are located in achieve/package.json
- achieve/src contains additional server files, less files, and views
  - achieve/src/server
    - routes.js sends data from the server to the client
      - all functions that are in the controller are put into routes.js
      - for each post or get there is a separate function
      - there are also some helper functions for emails and such
    - auth.js involves authentication for login
    - user.js and team.js are models that contain code for user and team
models to access the data
      - mongo collections are stored within model
  - achieve/src/views
    - all views are essentially html pages, but get server data using ejs
    - the ejs folder contains navbars and header that is included on other pages
  - achieve/src/less
    - less files compile to the css files in achieve/public/css
    - All additional less files should be included in index.less
- achieve/public contains the files that can be seen client­sid
  - achieve/public/js
    - javascript files, such as data visualizations
    - css -­ no need to touch this; it is automatically generated from less
    - images
- achieve/NLPj
  - NLP libraries and code for conjugating verbs to get past tense of goals and giving
advice recommendations
    - This code interacts with node through Server.java. Server.java is started by achieve/server.js by opening a socket.
    - VerbTense.java is used to conjugate verbs to past tense
    - The other Java files are for advice recommendation. The advice
recommendation system is built as an information retrieval system with crawlers, inverted indexes and more. It is started through Search.java. Beforehand: Train Classifier.java using its main function, Tten run Crawler.java with its main function.

Hosting
=======
- Currently on https://www.openshift.com
  - $1 per month -­ openshift includes 1gb free, but we needed a second gb for a
dollar per month to fit NLP libraries

Images
======
- Available at https://www.dropbox.com/sh/vextg6qmqdyr25u/2C1WfMi_51
- Structure of visual design:
  - Wireframe:
    - Wireframes folder
    - In Original Files folder:
      - Goals Research Application.ai
      - signuppage.ai
      - 11.02­signup_page.ai
  - Mockups:
    - PACT create new goal.psd
    - PACT goal checkin.psd
    - PACT Group Page Visual design.psd
    - PACT News Feed Visual Design.psd
    - PACT Notification.psd
    - MePage(settings).psd
    - MePage(progress).psd
    - PACT Alternate Comments.psd

Other details
=============
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

The OpenShift `nodejs` cartridge documentation can be found at:

https://github.com/openshift/origin-server/tree/master/cartridges/openshift-origin-cartridge-nodejs/README.md

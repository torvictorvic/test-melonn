const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

// ******************************** Settings
app.set('port',  process.env.PORT || 5000);

// ********************************* Middelwares
app.use(morgan('dev'));
app.use(express.json());

// ********************************* Routes
app.use('/api/tasks',require('./routes/task.routes'));


// ********************************* Stactic Files
console.log( path.join(__dirname,'/public') ); 
app.use(express.static(path.join(__dirname,'/public')));

// Run server
app.listen( app.get('port') ,  () => {

    console.log(`Server on port ${app.get('port')}`);

});

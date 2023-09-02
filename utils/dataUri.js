const DataUriParser= require('datauri/parser');
const path = require('path');

getDataUri=(file)=>{
    let parser = new DataUriParser();
    const extName=path.extname(file.originalname).toString();
    return parser.format(extName,file.buffer);
}

module.exports=getDataUri;
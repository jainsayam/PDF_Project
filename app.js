const express = require('express');
const upload = require('express-fileupload');
const fs = require('fs');
const hbs = require('hbs');
const converter = require('libreoffice-convert');
//Here is the change
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require('dotenv').config();

const app = express();
let currentFile = null;
let currentFileName=null;
let currentFileOriginal=null;

app.use("/pdfs",express.static(__dirname+"/pdfs"));
app.use("/views/css",express.static(__dirname+"/views/css"));
app.use(upload());
app.use(function(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.set('view engine', 'hbs');


app.get('/', function(req, res) {
  console.log("In get");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");

  let numOfConverts=parseInt(fs.readFileSync("./converted/number.txt").toString())
  res.render("home.hbs",{
    numOfConverted:numOfConverts,
  })
})
app.post('/upload', function(req,res){
  
  if(req.files){
    const file = req.files.upfile;
    let exp = /.doc$|.docx$|.docm$|.dot$|.dotm$|.dotx$/;

    if(exp.test(file.name)){
      const originalName=file.name;
      const fileName= file.name.slice(0,file.name.indexOf(".doc"));
      let output =`./pdfs/${fileName}.pdf`;
      let i=1;
      while(fs.existsSync(output)){
        output=`./pdfs/${fileName}(${i}).pdf`;
        i++;
      }
      //console.log(output);
      converter.convert(file.data,".pdf",undefined,(err,done)=>{
        if(err){
          console.log(err);
        }
        fs.writeFileSync(output,done);
        currentFile = output;
        currentFileOriginal=originalName;
        currentFileName=fileName;
        let numOfConverts= parseInt(fs.readFileSync("./converted/number.txt").toString());
        numOfConverts=numOfConverts+1;
        fs.writeFileSync("./converted/number.txt",numOfConverts.toString());
        

        res.render("home.hbs",{
          numOfConverted:numOfConverts,
          originalName: originalName,
          downloadFile:output,
          download:true
        })
      })
    }else{

      let numOfConverts=parseInt(fs.readFileSync("./converted/number.txt").toString())
      res.render("home.hbs",{
        numOfConverted:numOfConverts,
        mistake:"Not a WORD FILE!!!!",
      })
    }
    

  }
  else{
    
    let numOfConverts=parseInt(fs.readFileSync("./converted/number.txt").toString())
    res.render("home.hbs",{
      numOfConverted:numOfConverts,
      mistake:"No File selected!!!!",
    })
    
  }
})



  
app.listen(3000, () => {
  console.log("App is listening on url http://localhost:3000");
}); 
  
  
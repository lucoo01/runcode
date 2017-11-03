var express = require('express');
var app = express();
var process = require('child_process');
var bodyParser = require('body-parser');

var https = require('https');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var fs = require('fs');

var httpsServer = https.createServer({
        key: fs.readFileSync('./2_w3c.shanon.cc.key','utf8'),
        cert: fs.readFileSync('./1_w3c.shanon.cc_bundle.crt','utf8'),

},app);

var PORT = 8089;
var SSLPORT = 8089;

httpsServer.listen(SSLPORT, function(){
        console.log('HTTPS Server is running on hppts://localhost:%s',SSLPORT);
});

app.all('/', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/', function(req, res){

var lang = req.body.lang;
var code = req.body.code;
var classname = req.body.classname;



var langsuf = {
    'php' : {
        'suf': 'php',
        'cmd': 'php -f #{file}'
    },
    'ruby' : {
        'suf': 'rb',
        'cmd': 'ruby #{file}'
    },
    'python' : {
        'suf': 'py',
        'cmd': 'python #{file}'
    },
    'python3' : {
        'suf': 'py',
        'cmd': 'python3 #{file}'
    },
    'java' : {
        'suf': 'java',
        'cmd': 'javac #{file}; java -cp #{path} #{classname}'
    },
    'c' : {
        'suf': 'c',
        'cmd': 'gcc #{file} -o #{path}runc; #{path}runc'
    },
    'cpp' : {
        'suf': 'cpp',
        'cmd': 'g++ #{file} -o #{path}runcpp; #{path}runcpp'
    },
    'go' : {
        'suf': 'go',
        'cmd': 'go run #{file}'
    },
    'perl' : {
        'suf': 'pl',
        'cmd': 'perl #{file}'
    },
    'perl6' : {
        'suf': 'pl',
        'cmd': 'perl6 #{file}'
    },
};



if(typeof langsuf[lang] == 'undefined'){
        res.end('no support this language!!');
}

var filePath = '/root/soft/docker/';
var file,filename;
if(lang == 'java'){
    classname = classname.replace(/^\s+|\s+$/g,'');
    if(classname == ''){ 
        res.end('java param is error!!!');
        return;
    }
    filename = classname+'.'+langsuf[lang]['suf'];
    file = filePath+filename;
}else{
    filename = 'index.'+langsuf[lang]['suf'];
    file = filePath+filename;

}

writeFile(file, code);
var exec_cmd = langsuf[lang]['cmd'];
exec_cmd = exec_cmd.replace(/#{file}/g,file);
exec_cmd = exec_cmd.replace(/#{path}/g,filePath);
exec_cmd = exec_cmd.replace(/#{classname}/g,classname);
exec_cmd = exec_cmd.replace(/#{filename}/g,filename);

process.exec(exec_cmd, function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }

        res.end(stdout);

});

});



function writeFile(file, str){

    fs.writeFile(file, str, function(err){  
        if(err)  
            console.log("fail " + err);
    });
}

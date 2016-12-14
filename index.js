var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');

module.exports = function(md5HashFileReplace) {
     return through.obj(function(file, enc, callback) {
        var directory = path.dirname(file.path);
        var parsedFile = path.parse(file.path);
        
        // calcolo l'md5 del contenuto del file
        var md5Hash = getFileMd5(file);

        // cambio il nome del file includendo la parte md5 prima dell'estensione
        var hashedFilename = parsedFile.name + '.' + md5Hash + parsedFile.ext;
        gutil.log(hashedFilename);
        file.path = path.join(directory, hashedFilename);

        // sostituisco nel file indicato i riferimenti al file appena rinominato
        fs.readFile(md5HashFileReplace, 'utf8', function(err, data) {
            if (err) { return gutil.log(err); }
            
            var regExpString = parsedFile.name + '\.?[a-zA-Z0-9]*\\' + parsedFile.ext;
            var newContent = data.replace(new RegExp(regExpString, 'g'), hashedFilename);
            fs.writeFile(md5HashFileReplace, newContent, 'utf8', function(err) {
                if (err) { return gutil.log(err); }
            });
        });

        this.push(file);
        return callback();
    });
};

function getFileMd5(file) {
    var md5 = crypto.createHash('md5');
    md5.update(file.contents, 'utf8');
    return md5.digest('hex');
}
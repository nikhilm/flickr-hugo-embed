var ini = require('ini')
  , fs = require('fs')
  , flickrapi = require('flickrapi')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

flickrapi.tokenOnly({ api_key: config.api_key }, function(err, flickr) {
  if (process.argv.length < 3) {
    flickr.photosets.getList({ user_id: config.user_id }, function(err, response) {
      response.photosets.photoset.forEach(function(photoset) {
        console.log(photoset.id, photoset.title._content);
      });
      process.exit(0);
    });
  } else {
    var photosetId = process.argv[2];
    flickr.photosets.getPhotos({ user_id: config.user_id, photoset_id: photosetId }, function(err, response) {
      counter = response.photoset.photo.length;
      response.photoset.photo.forEach(function(photo) {
        dumpPhotoInfo(photo, function() {
          counter--;
          if (!counter) {
            process.exit(0);
          }
        });
      });
    })
  }

  function printHugoCaption(title, caption, link, source) {
    var sep = '"\n           "';
    var embed = '{{% flickr "' + title + sep + caption.replace('\n', ' ') + sep + link + sep + source + '" %}}';
    console.log(embed);
  }

  function dumpPhotoInfo(photo, cb) {
    flickr.photos.getInfo({ photo_id: photo.id }, function(err, response) {
      var photo_info = response.photo;
      flickr.photos.getSizes({ photo_id: photo.id }, function(err, response) {
        response.sizes.size.forEach(function(size) {
          if (size.label.toLowerCase() === config.size.toLowerCase()) {
            printHugoCaption(photo_info.title._content, photo_info.description._content, photo_info.urls.url[0]._content, size.source);
          }
        });
        cb();
      });
    });
  }
});

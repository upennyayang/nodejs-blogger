let DataUri = require('DataUri')

/**
  * Return a data rui given buffer data
*/
module.exports = function(contentType, data) {
    let dataUri = new DataUri()

    let image = dataUri.format(
        '.' + contentType.split('/').pop(),
        data
    )

    console.log("created image content", image.content)

    return image.content
}
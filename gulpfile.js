var gulp = require( 'gulp' );

const fs = require( 'fs' )
const jsdoc2md = require( 'jsdoc-to-markdown' )

gulp.task( 'generate-doc', ( done ) => {
  var templateFile= fs.readFileSync( './docs/api-template.hbs', 'utf8' )
  console.log(templateFile);
  
  var jsdocOptions = {
    files: './library/*.js', // specify where your files are
    //template: "ciao",
    template: templateFile,
    'example-lang': 'js', // specify the "@example" code block language
    noCache: false, // Bypass caching
  }

  const output = jsdoc2md.renderSync( jsdocOptions );
  fs.writeFileSync('./docs/api.md', output);
  return done()
} )
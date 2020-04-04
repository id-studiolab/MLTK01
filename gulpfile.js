var gulp = require( 'gulp' );

const fs = require( 'fs' )
const jsdoc2md = require( 'jsdoc-to-markdown' )



gulp.task( 'generate-doc', ( done ) => {

  console.log( fs.readFileSync( './docs/api-template.hbs', 'utf8' ) );

  const jsdocOptions = {
    template: fs.readFileSync( './docs/api-template.hbs', 'utf8' ),
    files: 'library/*.js', // specify where your files are
    'example-lang': 'js', // specify the "@example" code block language
    noCache: true, // Bypass caching
  }

  const output = jsdoc2md.renderSync( jsdocOptions );
  fs.writeFileSync( 'docs/api.md', output );
  return done();
} )